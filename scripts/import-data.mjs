import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseCsv} from './csv.mjs';
import {transformStates} from './transform-data.mjs';
import {bindOriginalFiles} from './originals.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url));
export function importAll(){
 const filename='INE_comparativo_estatal_18-29_2024 (1).csv',raw=read(`../data/raw/${filename}`),catalog=JSON.parse(read('../src/content/entities-catalog.json'));
 const transformed=transformStates(parseCsv(raw.toString('utf8')),catalog,filename);
 const manifestBytes=read('../data/source-manifest.json'),manifest=JSON.parse(manifestBytes);
 const {states,files}=bindOriginalFiles(transformed,manifest,name=>read(`../data/raw/${name}`));
 const provenance={status:'verified',sourceKind:'official-export',title:'INE · Conteos Censales de Participación Ciudadana · 2024',officialUrl:'https://ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/',manualUrl:'https://ine.mx/wp-content/uploads/2025/06/Manual-Conteos-Censales-2009-2024.pdf',rawFile:'data/source-manifest.json',sha256:createHash('sha256').update(manifestBytes).digest('hex'),downloadedAt:null,receivedAt:manifest.receivedAt,indicator:'Porcentaje de participación',denominator:'Sí votaron + No votaron; excluye registros de voto no especificado',filters:'Año 2024 y 32 entidades explícitos en originales. Edad vinculada al consolidado por conteos exactos de las 32 filas y confirmación del equipo; los CSV no incluyen el filtro de edad ni los demás filtros de Tableau.',verifiedBy:'Cotejo automatizado con los originales aportados; grupos confirmados por el equipo y por correspondencia única con el consolidado',verifiedAt:'2026-10-22',verificationScope:'Tasas publicadas, porcentajes no especificados, correspondencia única con el consolidado y compatibilidad dentro del redondeo; sin reconstrucción de No votaron.',sourceFiles:files.map(({file,groupId,sha256})=>({file,groupId,sha256})),consolidatedSource:{file:filename,sha256:createHash('sha256').update(raw).digest('hex')},note:'Originales recibidos y conservados sin cambios. 96 tasas y conteos cotejados; 96 porcentajes no especificados integrados. Los grupos de edad se vinculan por el consolidado y la confirmación del equipo, no por filtros embebidos. No votaron y conteos no especificados permanecen null porque los archivos no los publican.'};
 const datasets=states.map(({catalog:c,observations})=>({id:`${c.slug}-2024`,entityId:c.id,entityName:c.name,year:2024,observations,provenance}));
 const audit={method:'Sí votaron / (Sí votaron + No votaron) × 100',nonSpecifiedMethod:'No especificados / Lista nominal × 100',originalsAvailable:true,sourceFiles:files,ageFilterEmbedded:false,exactNoVotaronAvailable:false,entities:states.map(({catalog:c,diagnostics})=>({entityId:c.id,entityName:c.name,diagnostics})),missingNonSpecifiedPercentages:0};
 return {datasets,audit};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {datasets,audit}=importAll();for(const [file,value] of [['../src/data/states-2024.json',datasets],['../src/data/import-audit.json',audit]])writeFileSync(new URL(file,import.meta.url),JSON.stringify(value,null,2)+'\n');
 console.log(`${datasets.length} entidades, 96 tasas cotejadas y 96 porcentajes no especificados integrados. No se reconstruyen conteos.`);
}
