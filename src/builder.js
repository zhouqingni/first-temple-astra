/* A cubit-based static scene builder. Small irregular pieces share draw calls;
   repeating pieces are instanced. Picking metadata survives both paths. */
'use strict';
(function(M,T){const TAU=M.tau,up=new T.Vector3(0,1,0),zero=new T.Quaternion();
M.G={ox0:-73,ox1:105,oz:51,ix0:-49,ix1:83,iz:31,iy:2.4,deck:5.9,tx0:-39,tx1:44,tz:20.8,stairEnd:51,roadEnd:172};
class Builder{
 constructor(scene,mats){this.scene=scene;this.mat=mats;this.cache=new Map();this.pools=new Map();this.meshes=[];this.blocks=[];this.floors=[];this.paving=[];this.counts={};this.anchors={};this.rite='feast';this.tall=true;this.cut=false;this._m=new T.Matrix4();}
 geo(key,fn){if(!this.cache.has(key))this.cache.set(key,fn());return this.cache.get(key)}
 put(id,m,g,x,y,z,sx=1,sy=1,sz=1,L='all',q=zero){const key=L+'/'+m+'/'+g.uuid;let pool=this.pools.get(key);if(!pool){pool={m,L,g,list:[]};this.pools.set(key,pool)}const a=new T.Matrix4().compose(new T.Vector3(x,y,z),q,new T.Vector3(sx,sy,sz));pool.list.push([a,id]);}
 rot(rx=0,ry=0,rz=0){return new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ'))}
 box(id,m,x,y,z,w,h,d,L='all',ry=0){if(w<=0||h<=0||d<=0)return;this.put(id,m,this.geo('box',()=>new T.BoxGeometry(1,1,1)),x,y+h/2,z,w,h,d,L,ry?this.rot(0,ry):zero)}
 ell(id,m,x,y,z,a,b,c,L='all',ry=0,rz=0,rx=0){this.put(id,m,this.geo('ell',()=>new T.SphereGeometry(1,12,8)),x,y,z,a,b,c,L,this.rot(rx,ry,rz))}
 cyl(id,m,x,y,z,rt,rb,h,L='all',n=24){const r=Math.max(rt,rb);let ratio1=+(rt/r).toFixed(4),ratio2=+(rb/r).toFixed(4);let g=this.geo(`c${ratio1},${ratio2},${n}`,()=>new T.CylinderGeometry(ratio1,ratio2,1,n));this.put(id,m,g,x,y+h/2,z,r,h,r,L)}
 rod(id,m,a,b,r,L='all',n=8){let v=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),h=v.length();if(h<1e-6)return;this.put(id,m,this.geo('rod'+n,()=>new T.CylinderGeometry(1,1,1,n)),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,h,r,L,new T.Quaternion().setFromUnitVectors(up,v.normalize()))}
 loft(key,rows,axis='y',n=24){return this.geo(key,()=>{let p=[],uv=[],ix=[];for(let j=0;j<rows.length;j++){let [h,c,d,r,s]=rows[j];for(let k=0;k<=n;k++){let a=TAU*k/n;axis==='y'?p.push(c+r*Math.cos(a),h,d+s*Math.sin(a)):p.push(h,c+r*Math.cos(a),d+s*Math.sin(a));uv.push(k/n,j/(rows.length-1));if(j&&k){let b=j*(n+1)+k,aa=b-n-2;if(axis==='y')ix.push(aa,b-1,aa+1,aa+1,b-1,b);else ix.push(aa,aa+1,b-1,aa+1,b,b-1)}}}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g})}
 taper(id,m,a,b,r0,r1,L='all',n=10){let v=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),h=v.length(),ratio=+(r1/r0).toFixed(3);if(h<.0001)return;this.put(id,m,this.geo('taper'+ratio+','+n,()=>new T.CylinderGeometry(ratio,1,1,n)),(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r0,h,r0,L,new T.Quaternion().setFromUnitVectors(up,v.normalize()))}
 lathe(id,m,x,y,z,profile,L='all',n=40){const key='lathe'+n+JSON.stringify(profile);let g=this.geo(key,()=>new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),n));this.put(id,m,g,x,y,z,1,1,1,L)}
 ring(id,m,x,y,z,r,t,L='all',rx=Math.PI/2,ry=0,n=40){const k=+(t/r).toFixed(4);let g=this.geo('tor'+k+','+n,()=>new T.TorusGeometry(1,k,6,n));this.put(id,m,g,x,y,z,r,r,r,L,this.rot(rx,ry))}
 rock(id,m,x,y,z,sx,sy,sz,ry=0,L='land'){let g=this.geo('rock',()=>{let a=new T.IcosahedronGeometry(1,0);a.rotateZ(.35);return a});this.put(id,m,g,x,y,z,sx,sy,sz,L,this.rot(0,ry))}
 shade(id,x,y,z,w,d,L='all'){let g=this.geo('contactPlane',()=>{let v=new T.PlaneGeometry(1,1);v.rotateX(-Math.PI/2);return v});this.put(id,'contact',g,x,y+.031,z,w,1,d,L)}
 wall(id,m,x,y,z,w,h,d,L='all'){this.box(id,m,x,y,z,w,h,d,L);this.block(x,y,z,w,h,d,id)}
 block(x,y,z,w,h,d,id=''){this.blocks.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,y0:y,y1:y+h,id})}
 circle(x,y,z,r,h,id){this.blocks.push({x,z,r,y0:y,y1:y+h,id})}
 floor(x0,x1,z0,z1,y){this.floors.push({x0,x1,z0,z1,y})}
 mark(id,at,eye,walk){this.anchors[id]={at,eye,walk}}
 count(key,n=1){this.counts[key]=(this.counts[key]||0)+n}
 finish(){const sparse=new Map();for(const p of this.pools.values()){if(p.list.length<22){const k=p.L+'/'+p.m;if(!sparse.has(k))sparse.set(k,[]);sparse.get(k).push(p);continue}let mesh=new T.InstancedMesh(p.g,this.mat[p.m],p.list.length);const ids=[];p.list.forEach(([m,id],i)=>{mesh.setMatrixAt(i,m);ids.push(id)});mesh.userData.ids=ids;mesh.computeBoundingSphere();this.add(mesh,p.L,p.m)}
 for(const ps of sparse.values()){let pos=[],nor=[],uv=[],idx=[],ends=[],ids=[];const v=new T.Vector3(),normal=new T.Matrix3();for(const p of ps){const g=p.g,pp=g.attributes.position,nn=g.attributes.normal,uu=g.attributes.uv,ii=g.index;for(const [mx,id] of p.list){let off=pos.length/3;normal.getNormalMatrix(mx);for(let j=0;j<pp.count;j++){v.fromBufferAttribute(pp,j).applyMatrix4(mx);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(nn,j).applyMatrix3(normal).normalize();nor.push(v.x,v.y,v.z);uv.push(uu?uu.getX(j):0,uu?uu.getY(j):0)}let n=ii?ii.count:pp.count;for(let j=0;j<n;j++)idx.push(off+(ii?ii.getX(j):j));ends.push(idx.length/3);ids.push(id)}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeBoundingSphere();let mesh=new T.Mesh(g,this.mat[ps[0].m]);mesh.userData.ends=ends;mesh.userData.ids=ids;this.add(mesh,ps[0].L,ps[0].m)}this.pools.clear();this.layers();}
 add(mesh,L,m){mesh.userData.layer=L;mesh.castShadow=!['far','ground'].includes(L)&&!['water','wick','contact'].includes(m);mesh.receiveShadow=m!=='contact';if(m==='contact'){mesh.userData.ignorePick=true;mesh.renderOrder=2}this.scene.add(mesh);this.meshes.push(mesh)}
 activeLayer(l){if(!l)return true;if(l==='veilClosed')return this.rite!=='study';if(l==='veilFold')return this.rite==='study';return !l.startsWith('rite-')||l==='rite-'+this.rite}
 layers(){for(const mesh of this.meshes){const l=mesh.userData.layer;mesh.visible=this.activeLayer(l)&&(!this.cut||!['roof','south','front','tower','shortCap','tallCap','roomsTop'].includes(l))&&(!(l==='tower'||l==='tallCap')||this.tall)&&(l!=='shortCap'||!this.tall)}}
 hitId(hit){const d=hit.object.userData;if(d.key)return d.key;if(hit.instanceId!=null)return d.ids[hit.instanceId];let l=0,r=d.ends.length-1;while(l<r){let m=(l+r)>>1;if(d.ends[m]>hit.faceIndex)r=m;else l=m+1}return d.ids[l]}
}
M.Builder=Builder;
})(Moriah,THREE);
