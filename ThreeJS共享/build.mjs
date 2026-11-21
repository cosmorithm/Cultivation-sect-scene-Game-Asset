import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {PNG} from 'pngjs';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
class PixelCanvas {
  getContext(){return {putImageData:image=>{this.pixels=image.data;}};}
  async convertToBlob(){
    const png=PNG.sync.write({width:this.width,height:this.height,data:Buffer.from(this.pixels)});
    return new Blob([png],{type:'image/png'});
  }
}
globalThis.OffscreenCanvas=PixelCanvas;
globalThis.ImageData=class{constructor(data,width,height){Object.assign(this,{data,width,height});}};
globalThis.FileReader=class{async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.();}};

const scriptEscape=s=>s.replace(/<\/script/gi,'<\\/script');
async function bundle(entry,globalName){
  const output=await build({entryPoints:[entry],bundle:true,write:false,globalName,
    format:'iife',minify:true,target:'es2021',legalComments:'inline',logLevel:'silent'});
  return scriptEscape(output.outputFiles[0].text);
}
const staticResources=async()=>{
  const licensePath=path.resolve(path.dirname(require.resolve('three')),'../LICENSE');
  const [studio,template,license]=await Promise.all([bundle(path.join(here,'studio.mjs'),'SectStudio'),
    fs.readFile(path.join(here,'preview.html'),'utf8'),fs.readFile(licensePath,'utf8')]);
  return template.replace('/* STUDIO */',()=> '/*! '+license+' */\n'+studio);
};
let templatePromise;
export async function buildOne(dir){
  const folder=path.basename(dir),id=folder.slice(0,3),title=folder.replace('_',' ');
  const file=path.join(dir,'ThreeJS','model.mjs');
  const model=await import(pathToFileURL(file));
  const root=model.buildAsset(T);
  if(!root?.isObject3D)throw Error('buildAsset must return an Object3D: '+id);
  if(!root.name)root.name=id;
  const drawings=(await fs.readdir(dir)).filter(n=>/^(主殿)?三视图.*\.png$|^效果示意.*\.png$/.test(n));
  const version=n=>Number(n.match(/-v(\d+)/)?.[1]??0);
  drawings.sort((a,b)=>version(b)-version(a));
  if(!drawings.length)throw Error('Missing reference image: '+id);
  const fileName=drawings[0];
  const reference={file:fileName,sha256:createHash('sha256').update(await fs.readFile(path.join(dir,fileName))).digest('hex')};
  root.userData.reference=reference;
  root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(root,true);
  if(bounds.isEmpty()||!bounds.max.toArray().concat(bounds.min.toArray()).every(Number.isFinite))throw Error('Invalid bounds: '+id);
  let meshes=0,triangles=0;
  const mats=new Set();
  root.traverse(o=>{
    if(!o.isMesh)return;
    const g=o.geometry,p=g.getAttribute('position');
    if(!p||p.count<3)throw Error('Missing geometry: '+o.name);
    for(const a of Object.values(g.attributes)){
      if(!a.array.every(Number.isFinite))throw Error('Non-finite attribute: '+o.name);
    }
    meshes++;triangles+=(g.index?.count??p.count)/3;
    for(const m of [].concat(o.material))mats.add(m);
  });
  if(!meshes||!Number.isInteger(triangles))throw Error('Invalid mesh count: '+id);
  const [glb,js,template]=await Promise.all([new GLTFExporter().parseAsync(root,{binary:true,animations:root.animations??[]}),
    bundle(file,'SectModel'),templatePromise??=staticResources()]);
  const html=template.replaceAll('{{TITLE}}',title).replace('{{REFERENCE}}',encodeURIComponent(fileName)).replace('/* MODEL */',
    ()=>js+'\nSectStudio.openPreview(SectModel,'+JSON.stringify(title)+');');
  await fs.writeFile(path.join(dir,id+'.glb'),Buffer.from(glb));
  await fs.writeFile(path.join(dir,'交互预览.html'),html);
  return {id,folder,reference,meshes,triangles,materials:mats.size,clips:(root.animations??[]).length,
    bounds:[bounds.min.toArray(),bounds.max.toArray()],style:model.presentation??{}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const dirs=await fs.readdir(path.dirname(here));
  for(const id of process.argv.slice(2)){
    const dir=dirs.find(name=>name.startsWith(id+'_'));
    if(!dir)throw Error('Unknown asset '+id);
    console.log(JSON.stringify(await buildOne(path.join(here,'..',dir))));
  }
  if(process.argv.length===2)console.log('npm run build -- A02 A03');
}
