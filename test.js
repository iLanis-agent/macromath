const e = require('./engine.js');
const cases = require('./expected.json');
let pass=0, fail=0;
const close=(a,b)=>Math.abs(a-b) <= 1e-9*Math.max(1,Math.abs(b));
function cmp(a,b,path){
  if (typeof b==='number'){ if(!(typeof a==='number'&&close(a,b))) throw new Error(path+': '+a+' != '+b); return; }
  if (typeof b==='object'&&b!==null){ for(const k of Object.keys(b)) cmp(a&&a[k],b[k],path+'.'+k); return; }
  if (a!==b) throw new Error(path+': '+JSON.stringify(a)+' != '+JSON.stringify(b));
}
const fns={mag:e.magnification,fd:e.focusDistance,ea:e.effectiveAperture,dif:e.diffraction,fs:e.focusStack};
for(const c of cases){
  try{ cmp(fns[c.fn](...c.args),c.exp,c.fn+'('+c.args+')'); pass++; }
  catch(err){ fail++; console.log('FAIL',err.message); }
}
const A=[[e.COC_FF,0.029],[e.STACK_OVERLAP,0.75],[e.LAMBDA_MM,0.00055],
  [e.magnification(50,50).m,1],[e.effectiveAperture(4,1).nEff,8],[e.effectiveAperture(4,1).stopsLost,2],
  [e.focusDistance(50,1).objectDist,100],[e.focusDistance(50,1).imageDist,100]];
for(const [g,w] of A){ if(close(g,w)) pass++; else { fail++; console.log('ANCHOR FAIL',g,w);} }
function prop(name,f){ try{ if(!f()) throw 0; pass++; }catch{ fail++; console.log('PROP FAIL',name); } }
prop('extension raises magnification',()=> e.magnification(50,68).m > e.magnification(50,25).m);
prop('shorter lens gets more mag per mm of tube',()=> e.magnification(35,25).m > e.magnification(100,25).m);
prop('1:1 loses exactly 2 stops',()=> close(e.effectiveAperture(5.6,1).stopsLost,2));
prop('stops lost monotone in m',()=> e.effectiveAperture(8,2).stopsLost > e.effectiveAperture(8,1).stopsLost);
prop('object distance shrinks as m grows',()=> e.focusDistance(50,2).objectDist < e.focusDistance(50,0.5).objectDist);
prop('thin-lens conjugate identity: u x i = f^2 (1+1/m)(1+m)',()=>{ const r=e.focusDistance(60,1.2); return close(r.objectDist*r.imageDist, 60*60*(1+1/1.2)*(1+1.2)); });
prop('higher N_eff grows the Airy disk',()=> e.diffraction(16,36,6000).airyUm > e.diffraction(8,36,6000).airyUm);
prop('smaller pixels push diffraction verdict harsher',()=> e.diffraction(16,36,8256).ratio > e.diffraction(16,36,4000).ratio);
prop('deeper subject needs more frames',()=> e.focusStack(40,1,8).frames > e.focusStack(10,1,8).frames);
prop('more magnification shrinks DOF',()=> e.focusStack(10,2,8).dof < e.focusStack(10,0.5,8).dof);
prop('frames cover the depth',()=>{ const s=e.focusStack(20,1.36,8); return s.frames*s.step>=20; });
prop('stopping down widens DOF',()=> e.focusStack(10,1,11).dof > e.focusStack(10,1,4).dof);
for(const bad of [[0,25],[50,-1],[-50,25],[50,25,-1]]){ try{ e.magnification(...bad); fail++; console.log('ERR FAIL mag',bad);}catch{ pass++; } }
for(const bad of [[0,1],[50,0],[50,-1]]){ try{ e.focusDistance(...bad); fail++; console.log('ERR FAIL fd',bad);}catch{ pass++; } }
for(const bad of [[0,1],[-8,1],[8,-1]]){ try{ e.effectiveAperture(...bad); fail++; console.log('ERR FAIL ea',bad);}catch{ pass++; } }
for(const bad of [[0,36,6000],[8,0,6000],[8,36,0]]){ try{ e.diffraction(...bad); fail++; console.log('ERR FAIL dif',bad);}catch{ pass++; } }
for(const bad of [[0,1,8],[10,0,8],[10,1,0],[10,1,8,0]]){ try{ e.focusStack(...bad); fail++; console.log('ERR FAIL fs',bad);}catch{ pass++; } }
console.log(pass+'/'+(pass+fail)+' checks pass');
process.exit(fail?1:0);
