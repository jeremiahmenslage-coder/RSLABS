import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {join,extname,resolve,sep} from 'node:path';
const root=resolve(process.argv[2]||'.');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
  try{
    let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(path.endsWith('/')) path+='index.html';
    const file=resolve(join(root,path.replace(/^\/+/,'')));
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
    const info=await stat(file);
    if(!info.isFile()) throw Error('Not file');
    const bytes=await readFile(file);
    res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});
    res.end(bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Phase 0 spike: http://127.0.0.1:${port}/ (${root})`));
