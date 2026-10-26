import os,re,subprocess,time,struct,zlib,xml.etree.ElementTree as ET
def adb(*args):
    return subprocess.check_output(['adb',*args],text=True,stderr=subprocess.STDOUT)
def dump():
    adb('shell','uiautomator','dump','/sdcard/fungo-ui.xml')
    return ET.fromstring(adb('shell','cat','/sdcard/fungo-ui.xml'))
def text_of(root):
    return ' '.join((n.attrib.get('text','')+' '+n.attrib.get('content-desc','')) for n in root.iter())
def swipe_up(gentle=False):
    size=adb('shell','wm','size')
    width,height=map(int,re.findall(r'(\d+)x(\d+)',size)[-1])
    adb('shell','input','swipe',str(width//2),str(height*3//4),str(width//2),str(height*3//5 if gentle else height//3),'350')
    time.sleep(1)
def dismiss_launcher_anr(root):
    # A system launcher ANR can cover a running app on fresh CI emulators.
    # Never dismiss a Fungo Italia ANR or treat it as a successful app launch.
    if "Pixel Launcher isn't responding" not in text_of(root): return False
    for node in root.iter():
        if node.attrib.get('resource-id')=='android:id/aerr_close':
            nums=list(map(int,re.findall(r'\d+',node.attrib.get('bounds',''))))
            adb('shell','input','tap',str((nums[0]+nums[2])//2),str((nums[1]+nums[3])//2))
            adb('shell','am','start','-W','-n','it.fungoitalia.app/.MainActivity')
            time.sleep(1)
            return True
    return False
def wait_text(value,seconds=40):
    until=time.time()+seconds
    tries=0
    while time.time()<until:
        try:
            root=dump()
            if dismiss_launcher_anr(root): continue
            if value in text_of(root): return root
            if tries>=2: swipe_up(gentle=True)
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
    adb('shell','am','start','-W','-n','it.fungoitalia.app/.MainActivity')
    wait_text('Ciao',90)

def scroll_top():
    size=adb('shell','wm','size')
    width,height=map(int,re.findall(r'(\d+)x(\d+)',size)[-1])
    previous=None
    for _ in range(15):
        current=ET.tostring(dump(),encoding='unicode')
        if current==previous:
            break
        previous=current
        # The detail header occupies the upper third on the compact emulator.
        # Start within the scrollable body, not on its fixed navigation controls.
        adb('shell','input','swipe',str(width//2),str(height*3//5),str(width//2),str(height*4//5),'250')
        time.sleep(.3)
def main():
    adb('install','-r','artifacts/android/app-release.apk')
    adb('shell','wm','size','720x1280')
    adb('shell','wm','density','360')
    adb('shell','svc','wifi','disable')
    adb('shell','svc','data','disable')
    launch()
    tap('Studio')
    wait_text('Studio e atlante')
    wait_text('Demo gratuita · Agaricus')
    tap('Cerca nome scientifico, comune o sinonimo')
    adb('shell','input','text','Agaricus')
    adb('shell','input','keyevent','KEYCODE_BACK')
    time.sleep(2)
    tap('Apri Agaricus',prefix=True)
    scroll_top()
    wait_text('Caratteri di studio')
    scroll_top()
    tap('Salva preferito')
    wait_text('Rimuovi preferito')
    wait_text('Caratteri di studio')
    tap('Torna alle schede')
    tap('Aree')
    scroll_top()
    areas=wait_text('Aree e habitat')
    assert 'Fungo Italia completo' not in text_of(areas), 'Free Areas must not open the subscription screen'
    wait_text('71 macroaree in 20 regioni')
    tap('Monte Amiata')
    wait_text('1 area corrispondente')
    tap('Consulta Monte Amiata')
    wait_text('Faggeta · Castagneto · Querceto')
    tap('Chiudi dettaglio')
    tap('Percorso')
    wait_text('Ciao')
    tap('Abbonamento')
    wait_text('Fungo Italia completo')
    launch()
    tap('Studio')
    wait_text('1 preferito')
    wait_text('Demo gratuita · Agaricus')
    os.makedirs('artifacts/smoke',exist_ok=True)
    with open('artifacts/smoke/android-offline.png','wb') as f:
        f.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
    with open('artifacts/smoke/ui.xml','w') as f:
        f.write(adb('shell','cat','/sdcard/fungo-ui.xml'))
    # Android has no verified billing: free Areas do not unlock the premium exam.
    tap('Esame')
    wait_text('Test Agaricus gratuito')
    exam=wait_text('Inizia 4 casi')
    assert 'Inizia 15 casi' not in text_of(exam), 'Premium exam must remain inaccessible without verified billing'
    print('PASS: free four-case Agaricus test and Areas/habitats are accessible; premium exam remains gated.')
    print('PASS: Percorso cold start offline, Agaricus search/detail and favorites persist after restart.')
try:
    main()
finally:
    os.makedirs('artifacts/smoke',exist_ok=True)
    try:
        print('Final native UI:',text_of(dump()))
        print(adb('logcat','-d','-s','ReactNativeJS:E','AndroidRuntime:E'))
        with open('artifacts/smoke/android-final.png','wb') as f:
            f.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
        with open('artifacts/smoke/final-ui.xml','w') as f:
            f.write(adb('shell','cat','/sdcard/fungo-ui.xml'))
    except Exception as error:
        with open('artifacts/smoke/capture-error.txt','w') as f: f.write(str(error))
