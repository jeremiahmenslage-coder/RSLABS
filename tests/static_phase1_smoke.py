"""Tests the actual node HTTP server and a static production build, not browser navigation."""
import pathlib, subprocess, os, urllib.request, urllib.error, time, json
ROOT=pathlib.Path(__file__).resolve().parents[1]
RESULTS=[]

def check(url,code,mime):
 try:
  with urllib.request.urlopen(url,timeout=4) as r:
   body=r.read();actual=r.status;ctype=r.headers.get('content-type','')
 except urllib.error.HTTPError as e:
  body=e.read();actual=e.code;ctype=e.headers.get('content-type','')
 ok=actual==code and (mime is None or mime in ctype) and (bool(body) if code==200 else True)
 RESULTS.append({'url':url,'status':actual,'mime':ctype,'pass':ok})

if __name__=='__main__':
 subprocess.run(['node','scripts/build.mjs'],cwd=ROOT,check=True)
 env={**os.environ,'PORT':'4319'}
 proc=subprocess.Popen(['node','scripts/serve.mjs','dist'],cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 try:
  time.sleep(.4)
  assert proc.poll() is None,'Server exits unexpectedly';
  base='http://127.0.0.1:4319'
  for path,mime in [('/','text/html'),('/src/main.js','text/javascript'),('/src/model/actions.js','text/javascript'),('/src/state/store.js','text/javascript'),('/src/storage/indexeddb.js','text/javascript'),('/src/ui/graph.js','text/javascript'),('/src/ui/inspector.js','text/javascript'),('/src/style.css','text/css'),('/public/icons/sample-sail.png','image/png'),('/public/icons/sample-ring.webp','image/webp')]:check(base+path,200,mime)
  check(base+'/public/icons/missing-file.png',404,None)
 finally:proc.terminate();proc.wait(timeout=4)
 print(json.dumps({'result':RESULTS,'passed':sum(x['pass'] for x in RESULTS),'total':len(RESULTS)},indent=2))
 raise SystemExit(0 if all(x['pass'] for x in RESULTS) else 1)
