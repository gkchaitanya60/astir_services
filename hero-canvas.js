/* Animated projected-3D fallback for browsers without WebGL. */
(() => {
  'use strict';
  const hero=document.querySelector('.hero');
  if(hero.classList.contains('has-webgl'))return;
  const previous=document.querySelector('#hero-diamond');
  const canvas=previous.cloneNode();previous.replaceWith(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const button=hero.querySelector('.hero-motion-toggle');
  let w=0,h=0,dpr=1,time=0,last=0,id=0,visible=true,paused=false,mx=0,my=0;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');paused=reduce.matches;
  const vertex=(r,y,a)=>[Math.cos(a)*r,y,Math.sin(a)*r];
  const upper=Array.from({length:8},(_,i)=>vertex(.69,.91,i*Math.PI/4));
  const middle=Array.from({length:8},(_,i)=>vertex(1.05,.1,i*Math.PI/4+Math.PI/8));
  const lower=Array.from({length:8},(_,i)=>vertex(.56,-.95,i*Math.PI/4));
  const triangles=[];
  for(let i=0;i<8;i++){const n=(i+1)%8;triangles.push([[0,1.88,0],upper[n],upper[i]],[upper[i],upper[n],middle[i]],[upper[n],middle[n],middle[i]],[middle[i],middle[n],lower[i]],[middle[n],lower[n],lower[i]],[lower[i],lower[n],[0,-1.91,0]]);}
  function rotate([x,y,z],rx,ry,rz){let a=x*Math.cos(ry)+z*Math.sin(ry),b=-x*Math.sin(ry)+z*Math.cos(ry);x=a;z=b;a=y*Math.cos(rx)-z*Math.sin(rx);b=y*Math.sin(rx)+z*Math.cos(rx);y=a;z=b;return[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z];}
  const project=([x,y,z])=>[w*.5+x*h*1.35/(7.5-z),h*.5-y*h*1.35/(7.5-z)];
  function draw(now){
    id=0;if(last&&!paused)time+=Math.min((now-last)/1000,.05);last=now;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const rx=.11+Math.sin(time*.24)*.1+my*.06,ry=time*.22+.45,rz=-.09+mx*.06;
    const pieces=triangles.map((t,i)=>{const points=t.map(v=>rotate(v,rx,ry,rz));return{points,depth:points.reduce((s,p)=>s+p[2],0)/3,type:'facet',i};});
    for(let r=0;r<3;r++){
      const radius=1.68+r*.22;
      const orbit=a=>rotate([Math.cos(a)*radius,Math.sin(a)*.32,Math.sin(a)*radius],.48+r*.36,.1+r*.8+time*(r%2?-.08:.065),-.32+r*.23);
      for(let n=0;n<150;n++){const a=n/150*Math.PI*2,b=(n+1)/150*Math.PI*2,p=orbit(a),q=orbit(b);pieces.push({points:[p,q],depth:(p[2]+q[2])/2,type:'line',r});}
      const p=orbit(time*(.38+r*.09)+r*2);pieces.push({points:[p],depth:p[2],type:'spark'});
    }
    pieces.sort((a,b)=>a.depth-b.depth);
    const halo=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,h*.36);halo.addColorStop(0,'rgba(47,111,232,.14)');halo.addColorStop(1,'rgba(23,66,171,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
    for(const p of pieces){
      const points=p.points.map(project);
      if(p.type==='spark'){ctx.shadowColor='#8cdfff';ctx.shadowBlur=12;ctx.fillStyle='#ecffff';ctx.beginPath();ctx.arc(points[0][0],points[0][1],2.3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;continue;}
      ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);
      if(p.type==='line'){ctx.strokeStyle=p.r===1?'rgba(162,142,255,.8)':'rgba(112,211,255,.8)';ctx.lineWidth=1.15;ctx.shadowColor=p.r===1?'#ae85ff':'#64cfff';ctx.shadowBlur=4;ctx.stroke();ctx.shadowBlur=0;continue;}
      ctx.closePath();
      const a=p.points[0],b=p.points[1],c=p.points[2],u=b.map((v,i)=>v-a[i]),v=c.map((k,i)=>k-a[i]);
      const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...normal)||1;
      const lighting=Math.abs((normal[0]*.45+normal[1]*.6+normal[2]*.7)/len);
      const light=23+lighting*48+(p.i%3)*4,hue=206+(p.i%5)*5;
      const g=ctx.createLinearGradient(points[0][0],points[0][1],points[1][0]+1,points[2][1]+1);
      g.addColorStop(0,`hsla(${hue},85%,${Math.min(90,light+18)}%,.92)`);g.addColorStop(.38,`hsla(${hue},81%,${light}%,.88)`);if(p.i%4===0){g.addColorStop(.42,'rgba(217,245,255,.96)');g.addColorStop(.49,`hsla(${hue},85%,${Math.min(88,light+16)}%,.92)`);}g.addColorStop(1,`hsla(${hue+8},78%,${Math.max(20,light-20)}%,.96)`);
      ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(186,230,255,.62)';ctx.lineWidth=.7;ctx.stroke();
    }
    for(let i=0;i<55;i++){const a=i*2.39996+time*.04,r=1.7+(i%9)*.1,p=project([Math.cos(a)*r,Math.sin(i*1.85)*2.1,Math.sin(a)*r]);ctx.fillStyle=`rgba(169,221,255,${.25+(i%5)*.12})`;ctx.fillRect(p[0],p[1],1.2,1.2);}
    if(!paused&&visible&&!document.hidden)id=requestAnimationFrame(draw);
  }
  function schedule(){last=0;if(!id)id=requestAnimationFrame(draw);}
  function sync(){button.textContent=paused?'Resume motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));hero.classList.toggle('motion-paused',paused);}
  new ResizeObserver(()=>{const r=canvas.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);schedule();}).observe(canvas);
  button.addEventListener('click',()=>{paused=!paused;sync();schedule();});
  reduce.addEventListener('change',e=>{paused=e.matches;sync();schedule();});
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)schedule();else if(id){cancelAnimationFrame(id);id=0;}},{threshold:.01}).observe(hero);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();else if(id){cancelAnimationFrame(id);id=0;}});
  hero.addEventListener('pointermove',e=>{if(paused)return;const r=hero.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=.5-(e.clientY-r.top)/r.height;hero.style.setProperty('--parallax-x',`${mx*-9}px`);hero.style.setProperty('--parallax-y',`${my*6}px`);});
  hero.classList.add('has-canvas-motion');button.hidden=false;sync();schedule();
})();
