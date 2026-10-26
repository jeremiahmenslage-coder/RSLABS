"""Checks build-served local PNG/WebP and source under HTTP, NOT a browser E2E."""
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError
import subprocess, time, os, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
ASSETS=['public/icons/sample-sail.png','public/icons/sample-ring.webp','public/icons/sample-alternate.png',
        'src/assets/resolve.js','src/catalog/reference.js','src/main.js','index.html']
port='43019'
server=subprocess.Popen(['node','scripts/serve.mjs','dist'],cwd=ROOT,env={**os.environ,'PORT':port},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(50):
        try:
            with urlopen(f'http://127.0.0.1:{port}/index.html',timeout=2) as resp: resp.read()
            break
        except Exception: time.sleep(.1)
    for asset in ASSETS:
        with urlopen(f'http://127.0.0.1:{port}/{asset}',timeout=3) as resp:
            data=resp.read()
            assert resp.status==200
            if asset.endswith('.png'): assert resp.headers['Content-Type']=='image/png' and data[1:4]==b'PNG'
            if asset.endswith('.webp'): assert resp.headers['Content-Type']=='image/webp' and data[8:12]==b'WEBP'
            expected=(ROOT/'dist'/asset).read_bytes()
            assert data==expected
            print('PASS',asset,resp.headers['Content-Type'],len(data),'bytes',hashlib.sha256(data).hexdigest()[:12])
    try:
        urlopen(f'http://127.0.0.1:{port}/public/icons/does-not-exist.png',timeout=3)
        raise AssertionError('Expected 404 for broken icon')
    except HTTPError as ex:
        assert ex.code==404
        print('PASS nonexistent asset returns HTTP 404 (browser fallback tested separately)')
finally:
    server.terminate();server.wait(timeout=5)
