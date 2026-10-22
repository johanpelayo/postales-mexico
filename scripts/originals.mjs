import {createHash} from 'node:crypto';
import {parseCsv} from './csv.mjs';
import {validatePublishedRounding} from './participation.mjs';
export const canonicalEntity=name=>name==='México'?'Estado de México':name;
export function parseOriginal(bytes){
 if(bytes[0]!==0xff||bytes[1]!==0xfe||bytes.length%2)throw new Error('Se esperaba UTF-16LE con BOM, sin alteración del original.');
 return parseCsv(bytes.subarray(2).toString('utf16le'),'\t');
}
const rate=value=>{if(!/^\d{1,3}\.\d%$/.test(value??''))throw new Error('Porcentaje publicado inválido o precisión inesperada.');const n=Number(value.slice(0,-1));if(n<0||n>100)throw new Error('Porcentaje fuera de rango.');return n;};
const count=value=>{if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value??''))throw new Error('Conteo original inválido.');const n=Number(value.replaceAll(',',''));if(!Number.isSafeInteger(n))throw new Error('Conteo fuera de rango.');return n;};
export function bindOriginalFiles(transformed,manifest,readBytes){
 if(manifest.schemaVersion!==1||manifest.files.length!==3||new Set(manifest.files.map(f=>f.groupId)).size!==3||new Set(manifest.files.map(f=>f.file)).size!==3)throw new Error('Se requieren tres originales y grupos únicos.');
 const catalogNames=new Set(transformed.map(s=>s.catalog.name));
 const entries=manifest.files.map(file=>{
  if(!['18-19','20-24','25-29'].includes(file.groupId))throw new Error('Grupo original no permitido.');
  const bytes=readBytes(file.file),sha256=createHash('sha256').update(bytes).digest('hex');
  if(sha256!==file.sha256)throw new Error(`Hash alterado: ${file.file}`);
  const rows=parseOriginal(bytes);
  if(rows.length!==32||new Set(rows.map(r=>canonicalEntity(r.Estado))).size!==32||rows.some(r=>!catalogNames.has(canonicalEntity(r.Estado))||r['Año']!=='2024'))throw new Error('Entidad, año o número de filas del original incorrectos.');
  const parsed=rows.map((r,index)=>({entityName:canonicalEntity(r.Estado),year:2024,ratePct:rate(r['% Participación']),abstentionPct:rate(r['% Abstención']),nonSpecifiedPct:rate(r['% Votos no esp.']),registered:count(r['Lista nominal']),voted:count(r['Sí votaron']),row:index+2}));
  const candidates=['18-19','20-24','25-29'].filter(group=>parsed.every(r=>{
   const state=transformed.find(s=>s.catalog.name===r.entityName),o=state.observations.find(o=>o.id===group);
   return o.ratePct===r.ratePct&&o.counts.registered===r.registered&&o.counts.voted===r.voted;
  }));
  if(candidates.length!==1||candidates[0]!==file.groupId)throw new Error(`Correspondencia de edad no única o errónea: ${file.file}`);
  return {...file,parsed,matchedRows:32,groupEvidence:manifest.groupEvidence};
 });
 const states=transformed.map(state=>{
  const diagnostics=[];
  const observations=state.observations.map(o=>{
   const source=entries.find(f=>f.groupId===o.id),row=source.parsed.find(r=>r.entityName===state.catalog.name);
   diagnostics.push({groupId:o.id,sourceFile:source.file,sourceRow:row.row,...validatePublishedRounding({registered:row.registered,voted:row.voted},row.ratePct,row.nonSpecifiedPct,row.abstentionPct)});
   return {...o,ratePct:row.ratePct,abstentionPct:row.abstentionPct,nonSpecifiedPct:row.nonSpecifiedPct,source:{...o.source,consolidatedFile:o.source.file,consolidatedColumn:o.source.column,file:source.file,row:row.row,column:'% Participación',groupEvidence:source.groupEvidence,originalFile:source.file,originalSha256:source.sha256,ageFilterEmbedded:false}};
  });
  return {...state,observations,diagnostics};
 });
 return {states,files:entries.map(({parsed,...file})=>file)};
}
