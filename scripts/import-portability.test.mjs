import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../src/',import.meta.url));
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(resolve(dir,entry.name)):[resolve(dir,entry.name)]);}
const files=walk(root), exact=new Set(files),folded=new Map(files.map(path=>[path.toLowerCase(),path]));
// Vite's default extension order; Windows resolves names without case sensitivity.
const extensions=['.mjs','.js','.mts','.ts','.jsx','.tsx','.json'];
test('relative module imports resolve to the same file on Linux and Windows',()=>{
 for(const file of files.filter(path=>/\.[cm]?[jt]sx?$/.test(path))){
  const source=readFileSync(file,'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*)["'](\.[^"']+)["']/g)){
   const specifier=match[1];if(extname(specifier))continue;
   const target=resolve(dirname(file),specifier);
   const candidates=[...extensions.map(ext=>target+ext),...extensions.map(ext=>resolve(target,'index'+ext))];
   const linux=candidates.find(path=>exact.has(path));
   const windows=candidates.map(path=>folded.get(path.toLowerCase())).find(Boolean);
   assert.ok(linux,`Unresolved relative import ${specifier} in ${file}`);
   assert.equal(windows,linux,`Case-sensitive import conflict: ${specifier} in ${file}`);
  }
 }
});
