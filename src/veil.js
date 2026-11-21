/* 2 Chronicles 3:14. The colour, thread and embroidered beings are recorded;
   this particular pair of facing figures, rod, hems and dimensions are not. */
'use strict';
(function(M,T){
function textile(){
 const c=document.createElement('canvas');c.width=768;c.height=896;const g=c.getContext('2d'),w=c.width,h=c.height,rand=M.rng(703);
 function box(x,y,a,b,col){g.fillStyle=col;g.fillRect(x,y,a,b)}
 box(0,0,w,h,'#35476b');for(const [x,a,col] of [[0,99,'#583555'],[669,99,'#583555'],[99,15,'#923e44'],[654,15,'#923e44'],[119,5,'#c3a67e'],[644,5,'#c3a67e']])box(x,0,a,h,col);
 for(const [y,hh,col] of [[0,58,'#543854'],[58,9,'#bd916e'],[71,14,'#933f47'],[95,4,'#d4bc8c'],[796,4,'#d4bc8c'],[813,13,'#933f47'],[838,58,'#543854']])box(0,y,w,hh,col);
 function stroke(cmd,col='#e0c79e',width=3){g.beginPath();cmd();g.strokeStyle=col;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.stroke()}
 function diamond(x,y,r){stroke(()=>{g.moveTo(x,y-r);g.lineTo(x+r*.7,y);g.lineTo(x,y+r);g.lineTo(x-r*.7,y);g.closePath()},'#cab58a',3);box(x-2,y-2,4,4,'#d1a189')}
 for(let y=30;y<h;y+=37)for(let x of [48,720])diamond(x,y,15);for(let x=20;x<w;x+=29)for(let y of [28,866])diamond(x,y,11);
 function winged(x,y,sgn,scale){g.save();g.translate(x,y);g.scale(sgn*scale,scale);const fill=(cmd,col)=>{g.beginPath();cmd();g.fillStyle=col;g.fill();g.strokeStyle='#d8bf96';g.lineWidth=2.8;g.stroke()};
 // A woven, antithetical pair: standing figures in profile, each with long curling feather registers.
 fill(()=>{g.moveTo(-6,-34);g.bezierCurveTo(-40,-63,-67,-119,-105,-127);g.bezierCurveTo(-102,-100,-89,-57,-64,-38);g.quadraticCurveTo(-34,-18,-11,-12);g.closePath()},'#773f56');
 for(let k=0;k<8;k++)stroke(()=>{g.moveTo(-14,-28+k*1.8);g.quadraticCurveTo(-47-k*4,-46-k*4,-98+k*3,-114+k*10)},'#dfb78a',2.2);
 fill(()=>{g.moveTo(-14,-8);g.quadraticCurveTo(-19,18,-32,73);g.lineTo(13,73);g.lineTo(12,66);g.lineTo(7,10);g.lineTo(18,-17);g.lineTo(15,-32);g.lineTo(1,-35);g.closePath()},'#7c504f');
 stroke(()=>{g.moveTo(-7,8);g.lineTo(-22,63);g.lineTo(9,63);g.moveTo(-1,10);g.lineTo(-11,61)},'#dfc29b',2);stroke(()=>{g.moveTo(9,-27);g.lineTo(24,-5);g.lineTo(43,-19);g.moveTo(9,-20);g.lineTo(24,2);g.lineTo(44,-14)});
 fill(()=>{g.moveTo(-1,-36);g.lineTo(-7,-51);g.quadraticCurveTo(-8,-67,7,-66);g.quadraticCurveTo(18,-65,18,-54);g.lineTo(23,-49);g.lineTo(17,-48);g.lineTo(16,-41);g.lineTo(9,-40);g.lineTo(7,-32);g.closePath()},'#ba9870');
 stroke(()=>{g.moveTo(-8,-56);g.lineTo(17,-58);g.moveTo(-7,-54);g.lineTo(-12,-33);g.moveTo(-8,74);g.lineTo(-8,82);g.lineTo(5,82);g.moveTo(6,74);g.lineTo(6,81);g.lineTo(20,81)},'#ddc6a2',3);g.restore()}
 for(const [yy,sz] of [[276,1.14],[614,1.14]]){winged(284,yy,1,sz);winged(484,yy,-1,sz);diamond(384,yy-19,13)}
 for(let y of [128,449,763])for(let x=152;x<=616;x+=29)diamond(x,y,5.5);
 for(let x=0;x<w;x+=2)box(x,0,1,h,x%6?'rgba(239,220,190,.07)':'rgba(21,16,40,.17)');for(let y=0;y<h;y+=3)box(0,y,w,1,'rgba(241,222,190,.09)');for(let k=0;k<16000;k++)box(rand()*w,rand()*h,1+rand()*3,.8,rand()<.5?'rgba(237,222,186,.075)':'rgba(13,17,34,.105)');
 let t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
M.closedVeil=function(b){const Y=M.G.deck,L='veilClosed';if(typeof document!=='undefined'){const map=textile();b.mat.veilWoven=new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.97,metalness:0,emissive:0x413344,emissiveIntensity:.29});b.mat.thread=new T.MeshStandardMaterial({color:'#c1a887',roughness:.95})}
 const seg=64,rows=22,p=[],uv=[],idx=[];function pt(u,v){let a=u*M.tau*11;return [-8.99+.175*Math.cos(a+.12*Math.sin(v*5))+.04*Math.sin(2*a+v)+.14*(1-v)*Math.sin(u*Math.PI),Y+.065+v*12.65+.04*(1-v)*Math.cos(a),-6.45+u*12.9]}
 for(let j=0;j<=rows;j++)for(let i=0;i<=seg;i++){p.push(...pt(i/seg,j/rows));uv.push(i/seg,j/rows);if(i&&j){let n=j*(seg+1)+i;idx.push(n-seg-2,n-1,n-seg-1,n-seg-1,n-1,n)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();b.put('veil','veilWoven',g,0,0,0,1,1,1,L);
 b.rod('veil','lightBronze',[-9.06,Y+12.85,-6.87],[-9.06,Y+12.85,6.87],.095,L,14);for(let i=0;i<=22;i++){let u=i/22,a=pt(u,1);b.ring('veil','thread',-9.06,Y+12.75,a[2],.14,.043,L,0,Math.PI/2,10)}
 b.block(-8.98,Y,0,.43,12.86,12.90,'veil');b.blocks[b.blocks.length-1].layer=L;
};})(Moriah,THREE);
