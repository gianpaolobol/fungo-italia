import os,re,subprocess,time,xml.etree.ElementTree as ET
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
