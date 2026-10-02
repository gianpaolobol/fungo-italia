import base64,json,os,subprocess
path='artifacts/smoke/android-final.png'
if os.path.exists(path):
    with open(path,'rb') as f: encoded=base64.b64encode(f.read()).decode()
    with open('artifacts/smoke/blob-request.json','w') as f: json.dump({'content':encoded,'encoding':'base64'},f)
    output=subprocess.check_output(['gh','api','--method','POST','repos/'+os.environ['GITHUB_REPOSITORY']+'/git/blobs','--input','artifacts/smoke/blob-request.json'],text=True)
    blob=json.loads(output)
    print('Native screenshot Git blob SHA: '+blob['sha'])
    os.remove('artifacts/smoke/blob-request.json')
