const fs = require('fs');
const vm = require('vm');
const html = fs.readFileSync('/sessions/focused-upbeat-dijkstra/mnt/uploads/index.html','utf8');
function grab(name){
  const re = new RegExp('const '+name+' = ');
  const i = html.search(re);
  if(i<0) throw new Error('not found '+name);
  const start = html.indexOf('=', i)+1;
  // find end: matching statement end `};` or `];` on same logical block — use vm trick: try increasing slices? Simpler: data consts end with `;\n`
  let end = html.indexOf(';\n', start);
  // for objects spanning lines (FLAG_MAP, ALIASES) `;\n` works too
  const src = html.slice(start, end);
  return vm.runInNewContext('('+src+')');
}
const GEOJSON = grab('GEOJSON');
const CONTINENTS = grab('CONTINENTS');
const CENTROIDS = grab('CENTROIDS');
const FLAG_MAP = grab('FLAG_MAP');
const ALIASES = grab('ALIASES');
console.log('features:', GEOJSON.features.length);
const names = GEOJSON.features.map(f=>f.properties.name);
const contNames = Object.values(CONTINENTS).flat();
console.log('continent list total:', contNames.length);
console.log('flag map total:', Object.keys(FLAG_MAP).length);
console.log('in continents but not in geojson:', contNames.filter(n=>!names.includes(n)));
console.log('in geojson but not in continents:', names.filter(n=>!contNames.includes(n)));
console.log('in continents but no flag:', contNames.filter(n=>!(n in FLAG_MAP)));
// point-in-polygon (ray cast) to check territorial choices
function pip(pt, geom){
  const polys = geom.type==='Polygon'?[geom.coordinates]:geom.coordinates;
  let inside=false;
  for(const poly of polys) for(const ring of poly){
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      if(((yi>pt[1])!=(yj>pt[1])) && (pt[0] < (xj-xi)*(pt[1]-yi)/(yj-yi)+xi)) inside=!inside;
    }
  }
  return inside;
}
const tests = [
  ['Fas', [-13.20, 27.15], 'Laayoune (W.Sahara)'],
  ['Somali', [44.06, 9.56], 'Hargeisa (Somaliland)'],
  ['İsrail', [35.21, 31.90], 'Ramallah (West Bank)'],
  ['İsrail', [34.40, 31.40], 'Gazze'],
  ['Fransa', [-53.0, 4.0], 'Fransız Guyanası'],
  ['Danimarka', [-42.0, 72.0], 'Grönland'],
];
for(const [name, pt, label] of tests){
  const f = GEOJSON.features.find(f=>f.properties.name===name);
  console.log(name, '→', label, ':', f ? pip(pt, f.geometry) : 'FEATURE YOK');
}
// old vertex counts per country
function npts(g){const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;let n=0;for(const p of polys)for(const r of p)n+=r.length;return n;}
const oldCounts={}; GEOJSON.features.forEach(f=>oldCounts[f.properties.name]=npts(f.geometry));
fs.writeFileSync('game_names.json', JSON.stringify(names,null,1));
fs.writeFileSync('continents.json', JSON.stringify(CONTINENTS,null,1));
fs.writeFileSync('flag_map.json', JSON.stringify(FLAG_MAP,null,1));
fs.writeFileSync('aliases.json', JSON.stringify(ALIASES,null,1));
fs.writeFileSync('old_counts.json', JSON.stringify(oldCounts,null,1));
fs.writeFileSync('old_centroids.json', JSON.stringify(CENTROIDS,null,1));
console.log('extraction done');
