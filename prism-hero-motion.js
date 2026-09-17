(() => {
  'use strict';
  const canvas = document.querySelector('.flow-canvas');
  const button = document.querySelector('.motion-toggle');
  if (!canvas || !button) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let running = !preference.matches, visible = true, frame = 0;
  let width = 1, height = 1, time = 0, previous = 0;
  const TAU = Math.PI * 2;
  const strands = 68, steps = 128;

  // Parametric strands form a dimensional, tapered wave. The geometry itself
  // deforms over time; this is not a photograph, video, or image transform.
  function point(t, u, clock) {
    const sway = Math.sin(clock * .42 + t * 5.8);
    const center = .49 + .24 * Math.sin(t * 5.1 - .8 + .055 * sway);
    const spread = .018 + .78 * Math.pow(t, 1.35);
    const twist = .6 + t * 3.5 + .16 * Math.sin(clock * .38 + t * 2);
    const x = center + u * spread * Math.cos(twist);
    const y = -.1 + 1.29 * t + u * spread * Math.sin(twist) * .43
      + .023 * Math.sin(t * 9 + clock * .65 + u * 1.8) * Math.sin(Math.PI * t);
    const mobile = width < 650;
    return { x: width * ((mobile ? -.06 : .37) + x * (mobile ? 1.22 : .76)),
      y: height * y, depth: (Math.sin(twist) * u + 1) / 2 };
  }
  function path(u, clock) {
    ctx.beginPath();
    for (let j = 0; j <= steps; j++) {
      const p = point(j / steps, u, clock);
      if (j) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
    }
  }
  function dot(p, radius, color, glow) {
    ctx.fillStyle = color;
    if (glow) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5);
      g.addColorStop(0, color); g.addColorStop(.25, color); g.addColorStop(1, 'rgba(220,202,231,0)');
      ctx.fillStyle = g;ctx.beginPath();ctx.arc(p.x,p.y,radius*5,0,TAU);ctx.fill();ctx.fillStyle=color;
    }
    ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TAU);ctx.fill();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Fine architectural guides stay behind the living wave.
    ctx.strokeStyle = 'rgba(213,198,223,.10)';ctx.lineWidth = .65;
    [.62,.78,.94].forEach(x=>{ctx.beginPath();ctx.moveTo(width*x,0);ctx.lineTo(width*x,height);ctx.stroke();});
    ctx.beginPath();ctx.ellipse(width*.79,height*.49,width*.19,height*.34,-.38,0,TAU);ctx.stroke();
    for (let i = 0; i < strands; i++) {
      const u = (i / (strands - 1) - .5) * 2;
      path(u,time);
      ctx.strokeStyle = i % 7 === 0 ? 'rgba(200,211,235,.48)' : `rgba(229,213,231,${.19+.2*(1-Math.abs(u))})`;
      ctx.lineWidth = i % 7 === 0 ? .8 : .55;ctx.stroke();
      // A regular field of tiny beads describes depth without softening lines.
      for (let j=0;j<42;j++) {
        const t=(j/42 + (i%3)*.006 + time*.007)%1;
        const p=point(t,u,time);
        dot(p,.46+p.depth*.44,`rgba(232,222,238,${.25+p.depth*.4})`,false);
      }
      // Highlights travel along individual curves independently of deformation.
      if(i%4===0) {
        const t=(i*.071+time*.045)%1,p=point(t,u,time);
        const colors=['rgba(226,201,171,.88)','rgba(177,206,225,.92)','rgba(224,208,240,.92)'];
        dot(p,1.2+p.depth*.8,colors[(i/4)%3],true);
      }
    }
  }
  function schedule() {
    cancelAnimationFrame(frame);frame=0;previous=0;
    if(running && visible && !document.hidden) frame=requestAnimationFrame(tick);
  }
  function tick(now) {
    if(previous) time += Math.min((now-previous)/1000,.05);
    previous=now;draw();frame=requestAnimationFrame(tick);
  }
  function control() {
    button.textContent=running?'Pause motion':'Play motion';
    button.setAttribute('aria-pressed',String(running));
    button.setAttribute('aria-label',running?'Pause flowing wave animation':'Play flowing wave animation');
    schedule();
  }
  function resize() {
    const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  button.hidden=false;
  button.addEventListener('click',()=>{running=!running;control();});
  preference.addEventListener('change',()=>{running=!preference.matches;control();});
  document.addEventListener('visibilitychange',schedule);
  if(typeof IntersectionObserver==='function')new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:0}).observe(canvas);
  if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(canvas);
  else addEventListener('resize',resize);
  resize();control();
})();
