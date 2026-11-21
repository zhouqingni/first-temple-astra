/* Exodus 25:10–22; 1 Kings 8:6–9. Lengths are cubits. The small figures' posture,
   metal tooling and pole length are interpretations, not dimensions from the text. */
'use strict';
(function(M,T){
const V=(x,y,z)=>new T.Vector3(x,y,z),Z=V(0,0,1),tau=2*Math.PI,clamp=t=>Math.max(0,Math.min(1,t));
function mesh(p,uv,ix){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g}
function join(ix,a,b,c,d,reverse=false){if(reverse)ix.push(a,b,c,b,d,c);else ix.push(a,c,b,b,c,d)}
function reflected(g){const h=g.clone().scale(1,1,-1),ix=h.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}return h}
// An actual folded sheet: outside, turned lip, inside and floor, not a solid block.
function rectangle(rows){let p=[],uv=[],ix=[],n=32;for(let j=0;j<rows.length;j++){let [y,w,d,r]=rows[j];r=Math.min(r,w*.49,d*.49);for(let k=0;k<n;k++){let c=Math.floor(k/8),a=(c+k%8/7)*Math.PI/2,dx=c===0||c===3?1:-1,dz=c<2?1:-1;p.push(dx*(w/2-r)+r*Math.cos(a),y,dz*(d/2-r)+r*Math.sin(a));uv.push(k/n*4,y*2);if(j){let i=(j-1)*n+k,v=(j-1)*n+(k+1)%n;join(ix,i,v,i+n,v+n)}}}for(const j of [0,rows.length-1]){let c=p.length/3;p.push(0,rows[j][0],0);uv.push(.5,.5);for(let k=0;k<n;k++){let a=j*n+k,b=j*n+(k+1)%n;if(j)ix.push(c,b,a);else ix.push(c,a,b)}}return mesh(p,uv,ix)}
// Project the broad faces of the gold leaf in cubits rather than squeezing the whole
// hammered texture into the single narrow UV interval along the long side of a rectangle.
function gildedShell(rows){const g=rectangle(rows),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.abs(n.getX(i)),b=Math.abs(n.getY(i)),c=Math.abs(n.getZ(i));uv.setXY(i,(b>a&&b>c?x:a>c?z:x)*1.15,(b>a&&b>c?z:y)*1.15)}return g}
function garment(rows){let p=[],uv=[],ix=[],n=64;for(let j=0;j<rows.length;j++){const [y,x,w,d,fold]=rows[j];for(let k=0;k<=n;k++){let a=k/n*tau,f=1+fold*(.75*Math.cos(15*a+y*3)+.32*Math.cos(8*a-y*6));p.push(x+w*f*Math.cos(a),y,d*f*Math.sin(a));uv.push(k/n,j/(rows.length-1));if(j&&k){let d=j*(n+1)+k;join(ix,d-n-2,d-n-1,d-1,d)}}}return mesh(p,uv,ix)}
// Smooth tapered gold relief strokes; the wings themselves are continuous sheet surfaces.
function sweep(pts,radii,flatten=1){const curve=new T.CatmullRomCurve3(pts.map(v=>V(...v))),p=[],uv=[],ix=[],n=10,rows=(pts.length-1)*5;for(let j=0;j<=rows;j++){let t=j/rows,m=t*(pts.length-1),i=Math.min(pts.length-2,Math.floor(m)),r=radii[i]+(radii[i+1]-radii[i])*(m-i),c=curve.getPoint(t),d=curve.getTangent(t),ref=Math.abs(d.z)>.985?V(0,1,0):Z,u=d.clone().cross(ref).normalize(),v=u.clone().cross(d).normalize();for(let k=0;k<=n;k++){let a=k*tau/n,e=c.clone().addScaledVector(u,r*Math.cos(a)).addScaledVector(v,r*flatten*Math.sin(a));p.push(e.x,e.y,e.z);uv.push(k/n,t);if(j&&k){let h=j*(n+1)+k;join(ix,h-n-2,h-n-1,h-1,h)}}}return mesh(p,uv,ix)}
// Root, raised shoulder, wrist, long primaries. A bent, cambered wing with a visible
// leading edge and overlapping vanes on both faces, not bent rods in a V shape.
const curves=[
 [[-.070,.548,.113],[-.185,.80,.201],[-.211,1.056,.275],[-.123,1.297,.329],[.115,1.448,.366],[.453,1.512,.350],[.746,1.511,.303],[.977,1.452,.255]],
 [[-.066,.539,.133],[-.079,.583,.219],[-.101,.688,.295],[-.042,.815,.381],[.127,.923,.479],[.395,1.035,.503],[.722,1.219,.436],[.977,1.452,.255]]
].map(a=>new T.CatmullRomCurve3(a.map(v=>V(...v))));
function wingAt(t,v){t=clamp(t);const p=curves[0].getPoint(t).lerp(curves[1].getPoint(t),v);p.z+=.044*Math.sin(v*Math.PI)*Math.sin(t*Math.PI);return p}
function mantle(){let p=[],ix=[],uv=[],n=16,N=46;for(let j=0;j<=N;j++){let t=j/N;for(let k=0;k<=n;k++){const a=tau*k/n,v=(1-Math.cos(a))*.40,q=wingAt(t,v);q.z+=.039*Math.sin(a)*Math.pow(Math.sin(t*Math.PI),.7);p.push(q.x,q.y,q.z);uv.push(t,k/n);if(j&&k){let d=j*(n+1)+k;join(ix,d-n-2,d-n-1,d-1,d,true)}}}return mesh(p,uv,ix)}
function feather(i,total,short,back){const p=[],uv=[],ix=[],N=13,n=8,end=(short?.17:.18)+(short?.75:.795)*i/(total-1),start=Math.max(.014,end-(short?.119+.11*end:.20+.21*end)),side=back?-1:1;
 for(let j=0;j<=N;j++){let u=j/N,t=start+(end-start)*(u*.9+.1*u*u),v=short?.09+.56*u:.29+.71*u,w=(short?.066:.080)*(Math.pow(Math.sin(Math.PI*u),.63)*(.96-.21*u)+.002),h=short?.009:.012;for(let k=0;k<=n;k++){let s=k/n*2-1,at=clamp(t+s*w),q=wingAt(at,v-.022*(1-s*s)*Math.sin(Math.PI*u)),edge=Math.max(0,1-s*s),fat=Math.sin(Math.PI*u);q.z+=side*(.008+(short?.042:.034)*(1-u)+fat*(h*edge+.012*Math.exp(-s*s*38))+(short?.011:0));p.push(q.x,q.y,q.z);uv.push(u,k/n);if(j&&k){let d=j*(n+1)+k;join(ix,d-n-2,d-n-1,d-1,d,back)}}}return mesh(p,uv,ix)}
M.ark=function(b,x){const {arkLong:L,arkWide:W,arkHigh:H}=M.D,deck=M.G.deck+.01,id='ark',seatH=.077,seatY=deck+H+seatH;
 const named=(key,fn)=>b.geo('ark/'+key,()=>{const g=fn();g.name='ark/'+key;return g});
 const plate=(key,mat,rows,xx=x,y=deck,z=0)=>b.put(id,mat,named(key,()=>mat==='arkSheet'?gildedShell(rows):rectangle(rows)),xx,y,z);
 plate('chest','arkSheet',[[.118,.08,.08,.02],[.118,L-.067,W-.067,.041],[.134,L-.027,W-.027,.044],[.162,L,W,.036],[H-.075,L,W,.036],[H-.019,L-.008,W-.008,.036],[H,L-.027,W-.027,.034],[H,L-.127,W-.127,.031],[H-.018,L-.15,W-.15,.03],[.207,L-.15,W-.15,.027],[.20,L-.18,W-.18,.021],[.20,.07,.07,.015]]);
 // Restrained folded gold beading, not the temple wall's palm and animal panels.
 for(const [k,y] of [[0,.145],[1,H-.117]])plate('moulding'+k,'arkBurnished',[[0,L-.018,W-.018,.031],[.005,L+.006,W+.006,.039],[.018,L+.011,W+.011,.043],[.03,L-.014,W-.014,.036]],x,deck+y);
 for(const sx of [-1,1])for(const sz of [-1,1]){const xx=x+sx*(L/2-.162),zz=sz*(W/2-.137);
  plate('foot','arkSheet',[[0,.26,.201,.036],[.016,.289,.225,.04],[.052,.28,.22,.039],[.126,.25,.212,.027],[.190,.29,.24,.024]],xx,deck,zz);
  b.ell(id,'arkBurnished',xx,deck+.275,sz*(W/2-.008),.103,.126,.053);b.ell(id,'arkRecess',xx,deck+.266,sz*(W/2+.029),.056,.078,.042);
  const ring=named('ring',()=>new T.TorusGeometry(.122,.036,12,40));b.put(id,'arkBurnished',ring,xx,deck+.267,sz*(W/2+.148),1,1,1,'all',b.rot(0,Math.PI/2));
 }
 // The closed seat is exactly L x W even at the rolled edge. Only the rim is rounded.
 plate('mercy-seat','arkBurnished',[[0,.04,.04,.012],[0,L-.032,W-.032,.033],[.015,L,W,.039],[seatH-.018,L,W,.04],[seatH-.005,L-.013,W-.013,.036],[seatH,L-.035,W-.035,.033],[seatH,.04,.04,.012]],x,deck+H);
 // 1 Kings 8:9: only the two tablets; kept out of sight inside the closed gilded box.
 for(const s of [-1,1])plate('tablet','stone',[[0,.797,.984,.037],[.022,.838,1.018,.046],[.095,.838,1.018,.046],[.115,.793,.981,.037]],x+s*.432,deck+.205,0);
 const west=-29.03,east=-9.56,len=east-west;for(const s of [-1,1]){const z=s*(W/2+.148),y=deck+.267;const g=named('stave',()=>new T.LatheGeometry([[0,0],[.038,0],[.065,.035],[.071,.093],[.071,len-.093],[.065,len-.035],[.038,len],[0,len]].map(v=>new T.Vector2(...v)),24));b.put(id,'arkBurnished',g,west,y,z,1,1,1,'all',b.rot(0,0,-Math.PI/2));b.block((east+west)/2,y-.071,z,len,.142,.142,id)}
 const oval=named('oval',()=>new T.SphereGeometry(1,24,16));
 for(const dir of [1,-1]){let rootX=x-dir*(L/2-.225),yaw=b.rot(0,dir===1?0:Math.PI);const put=(mat,g,dx=0,dy=0,dz=0,scale=[1,1,1],q=null)=>b.put(id,mat,g,rootX+dir*dx,seatY+dy,dir*dz,...scale,'all',q?yaw.clone().multiply(q):yaw);
  const ball=(mat,a,rx,ry,rz)=>put(mat,oval,...a,[rx,ry,rz]);const form=(name,mat,rows)=>put(mat,named(name,()=>garment(rows)));
  // Kneeling drapery flows into the seat without pedestals. Hands rest on the knees.
  form('folded-mantle','arkFigure',[[ -.008,.068,.237,.177,.047],[.011,.076,.265,.198,.058],[.037,.08,.269,.202,.06],[.075,.09,.256,.196,.046],[.14,.094,.245,.185,.047],[.195,.074,.222,.166,.055],[.245,.032,.180,.158,.048],[.30,-.02,.147,.143,.048],[.37,-.030,.137,.138,.021],[.414,-.018,.139,.134,.016]]);
  form('torso','arkFigure',[[.273,-.015,.144,.151,.029],[.338,-.024,.142,.143,.012],[.426,-.021,.125,.128,.014],[.474,-.01,.137,.149,.020],[.535,.007,.146,.178,.023],[.602,.018,.132,.187,.019],[.641,.035,.112,.165,.013],[.662,.047,.086,.119,.006],[.677,.063,.065,.077,0]]);
  ball('arkFigure',[.073,.678,0],.071,.089,.078);
  for(const s of [-1,1]){ball('arkFigure',[.224,.112,s*.113],.132,.102,.086);const arm=[[.031,.590,s*.151],[.072,.543,s*.179],[.123,.43,s*.192],[.148,.397,s*.181],[.230,.356,s*.152],[.303,.309,s*.128],[.319,.292,s*.116]];put('arkFigure',named('arms'+s,()=>sweep(arm,[.060,.063,.049,.045,.038,.027,.022],.92)));ball('arkFigure',[.313,.284,s*.120],.051,.031,.029);for(let k=0;k<4;k++){let z=s*(.101+k*.0105);put('arkFigure',named('finger'+s+k,()=>sweep([[.332,.284,z],[.354,.276,z],[.367-(k%3)*.004,.262,z-s*.001]],[.0078,.007,.0038])));}
   const neckline=[[.033,.642,s*.119],[.085,.617,s*.114],[.125,.594,s*.064],[.145,.589,0]];put('arkBurnished',named('collar'+s,()=>sweep(neckline,[.011,.010,.010,.007])));
  }
  // Sculpt the nose, eyelids, chin and ear into a tilted face; a sphere alone has no gaze.
  const pitch=b.rot(0,0,-.59),headOrigin=V(.123,.799,0);function head(mat,g,dx=0,dy=0,dz=0,scale=[1,1,1]){let at=V(dx,dy,dz).applyQuaternion(pitch).add(headOrigin);put(mat,g,at.x,at.y,at.z,scale,pitch)}
  const headShape=(name,rows)=>named(name,()=>{const g=b.loft('ark-loft/'+name,rows,'y',36);return g});
  head('arkFigure',headShape('face',[[-.143,.047,0,.031,.039],[-.134,.050,0,.061,.059],[-.115,.040,0,.082,.078],[-.087,.021,0,.100,.092],[-.054,.011,0,.114,.103],[-.014,.001,0,.119,.113],[.031,-.004,0,.122,.115],[.071,-.011,0,.119,.113],[.107,-.014,0,.111,.105],[.141,-.018,0,.087,.09],[.163,-.019,0,.052,.057],[.17,-.02,0,.005,.006]]));
  head('arkBurnished',headShape('nose',[[-.055,.128,0,.013,.019],[-.049,.139,0,.022,.025],[-.039,.142,0,.027,.022],[-.022,.139,0,.024,.018],[.016,.126,0,.019,.014],[.041,.115,0,.013,.017]]));
  head('arkRecess',oval,.119,-.080,0,[.012,.003,.032]);head('arkFigure',oval,.119,-.085,0,[.016,.006,.029]);
  for(const s of [-1,1]){const lid=[[.114,.010,s*.018],[.109,.018,s*.051],[.094,.016,s*.075],[.085,.010,s*.083]];head('arkRecess',named('eyelid'+s,()=>sweep(lid,[.002,.006,.004,.0016])));head('arkBurnished',named('brow'+s,()=>sweep(lid.map(([x,y,z])=>[x-.002,y+.016,z]),[.005,.009,.006,.002])));head('arkFigure',oval,-.004,-.013,s*.109,[.025,.040,.014]);head('arkRecess',oval,-.008,-.011,s*.119,[.013,.022,.005]);}
  head('arkSatin',headShape('hair',[[-.023,-.060,0,.055,.065],[.032,-.042,0,.094,.113],[.072,-.024,0,.117,.119],[.109,-.024,0,.112,.112],[.146,-.028,0,.092,.095],[.169,-.025,0,.057,.063],[.178,-.024,0,.004,.005]]));
  for(const s of [-1,1]){for(let i=0;i<5;i++){let a=.18+i*.276;const lines=[[-.035,.168,s*.026],[-.028-.053*Math.sin(a),.144,s*(.055+.026*Math.cos(a))],[-.029-.096*Math.sin(a),.091,s*.110*Math.cos(a)],[-.038-.091*Math.sin(a),.047,s*.110*Math.cos(a)]];head('arkFigure',named('hairline'+s+i,()=>sweep(lines,[.002,.004,.005,.003])))}
   const piece=(name,mat,fn)=>{const base=named(name,fn),g=s===1?base:named(name+'/mirrored',()=>reflected(base));put(mat,g)};
   piece('wing','arkSatin',mantle);for(const back of [false,true])for(const short of [false,true]){if(back&&short)continue;const n=short?9:12;for(let i=0;i<n;i++)piece('vane/'+[back,short,i].join('/'),short?'arkFigure':i%3?'arkSatin':'arkFigure',()=>feather(i,n,short,back))}
  }b.count('lidCherubim');
 }
 b.shade(id,x,deck,0,L+.9,W+.7);b.block(x,deck,0,L,H+seatH+1.52,W,id);
 b.mark(id,[x,deck+1.49,0],[x+2.91,deck+3.26,5.05],[x+3.0,2.0]);
};})(Moriah,THREE);
