import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {importAll} from '../scripts/import-data.mjs';
import {parseOriginal,bindOriginalFiles} from '../scripts/originals.mjs';
import {parseCsv} from '../scripts/csv.mjs';
import {transformStates} from '../scripts/transform-data.mjs';
import {validatePublishedRounding} from '../scripts/participation.mjs';
const raw=(name)=>readFileSync(new URL(`../data/raw/${name}`,import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('../data/source-manifest.json',import.meta.url),'utf8'));
const catalog=JSON.parse(readFileSync(new URL('../src/content/entities-catalog.json',import.meta.url),'utf8'));
const transformed=()=>transformStates(parseCsv(raw('INE_comparativo_estatal_18-29_2024 (1).csv').toString('utf8')),catalog,'consolidado');
describe('Originales INE',()=>{
 it('conserva 96 tasas, porcentajes no especificados y conteos ausentes',()=>{
  const {datasets,audit}=importAll();
  expect(datasets).toHaveLength(32);
  expect(audit.entities.flatMap(e=>e.diagnostics)).toHaveLength(96);
  expect(audit.missingNonSpecifiedPercentages).toBe(0);
  for(const f of manifest.files){
   const rows=parseOriginal(raw(f.file));
   expect(rows).toHaveLength(32);
   for(const row of rows){
    const state=datasets.find(d=>d.entityName===(row.Estado==='México'?'Estado de México':row.Estado));
    const o=state.observations.find(o=>o.id===f.groupId);
    expect(o.ratePct).toBe(Number(row['% Participación'].slice(0,-1)));
    expect(o.nonSpecifiedPct).toBe(Number(row['% Votos no esp.'].slice(0,-1)));
    expect(o.counts.notVoted).toBeNull();expect(o.counts.nonSpecified).toBeNull();
   }
  }
 });
 it('rechaza intercambio de grupos aunque las huellas sean válidas',()=>{
  const m=structuredClone(manifest);[m.files[0].groupId,m.files[1].groupId]=[m.files[1].groupId,m.files[0].groupId];
  expect(()=>bindOriginalFiles(transformed(),m,raw)).toThrow(/Correspondencia/);
 });
 it('rechaza archivo alterado',()=>expect(()=>bindOriginalFiles(transformed(),manifest,n=>Buffer.concat([raw(n),Buffer.from('x')]))).toThrow(/Hash/));
 it('rechaza pérdida de codificación original',()=>expect(()=>parseOriginal(Buffer.from('Estado,2024'))).toThrow(/UTF-16/));
 it('comprueba redondeo sin estimar No votaron',()=>{
  const check=validatePublishedRounding({registered:239728,voted:123373},54.8,6.1,45.2);
  expect(check.arithmeticCheck).toBe('rounded-compatible');expect(check.exactNoVotaronAvailable).toBe(false);
  expect(()=>validatePublishedRounding({registered:239728,voted:123373},54.8,0,45.2)).toThrow(/incompatible/);
 });
});
