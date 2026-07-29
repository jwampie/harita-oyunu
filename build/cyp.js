const fs=require('fs');const kktc=JSON.parse(fs.readFileSync('/sessions/focused-upbeat-dijkstra/mnt/uploads/kktc.geojson','utf8'));
const gk=JSON.parse(fs.readFileSync('/sessions/focused-upbeat-dijkstra/mnt/uploads/guney_kibris.geojson','utf8'));
const getG=o=>o.geometry||o.features[0].geometry;
function pip(pt, geom){
  const polys=geom.type==='Polygon'?[geom.coordinates]:geom.coordinates;
  let inside=false;
  for(const poly of polys){
    for(const ring of poly){
      for(let i=0,j=ring.length-1;i<ring.length;j=i++){
        const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
        if(((yi>pt[1])!=(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi)) inside=!inside;
      }
    }
  }
  return inside;
}
const g1=getG(kktc), g2=getG(gk);
console.log('kktc geom:', g1.type, 'parça:', g1.type==='MultiPolygon'?g1.coordinates.length:1);
console.log('guney geom:', g2.type, 'parça:', g2.type==='MultiPolygon'?g2.coordinates.length:1, 'ilk parça halka:', (g2.type==='MultiPolygon'?g2.coordinates[0]:g2.coordinates).length);
console.log('guney içinde Girne (kuzey)?', pip([33.32,35.34], g2));
console.log('guney içinde Lefkoşa-kuzey?', pip([33.36,35.19], g2));
console.log('guney içinde Limasol (güney)?', pip([33.04,34.68], g2));
console.log('guney içinde Akrotiri SBA?', pip([32.98,34.59], g2));
console.log('kktc içinde Girne?', pip([33.32,35.34], g1));
const old=require('./old_counts.json');
console.log('eski Çekya:', old['Çekya'], '| eski Kıbrıs:', old['Kıbrıs'], '| eski KKTC:', old['Kuzey Kıbrıs Türk Cumhuriyeti'], '| eski Türkiye:', old['Türkiye']);
