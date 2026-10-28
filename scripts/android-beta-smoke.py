"""Actual diagnostic Android app against the live beta service; synthetic grant only.

The invite comes from an encrypted Actions secret, never a source constant.
The operator revokes that synthetic grant after READY_FOR_ADMIN_REVOCATION.
"""
import importlib.util,json,os,re,subprocess,time,xml.etree.ElementTree as ET
spec=importlib.util.spec_from_file_location('android_smoke',os.path.join(os.path.dirname(__file__),'android-smoke.py'))
smoke=importlib.util.module_from_spec(spec)
spec.loader.exec_module(smoke)
adb,dump,tap,wait_text,text_of=smoke.adb,smoke.dump,smoke.tap,smoke.wait_text,smoke.text_of
out='artifacts/beta-smoke'

def _bounds(node):
    v=list(map(int,re.findall(r'\d+',node.attrib.get('bounds',''))))
    return v if len(v)==4 and v[2]>v[0] and v[3]>v[1] else None

def _find(predicate,seconds,scroll=True):
    # Search real viewport geometry, independent of the random case's length.
    until=time.monotonic()+seconds
    previous=None;direction=1;reversed_once=False;at_end=False
    while time.monotonic()<until:
        try:
            root=dump()
            found=predicate(root)
            if found is not None:return root,found
            panes=[(n,_bounds(n)) for n in root.iter() if n.attrib.get('scrollable')=='true']
            panes=[(n,b) for n,b in panes if b]
            if scroll and panes:
                pane,b=max(panes,key=lambda pair:(pair[1][2]-pair[1][0])*(pair[1][3]-pair[1][1]))
                signature=ET.tostring(pane,encoding='unicode')
                if signature==previous:
                    if not reversed_once:direction=-1;reversed_once=True
                    else:at_end=True
                previous=signature
                if not at_end:
                    x=(b[0]+b[2])//2;pad=max(8,(b[3]-b[1])//10)
                    low,high=b[1]+pad,b[3]-pad
                    start,end=(high,low) if direction==1 else (low,high)
                    adb('shell','input','swipe',str(x),str(start),str(x),str(end),'300')
        except (subprocess.CalledProcessError,ET.ParseError):pass
        time.sleep(.5)
    raise AssertionError('Native UI search timed out')

def wait_text(value,seconds=120):
    try:
        return _find(lambda root:root if value in text_of(root) else None,seconds,
                     scroll=not value.startswith('Beta completa'))[0]
    except AssertionError:
        raise AssertionError('UI text unavailable: '+value) from None

def tap(label,prefix=False):
    def match(root):
        matches=[]
        for node in root.iter():
            labels=[node.attrib.get('text',''),node.attrib.get('content-desc','')]
            if any(v.startswith(label) if prefix else v==label for v in labels):
                b=_bounds(node)
                if b and node.attrib.get('enabled','true')=='true':matches.append((node,b))
        if matches:return max(matches,key=lambda pair:pair[0].attrib.get('clickable')=='true')[1]
        return None
    try:_,b=_find(match,120)
    except AssertionError:raise AssertionError('Control unavailable: '+label) from None
    adb('shell','input','tap',str((b[0]+b[2])//2),str((b[1]+b[3])//2))
    time.sleep(1)

def snapshot(name):
    os.makedirs(out,exist_ok=True)
    with open(os.path.join(out,name+'.png'),'wb') as file:
        file.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
    with open(os.path.join(out,name+'.xml'),'w') as file:
        file.write(adb('shell','cat','/sdcard/fungo-ui.xml'))

def foreground():
    adb('shell','input','keyevent','KEYCODE_HOME')
    time.sleep(1)
    adb('shell','am','start','-W','-n','it.fungoitalia.app/.MainActivity')

def main():
    code=os.environ.get('FUNGO_BETA_SMOKE_INVITE','')
    if not re.fullmatch('[A-Za-z0-9_-]{43}',code):
        raise AssertionError('Synthetic beta invite secret is missing or malformed')
    adb('install','-r','artifacts/android/app-release.apk')
    adb('shell','wm','size','720x1280')
    adb('shell','wm','density','360')
    adb('shell','svc','wifi','enable');adb('shell','svc','data','enable')
    smoke.launch();tap('Abbonamento')
    wait_text('Beta per collaudatori invitati')
    tap('Codice personale dell’invito beta')
    try:
        adb('shell','input','text',code)
    except Exception:
        raise AssertionError('Could not enter synthetic invitation') from None
    adb('shell','input','keyevent','KEYCODE_BACK')
    tap('Attiva invito beta')
    # The footer shrinks after activation and its confirmation may scroll above
    # the viewport. The fixed application banner is the effective access state.
    wait_text('Beta completa · scadenza',45)
    print('PASS: real invitation redeemed and native beta active',flush=True)
    tap('Esame');wait_text('Esame e ripasso');tap('Inizia 15 casi')
    wait_text('Nome scientifico della risposta')
    tap('Nome scientifico della risposta');adb('shell','input','text','BetaDraft2026');adb('shell','input','keyevent','KEYCODE_BACK')
    wait_text('BetaDraft2026')
    # Backgrounding invalidates access before the offline foreground request.
    adb('shell','svc','wifi','disable');adb('shell','svc','data','disable');foreground()
    wait_text('Test Agaricus gratuito',30)
    assert 'Inizia 15 casi' not in text_of(dump())
    adb('shell','svc','wifi','enable');adb('shell','svc','data','enable');foreground()
    # The first foreground check can race Android network restoration. An
    # inactive session retries after 60s, with a 10s request timeout.
    try:
        wait_text('Beta completa · scadenza',90)
    except AssertionError:
        # Preserve the failure and inspect the client-owned error in its UI.
        snapshot('reconnect-failure')
        tap('Abbonamento');wait_text('Beta per collaudatori invitati')
        wait_text('Verifica beta')
        print('RECONNECT_BETA_DIAGNOSTIC: '+text_of(dump()),flush=True)
        snapshot('reconnect-beta-diagnostic')
        raise
    tap('Esame');wait_text('Esame e ripasso');tap('Riprendi sessione');wait_text('BetaDraft2026')
    print('PASS: offline foreground falls back to demo; reconnect restores saved photo draft',flush=True)
    # The exam-kind tabs stay visible above even long photo questionnaires.
    # Avoid searching for the photo menu button below an unbounded question.
    tap('Esame teorico');wait_text('Inizia test teorico');tap('Inizia test teorico')
    wait_text('Invia risposta teorica')
    # One real draft option; its selected label must return after a cold start.
    root=dump();options=[label for n in root.iter() for label in [n.attrib.get('text',''),n.attrib.get('content-desc','')] if label.startswith('○ ')]
    if not options:
        raise AssertionError('No theory answer option exposed to native accessibility')
    label=options[0];tap(label);selected='● '+label[2:];wait_text(selected)
    smoke.launch();wait_text('Beta completa · scadenza',45);tap('Esame');tap('Esame teorico');tap('Riprendi test teorico');wait_text(selected)
    snapshot('full-beta-before-revocation')
    print('PASS: native theory draft survives cold restart',flush=True)
    print('READY_FOR_ADMIN_REVOCATION: synthetic Android CI grant only',flush=True)
    # No injected timer or client entitlement: wait for its real online check.
    until=time.monotonic()+240
    while time.monotonic()<until:
        root=dump()
        if 'Test Agaricus gratuito' in text_of(root):
            break
        time.sleep(2)
    else:
        raise AssertionError('Owner revocation was not observed during the native test window')
    assert 'Beta completa · scadenza' not in text_of(root)
    assert 'Inizia 15 casi' not in text_of(root)
    wait_text('Inizia 4 casi');snapshot('revoked-beta-demo')
    with open(os.path.join(out,'result.json'),'w') as file:
        json.dump({'status':'PASS','scope':'actual Android35 diagnostic APK and live synthetic beta grant','checks':['native-redeem','full-photo-exam','offline-foreground-demo','online-draft-restore','theory-draft-cold-start','owner-revocation-online','demo-after-revocation']},file,indent=2)
    print('PASS: administrator revocation reaches actual native app and restores demo',flush=True)

if __name__=='__main__':
    try:
        main()
    except Exception:
        # Capture the actual failure state, redacting the synthetic bearer code.
        # Never photograph a screen if accessibility still exposes that code.
        try:
            root=dump();code=os.environ.get('FUNGO_BETA_SMOKE_INVITE','');safe=True
            for node in root.iter():
                for key,value in list(node.attrib.items()):
                    if code and code in value:
                        node.attrib[key]=value.replace(code,'[redacted]');safe=False
            os.makedirs(out,exist_ok=True)
            with open(os.path.join(out,'failure-ui.xml'),'w') as file:
                file.write(ET.tostring(root,encoding='unicode'))
            print('NATIVE_FAILURE_UI: '+text_of(root),flush=True)
            print('NATIVE_NETWORK_STATE: '+adb('shell','dumpsys','connectivity'),flush=True)
            if safe:
                with open(os.path.join(out,'failure.png'),'wb') as file:
                    file.write(subprocess.check_output(['adb','exec-out','screencap','-p']))
            print(adb('logcat','-d','-s','ReactNativeJS:E','AndroidRuntime:E').replace(code,'[redacted]') if code else 'No diagnostic code configured',flush=True)
        except Exception:
            print('Native failure diagnostics unavailable',flush=True)
        raise
    finally:
        # An invitation input is secureTextEntry, but avoid dumping any screen
        # before successful activation clears that field.
        adb('shell','svc','wifi','enable');adb('shell','svc','data','enable')
