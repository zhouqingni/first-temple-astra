/* Grounded, sliding capsule proxy. No pointer lock: hover-to-read stays available while walking. */
'use strict';
(function(M){const G=M.G,D=M.D,lim=(n,a,b)=>Math.min(b,Math.max(a,n));
class WalkSurface{
 constructor(world){this.b=world;this.radius=.49;this.head=D.eyeM/D.cubitM+.24}
 base(x,z){let y=x>G.ox1&&x<=G.roadEnd&&Math.abs(z)<=4.7?M.roadY(x):M.terrainY(x,z);for(const f of this.b.paving)if(x>=f.x0&&x<=f.x1&&z>=f.z0&&z<=f.z1)y=Math.max(y,f.y);return y}
 height(x,z,old){let y=this.base(x,z),cap=old+.73;if(x>=-39&&x<=31&&Math.abs(z)<=19){for(const f of this.b.floors)if(x>=f.x0&&x<=f.x1&&z>=f.z0&&z<=f.z1&&f.y<=cap)y=Math.max(y,f.y);const s=M.spiral;if(s){let dx=x-s.x,dz=z-s.z,rr=Math.hypot(dx,dz);if(rr>=.19&&rr<=s.r+.075){let t=((Math.atan2(-dz,dx)+Math.PI/2+M.tau)%M.tau)/M.tau;let h=(Math.floor(t*20)+1)*D.storey/20;for(let k of [0,1]){let v=s.y+h+k*D.storey;if(v<=cap)y=Math.max(y,v)}}}}return y}
 free(x,z,y){if(this.b.rite!=='study'&&!M.publicPoint(x,z)){this.denied=true;return false}if(Math.abs(x)>419||Math.abs(z)>429)return false;let r=this.radius;for(const o of this.b.blocks){if(y+.16>=o.y1||y+this.head<=o.y0||!this.b.activeLayer(o.layer))continue;if(o.r){if((x-o.x)**2+(z-o.z)**2<(r+o.r)**2)return false}else if(x>o.x0-r&&x<o.x1+r&&z>o.z0-r&&z<o.z1+r){let dx=x-lim(x,o.x0,o.x1),dz=z-lim(z,o.z0,o.z1);if(dx*dx+dz*dz<r*r)return false}}return true}
 attempt(p,dx,dz){let x=p.x+dx,z=p.z+dz,y=this.height(x,z,p.y);if(y-p.y>.735||p.y-y>1.13||!this.free(x,z,y))return false;p.x=x;p.z=z;p.y=y;return true}
 move(p,dx,dz){let n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.24));let moved=false;for(let i=0;i<n;i++){let x=dx/n,z=dz/n;if(this.attempt(p,x,z)){moved=true;continue}if(Math.abs(x)>.00001)moved=this.attempt(p,x,0)||moved;if(Math.abs(z)>.00001)moved=this.attempt(p,0,z)||moved}return moved}
}
M.WalkSurface=WalkSurface;
})(Moriah);
