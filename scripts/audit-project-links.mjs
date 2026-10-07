import { readFile, writeFile, mkdir } from 'node:fs/promises';
const html=await readFile('index.html','utf8');
const urls=[...new Set([...html.matchAll(/href="(https:\/\/(?:github\.com\/viniciuslks7\/(?:Keel|API-Starwars|Aulas-de-React)|viniciuslks7\.github\.io\/Keel\/)[^"]*)"/g)].map(m=>m[1]))];
const results=[];
for(const url of urls){
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
    const body=await response.text();
    results.push({url,status:response.status,finalUrl:response.url,title:body.match(/<title[^>]*>([^<]*)/i)?.[1]||null});
  }catch(e){results.push({url,error:e.message});}
}
await mkdir('test-results',{recursive:true});
await writeFile('test-results/project-link-audit.json',JSON.stringify({generatedAt:new Date().toISOString(),notes:'Unauthenticated GET only; HTTP success is not validation of the pending Keel PR or an unpublished Auxilium replacement.',results},null,2));
console.log(JSON.stringify(results,null,2));
