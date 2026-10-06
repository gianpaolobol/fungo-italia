import os,re,subprocess,time,struct,zlib,xml.etree.ElementTree as ET
def adb(*args):
    return subprocess.check_output(['adb',*args],text=True,stderr=subprocess.STDOUT)
def dump():
    adb('shell','uiautomator','dump','/sdcard/fungo-ui.xml')
    return ET.fromstring(adb('shell','cat','/sdcard/fungo-ui.xml'))
def text_of(root):
    return ' '.join((n.attrib.get('text','')+' '+n.attrib.get('content-desc','')) for n in root.iter())
def swipe_up():
    size=adb('shell','wm','size')
    width,height=map(int,re.findall(r'(\d+)x(\d+)',size)[-1])
    adb('shell','input','swipe',str(width//2),str(height*3//4),str(width//2),str(height//3),'350')
    time.sleep(1)
def wait_text(value,seconds=40):
    until=time.time()+seconds
    tries=0
    while time.time()<until:
        try:
            root=dump()
            if value in text_of(root): return root
            if tries>=2: swipe_up()
        except (subprocess.CalledProcessError,ET.ParseError): pass
        tries+=1
        time.sleep(1)
    raise AssertionError('UI text unavailable: '+value)
def tap(label,prefix=False):
    for attempt in range(7):
        root=dump()
        for node in root.iter():
            labels=[node.attrib.get('text',''),node.attrib.get('content-desc','')]
            if any(v.startswith(label) if prefix else v==label for v in labels):
                nums=list(map(int,re.findall(r'\d+',node.attrib.get('bounds',''))))
                if len(nums)==4 and nums[2]>nums[0] and nums[3]>nums[1]:
                    adb('shell','input','tap',str((nums[0]+nums[2])//2),str((nums[1]+nums[3])//2))
                    time.sleep(1)
                    return
        swipe_up()
    raise AssertionError('Control unavailable: '+label)
def launch():
    adb('shell','am','force-stop','it.fungoitalia.app')
    adb('shell','monkey','-p','it.fungoitalia.app','-c','android.intent.category.LAUNCHER','1')
    wait_text('Studio e atlante')

def scroll_top():
    size=adb('shell','wm','size')
    width,height=map(int,re.findall(r'(\d+)x(\d+)',size)[-1])
    for _ in range(3):
        adb('shell','input','swipe',str(width//2),str(height//3),str(width//2),str(height*3//4),'250')
        time.sleep(.3)
def seed_photos():
    os.makedirs('artifacts/smoke/fixtures',exist_ok=True)
    adb('shell','mkdir','-p','/sdcard/Pictures/FungoItaliaTest')
    def chunk(kind,data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    for i,color in enumerate([(80,130,70),(160,100,70)],1):
        path='artifacts/smoke/fixtures/scatto'+str(i)+'.png'
        pixels=b''.join(b'\x00'+bytes(color)*180 for _ in range(180))
        png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',180,180,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(pixels))+chunk(b'IEND',b'')
        with open(path,'wb') as f: f.write(png)
        remote='/sdcard/Pictures/FungoItaliaTest/scatto'+str(i)+'.png'
        adb('push',path,remote)
        adb('shell','am','broadcast','-a','android.intent.action.MEDIA_SCANNER_SCAN_FILE','-d','file://'+remote)
    for _ in range(20):
        rows=adb('shell','content','query','--uri','content://media/external/images/media','--projection','_display_name')
        if 'scatto1.png' in rows and 'scatto2.png' in rows: break
        time.sleep(1)
    else: raise AssertionError('Gallery fixtures not indexed')
    adb('shell','pm','grant','it.fungoitalia.app','android.permission.READ_MEDIA_IMAGES')
def check_photo_review():
    seed_photos()
    tap('Foto')
    tap('Autorizza e indicizza Foto')
    wait_text('2 foto indicizzate')
    scroll_top()
    tap('Prepara coda visuale 3+1')
    wait_text('Coda 3+1 pronta:')
    tap('3+1')
    wait_text('2 scatti selezionati')
    wait_text('Fotografia 1')
    time.sleep(3)
    ui=text_of(dump())
    assert 'Fotografia non disponibile' not in ui and 'Fotografia non visualizzabile' not in ui,'Native thumbnail failed'
    with open('artifacts/smoke/android-native-photos.png','wb') as f:
        f.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
    tap('Rimuovi scatto 2 dalla bozza')
    wait_text('1 scatti selezionati')
    time.sleep(2)
    launch()
    tap('3+1')
    wait_text('1 scatti selezionati')
    wait_text('Fotografia 1')
    with open('artifacts/smoke/android-photo-review-persisted.png','wb') as f:
        f.write(subprocess.check_output(['adb','exec-out','screencap','-p']))

def main():
    adb('install','-r','artifacts/android/app-release.apk')
    adb('shell','wm','size','720x1280')
    adb('shell','wm','density','360')
    adb('shell','svc','wifi','disable')
    adb('shell','svc','data','disable')
    launch()
    wait_text('148 schede')
    tap('Cerca nome scientifico, comune o sinonimo')
    adb('shell','input','text','Amanita')
    adb('shell','input','keyevent','KEYCODE_BACK')
    time.sleep(2)
    tap('Apri Amanita',prefix=True)
    wait_text('Rango:')
    tap('Salva preferito')
    wait_text('Rimuovi preferito')
    wait_text('Caratteri di studio')
    tap('Torna alle schede')
    tap('Aree')
    wait_text('71 macroaree')
    tap('Monte Amiata')
    wait_text('1 area corrispondente')
    time.sleep(2)
    launch()
    root=wait_text('1 preferito')
    assert '148 schede' in text_of(root),'Offline catalog count unavailable after restart'
    os.makedirs('artifacts/smoke',exist_ok=True)
    with open('artifacts/smoke/android-offline.png','wb') as f:
        f.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
    with open('artifacts/smoke/ui.xml','w') as f:
        f.write(adb('shell','cat','/sdcard/fungo-ui.xml'))
    check_photo_review()
    print('PASS: seeded native gallery, image rendering, manual removal and review persistence.');
    print('PASS: native APK cold-start offline, catalog search, detail, favorite persistence after process restart and Amiata macroarea.')
try:
    main()
finally:
    os.makedirs('artifacts/smoke',exist_ok=True)
    try:
        with open('artifacts/smoke/android-final.png','wb') as f:
            f.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
        with open('artifacts/smoke/final-ui.xml','w') as f:
            f.write(adb('shell','cat','/sdcard/fungo-ui.xml'))
    except Exception as error:
        with open('artifacts/smoke/capture-error.txt','w') as f: f.write(str(error))
