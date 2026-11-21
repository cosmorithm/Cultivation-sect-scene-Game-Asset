import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const here = name => fileURLToPath(new URL(name,import.meta.url));
const result = await build({
  entryPoints:[here('./viewer.mjs')],bundle:true,minify:true,format:'iife',
  legalComments:'inline',write:false,target:'es2021'
});
const template = await fs.readFile(here('./viewer-page.html'),'utf8');
const license = await fs.readFile(here('./node_modules/three/LICENSE'),'utf8');
const js = result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
await fs.writeFile(process.argv[2]||here('../A01_主殿_交互预览.html'),
  template.replace('/* A01_VIEWER_BUNDLE */',()=> '/*! '+license+' */\n'+js));
