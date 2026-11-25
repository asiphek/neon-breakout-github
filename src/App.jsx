import { useEffect, useRef, useState, useCallback } from 'react'
const THEMES = {
  pink: {name:'Cyber Pink / Purple', bg:'#0d021a', paddle:'#ff2d95', ball:'#fff', accent:'#ff2d95', brick:['#ff2d95','#a855f7','#22d3ee','#facc15']},
  blue: {name:'Electric Blue / Cyan', bg:'#020a1a', paddle:'#22d3ee', ball:'#fff', accent:'#22d3ee', brick:['#22d3ee','#3b82f6','#60a5fa','#a5f3fc']},
  green:{name:'Toxic Green / Lime', bg:'#021a08', paddle:'#a3e635', ball:'#fff', accent:'#a3e635', brick:['#a3e635','#22c55e','#4ade80','#fde047']},
  sunset:{name:'Sunset Orange / Red', bg:'#1a0500', paddle:'#fb923c', ball:'#fff', accent:'#fb923c', brick:['#fb923c','#ef4444','#f97316','#facc15']},
}
const DIFFS = { Normal:{speed:4.2,paddleW:120,mult:1}, Medium:{speed:5.4,paddleW:100,mult:1.5}, Hard:{speed:6.8,paddleW:82,mult:2} }
const BOOSTERS = {
  WIDE:{label:'WIDE',color:'#22d3ee',desc:'Paddle 1.6x wider'},
  MULTI:{label:'MULTI',color:'#facc15',desc:'+2 balls'},
  SLOW:{label:'SLOW',color:'#a3e635',desc:'Ball slower'},
  LASER:{label:'LASER',color:'#ef4444',desc:'SPACE / SHOOT to fire'},
  SHIELD:{label:'SHIELD',color:'#a855f7',desc:'Saves ball once'},
  LIFE:{label:'+1 LIFE',color:'#ff2d95',desc:'Extra life'},
}
const BOOSTER_DURATION = 8000 // ms — boosters now last 8 seconds

function loadScores(){ try{return JSON.parse(localStorage.getItem('neon-breakout-scores')||'[]')}catch{return[]} }
function loadSettings(){ try{return JSON.parse(localStorage.getItem('neon-breakout-settings')||'null')||{volume:70,muted:false,theme:'pink',difficulty:'Normal'}}catch{return{volume:70,muted:false,theme:'pink',difficulty:'Normal'}} }

export default function App(){
  const [screen,setScreen]=useState('home')
  const [settings,setSettings]=useState(loadSettings)
  const [scores,setScores]=useState(loadScores)
  const [showSettings,setShowSettings]=useState(false)
  const theme = THEMES[settings.theme]||THEMES.pink
  const updateSettings=(patch)=>{ setSettings(s=>{const n={...s,...patch}; localStorage.setItem('neon-breakout-settings',JSON.stringify(n)); return n}) }
  const saveScore=(entry)=>{ setScores(prev=>{ const list=[entry,...prev].slice(0,100); localStorage.setItem('neon-breakout-scores',JSON.stringify(list)); return list }) }
  const clearScores=()=>{ if(window.confirm('Clear all saved scores? This cannot be undone.')){ setScores([]); localStorage.removeItem('neon-breakout-scores') } }
  const best = scores.length? Math.max(...scores.map(s=>s.score)):0
  return <div style={{background:theme.bg,minHeight:'100vh',transition:'background .3s'}}>
    <div className="wrap">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}><h1 style={{margin:0,textShadow:`0 0 20px ${theme.accent}`,fontSize:'clamp(22px,5vw,38px)'}}>NEON BREAKOUT</h1><button className="btn btn2" style={{padding:'10px 16px'}} onClick={()=>setShowSettings(true)}>⚙️ Settings</button></div>
      {screen==='home' && <Home theme={theme} best={best} scores={scores} settings={settings} updateSettings={updateSettings} onPlay={()=>setScreen('game')} onScores={()=>setScreen('scores')} onHow={()=>setScreen('how')} />}
      {screen==='game' && <Game key={settings.difficulty} theme={theme} settings={settings} onExit={()=>setScreen('home')} onFinish={saveScore} onOpenSettings={()=>setShowSettings(true)} />}
      {screen==='scores' && <Scores scores={scores} onBack={()=>setScreen('home')} onClear={clearScores} />}
      {screen==='how' && <How onBack={()=>setScreen('home')} />}
    </div>
    {showSettings && <SettingsModal theme={theme} settings={settings} updateSettings={updateSettings} onClose={()=>setShowSettings(false)} />}
  </div>
}
function Home({theme,best,scores,settings,updateSettings,onPlay,onScores,onHow}){
  return <div>
    <div className="card" style={{textAlign:'center',marginTop:14}}><p style={{opacity:.8,margin:'4px 0'}}>Break every brick. Catch boosters. Beat your best.</p><h2 style={{fontSize:'clamp(26px,6vw,48px)',margin:'8px 0'}}>Best: {best} &nbsp;•&nbsp; Games: {scores.length}</h2><button className="btn" style={{fontSize:19,padding:'15px 40px'}} onClick={onPlay}>▶ PLAY</button><div className="row" style={{justifyContent:'center',marginTop:12}}><button className="btn btn2" onClick={onScores}>🏆 Scores / History</button><button className="btn btn2" onClick={onHow}>❓ How to Play + Boosters</button></div>
    <div style={{marginTop:14}}><label><b>Difficulty: </b></label>{['Normal','Medium','Hard'].map(d=><button key={d} className="btn btn2" style={{background:settings.difficulty===d?theme.accent:undefined,margin:3}} onClick={()=>updateSettings({difficulty:d})}>{d}{d==='Medium'?' • x1.5':d==='Hard'?' • x2':''}</button>)}</div></div>
    <div className="card" style={{marginTop:12}}><h3 style={{marginTop:0}}>Top 5 Scores</h3>{scores.slice(0,5).map((s,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.1)'}}><span>#{i+1} {s.score} pts</span><span>{s.difficulty} • Level {s.level} {s.won?'🏆':''}</span><span>{new Date(s.date).toLocaleDateString()}</span></div>)}{!scores.length && <p>No games yet — press PLAY!</p>}</div>
  </div>
}
function Scores({scores,onBack,onClear}){ return <div className="card" style={{marginTop:14}}><h2 style={{marginTop:0}}>Previous Scores</h2><p>Total games: {scores.length} • Best: {scores.length?Math.max(...scores.map(s=>s.score)):0} • Average: {scores.length?Math.round(scores.reduce((a,s)=>a+s.score,0)/scores.length):0}</p><div className="row"><button className="btn btn2" onClick={onBack}>← Home</button><button className="btn" style={{background:'#ef4444'}} onClick={onClear}>🗑 Clear Scores</button></div>{scores.map((s,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.1)'}}><b>{s.score} pts</b><span>{s.difficulty} • Level {s.level} • {s.won?'Won':'Lost'}</span><span>{new Date(s.date).toLocaleString()}</span></div>)}{!scores.length && <p>No scores yet.</p>}</div> }
function How({onBack}){ return <div className="card" style={{marginTop:14}}><h2 style={{marginTop:0}}>How to Play</h2><p>Move paddle with mouse, touch drag, or ← → arrow keys. Press SPACE or tap to launch ball. Press <b>ESC to Pause</b>. Press SPACE / SHOOT to fire when you have LASER.</p><h3>Boosters — catch falling capsules with your paddle (last 8s):</h3><div className="booster-legend">{Object.entries(BOOSTERS).map(([k,v])=><div key={k} className="card" style={{borderColor:v.color}}><b style={{color:v.color}}>{v.label}</b><div>{v.desc}</div><small>{k==='SHIELD'||k==='LIFE'?'Instant effect':'Active 8s'}</small></div>)}</div><button className="btn btn2" style={{marginTop:14}} onClick={onBack}>← Back</button></div> }
function SettingsModal({settings,updateSettings,onClose}){ return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:16}} onClick={onClose}><div className="card" style={{maxWidth:480,width:'100%',background:'#12082b',maxHeight:'90vh',overflow:'auto'}} onClick={e=>e.stopPropagation()}><h2 style={{marginTop:0}}>Settings</h2><label>Volume: {settings.muted?0:settings.volume}%</label><input type="range" min="0" max="100" value={settings.volume} onChange={e=>updateSettings({volume:Number(e.target.value),muted:false})} /><button className="btn btn2" onClick={()=>updateSettings({muted:!settings.muted})}>{settings.muted?'🔇 Unmute':'🔊 Mute'}</button><h3>Theme</h3><div className="row">{Object.entries(THEMES).map(([k,t])=><button key={k} className="btn btn2" style={{borderColor:t.accent,background:settings.theme===k?t.accent:undefined}} onClick={()=>updateSettings({theme:k})}>{t.name}</button>)}</div><h3>Difficulty</h3><div className="row">{['Normal','Medium','Hard'].map(d=><button key={d} className="btn btn2" style={{background:settings.difficulty===d?'#ff2d95':undefined}} onClick={()=>updateSettings({difficulty:d})}>{d}</button>)}</div><button className="btn" style={{marginTop:16,width:'100%'}} onClick={onClose}>Done</button></div></div> }

function Game({theme,settings,onExit,onFinish,onOpenSettings}){
  const canvasRef=useRef(null), boxRef=useRef(null)
  const [hud,setHud]=useState({score:0,lives:3,level:1,paused:false,over:false,won:false,active:null,activeLeft:0,shield:false})
  const stateRef=useRef(null)
  const settingsRef=useRef(settings); settingsRef.current=settings
  const playTone=useCallback((freq=440,dur=0.08,type='square')=>{ if(settingsRef.current.muted) return; try{ const Ctx=window.AudioContext||window.webkitAudioContext; const ctx=new Ctx(); const o=ctx.createOscillator(), g=ctx.createGain(); o.type=type; o.frequency.value=freq; g.gain.value=(settingsRef.current.volume/100)*0.15; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+dur);}catch{} },[])
  const initLevel=(level,W,H,prev)=>{
    const rows=5, cols=8, bw=W/cols, bh=22, bricks=[]
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) bricks.push({x:c*bw+3,y:50+r*(bh+6),w:bw-6,h:bh,color:theme.brick[r%theme.brick.length],alive:true})
    return {...(prev||{}), bricks, paddle:{x:W/2-60,y:H-40,w:DIFFS[settingsRef.current.difficulty].paddleW,h:14}, balls:[{x:W/2,y:H-60,dx:0,dy:0,stuck:true}], particles:[], drops:[], lasers:[], active:null, activeUntil:0, shield:false, level }
  }
  const finish=(won)=>{ const s=stateRef.current; if(!s||s.finished) return; s.finished=true; const entry={score:s.score,difficulty:settingsRef.current.difficulty,level:s.level,date:new Date().toISOString(),won}; onFinish(entry); setHud(h=>({...h,over:true,won,score:s.score})); playTone(won?880:220,0.3,'sine') }
  useEffect(()=>{
    const canvas=canvasRef.current, box=boxRef.current
    let raf=null
    const resize=()=>{ const r=box.getBoundingClientRect(); const W=Math.max(280,r.width); const H=Math.max(320,r.height); const dpr=Math.min(window.devicePixelRatio||1,2); canvas.width=W*dpr; canvas.height=H*dpr; const ctx=canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); if(!stateRef.current) stateRef.current={...initLevel(1,W,H),score:0,lives:3,W,H,finished:false,last:performance.now()}; else { stateRef.current.W=W; stateRef.current.H=H; stateRef.current.paddle.y=H-40; stateRef.current.paddle.x=Math.min(stateRef.current.paddle.x, W-stateRef.current.paddle.w); } }
    resize(); const ro=new ResizeObserver(resize); ro.observe(box)
    const loop=(t)=>{
      raf=requestAnimationFrame(loop)
      const st=stateRef.current; if(!st) return
      st.last=t
      if(st.paused||st.finished) { draw(); return }
      // Booster expiry — 8 second duration
      if(st.active && Date.now()>st.activeUntil){
        if(st.active==='WIDE') st.paddle.w=DIFFS[settingsRef.current.difficulty].paddleW
        if(st.active==='SLOW') st.balls.forEach(b=>{b.dx/=0.6;b.dy/=0.6})
        st.active=null
      }
      st.drops.forEach(d=>d.y+=2.2); st.drops=st.drops.filter(d=>d.y<st.H)
      st.drops=st.drops.filter(d=>{ const hit=d.y+d.h>=st.paddle.y && d.y<=st.paddle.y+st.paddle.h && d.x+d.w>=st.paddle.x && d.x<=st.paddle.x+st.paddle.w; if(hit){ applyBooster(d.kind); playTone(660,0.12); } return !hit })
      st.lasers.forEach(l=>l.y-=9); st.lasers=st.lasers.filter(l=>l.y>0)
      st.lasers.forEach(l=>{ st.bricks.forEach(b=>{ if(b.alive && l.x>b.x && l.x<b.x+b.w && l.y>b.y && l.y<b.y+b.h){ b.alive=false; st.score+=Math.round(10*DIFFS[settingsRef.current.difficulty].mult); spawnParticles(b); l.dead=true } }) }); st.lasers=st.lasers.filter(l=>!l.dead)
      st.balls.forEach(b=>{
        if(b.stuck){ b.x=st.paddle.x+st.paddle.w/2; b.y=st.paddle.y-12; return }
        b.x+=b.dx; b.y+=b.dy
        if(b.x<8){b.x=8;b.dx=Math.abs(b.dx);playTone(300,0.05)} if(b.x>st.W-8){b.x=st.W-8;b.dx=-Math.abs(b.dx);playTone(300,0.05)} if(b.y<8){b.y=8;b.dy=Math.abs(b.dy);playTone(300,0.05)}
        if(b.dy>0 && b.y+8>=st.paddle.y && b.y+8<=st.paddle.y+st.paddle.h+8 && b.x>=st.paddle.x-8 && b.x<=st.paddle.x+st.paddle.w+8){ const rel=(b.x-st.paddle.x)/st.paddle.w-0.5; b.dx=rel*7; b.dy=-Math.abs(b.dy); b.y=st.paddle.y-10; playTone(520,0.06) }
        st.bricks.forEach(br=>{ if(!br.alive) return; if(b.x>br.x-8 && b.x<br.x+br.w+8 && b.y>br.y-8 && b.y<br.y+br.h+8){ br.alive=false; b.dy*=-1; st.score+=Math.round(10*DIFFS[settingsRef.current.difficulty].mult); spawnParticles(br); playTone(740,0.07); if(Math.random()<0.25){ const kinds=Object.keys(BOOSTERS); st.drops.push({x:br.x+br.w/2-10,y:br.y,w:20,h:20,kind:kinds[Math.floor(Math.random()*kinds.length)]}) } } })
        if(b.y>st.H){ b.dead=true }
      })
      st.balls=st.balls.filter(b=>!b.dead)
      if(!st.balls.length){
        if(st.shield){ st.shield=false; st.balls=[{x:st.paddle.x+st.paddle.w/2,y:st.paddle.y-12,dx:0,dy:0,stuck:true}]; playTone(400,0.2) }
        else { st.lives--; playTone(180,0.3,'sawtooth'); if(st.lives<=0){ finish(false); return } else st.balls=[{x:st.paddle.x+st.paddle.w/2,y:st.paddle.y-12,dx:0,dy:0,stuck:true}] }
      }
      if(st.bricks.every(b=>!b.alive)){ const nl=st.level+1; const kept={score:st.score,lives:st.lives}; stateRef.current={...initLevel(nl,st.W,st.H,stateRef.current),score:kept.score,lives:kept.lives,W:st.W,H:st.H,paused:false,finished:false,last:t}; playTone(880,0.2) }
      setHud(h=>({...h,score:st.score,lives:st.lives,level:st.level,active:st.active,activeLeft:st.active?Math.max(0,Math.ceil((st.activeUntil-Date.now())/1000)):0,shield:st.shield}))
      draw()
    }
    function spawnParticles(b){ const st=stateRef.current; for(let i=0;i<10;i++) st.particles.push({x:b.x+b.w/2,y:b.y+b.h/2,dx:(Math.random()-0.5)*4,dy:(Math.random()-0.5)*4,life:30,color:b.color}) }
    function applyBooster(kind){
      const st=stateRef.current; if(kind==='LIFE'){ st.lives++; return }
      if(kind==='MULTI'){ const main=st.balls[0]; if(main) st.balls.push({x:main.x,y:main.y,dx:3,dy:-4,stuck:false},{x:main.x,y:main.y,dx:-3,dy:-4,stuck:false}); return }
      if(kind==='SHIELD'){ st.shield=true; return }
      st.active=kind; st.activeUntil=Date.now()+BOOSTER_DURATION
      if(kind==='WIDE') st.paddle.w=DIFFS[settingsRef.current.difficulty].paddleW*1.6
      if(kind==='SLOW') st.balls.forEach(b=>{b.dx*=0.6;b.dy*=0.6})
    }
    function draw(){
      const ctx=canvas.getContext('2d'); const st=stateRef.current; if(!st) return
      ctx.clearRect(0,0,st.W,st.H)
      st.bricks.forEach(b=>{ if(!b.alive) return; ctx.shadowBlur=14; ctx.shadowColor=b.color; ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h); ctx.shadowBlur=0 })
      st.drops.forEach(d=>{ ctx.shadowBlur=12; ctx.shadowColor=BOOSTERS[d.kind].color; ctx.fillStyle=BOOSTERS[d.kind].color; ctx.fillRect(d.x,d.y,d.w,d.h); ctx.fillStyle='#000'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.fillText(BOOSTERS[d.kind].label,d.x+10,d.y+13); ctx.shadowBlur=0 })
      st.lasers.forEach(l=>{ ctx.fillStyle='#ff3b3b'; ctx.fillRect(l.x-2,l.y,4,14) })
      if(st.shield){ ctx.strokeStyle='#a855f7'; ctx.setLineDash([6,4]); ctx.beginPath(); ctx.moveTo(0,st.H-6); ctx.lineTo(st.W,st.H-6); ctx.stroke(); ctx.setLineDash([]) }
      ctx.shadowBlur=16; ctx.shadowColor=theme.paddle; ctx.fillStyle=theme.paddle; ctx.fillRect(st.paddle.x,st.paddle.y,st.paddle.w,st.paddle.h); ctx.shadowBlur=0
      st.balls.forEach(b=>{ ctx.shadowBlur=16; ctx.shadowColor='#fff'; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x,b.y,8,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0 })
      st.particles.forEach(p=>{ p.x+=p.dx; p.y+=p.dy; p.life--; ctx.fillStyle=p.color; ctx.fillRect(p.x,p.y,4,4) }); st.particles=st.particles.filter(p=>p.life>0)
      if(st.balls[0]?.stuck && !st.paused && !st.finished){ ctx.fillStyle='#fff'; ctx.font='bold 15px sans-serif'; ctx.textAlign='center'; ctx.fillText('Tap / SPACE to launch • ESC to Pause', st.W/2, st.H/2) }
    }
    const launch=()=>{ const st=stateRef.current; if(!st||st.paused||st.finished) return; st.balls.forEach(b=>{ if(b.stuck){ b.stuck=false; const sp=DIFFS[settingsRef.current.difficulty].speed*(st.active==='SLOW'?0.6:1); b.dx=(Math.random()-0.5)*3; b.dy=-sp } }) }
    const shoot=()=>{ const st=stateRef.current; if(!st||st.active!=='LASER') return; st.lasers.push({x:st.paddle.x+st.paddle.w/2,y:st.paddle.y}); playTone(900,0.05) }
    const move=(clientX)=>{ const st=stateRef.current; if(!st) return; const r=canvas.getBoundingClientRect(); let x=clientX-r.left-st.paddle.w/2; x=Math.max(0,Math.min(st.W-st.paddle.w,x)); st.paddle.x=x }
    const onKey=(e)=>{ const st=stateRef.current; if(e.key==='Escape'){ if(!st) return; st.paused=!st.paused; setHud(h=>({...h,paused:st.paused})); return } if(e.key===' '){ e.preventDefault(); if(stateRef.current?.active==='LASER' && !stateRef.current?.balls[0]?.stuck) shoot(); else launch() } if(e.key==='ArrowLeft'){ st.paddle.x=Math.max(0,st.paddle.x-22) } if(e.key==='ArrowRight'){ st.paddle.x=Math.min(st.W-st.paddle.w,st.paddle.x+22) } }
    const onPointer=(e)=>{ move(e.clientX); if(e.type==='pointerdown') launch() }
    window.addEventListener('keydown',onKey); canvas.addEventListener('pointermove',onPointer); canvas.addEventListener('pointerdown',onPointer)
    raf=requestAnimationFrame(loop)
    stateRef.current._shoot=shoot
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('keydown',onKey); canvas.removeEventListener('pointermove',onPointer); canvas.removeEventListener('pointerdown',onPointer) }
  },[theme])
  const togglePause=()=>{ const st=stateRef.current; if(!st||st.finished) return; st.paused=!st.paused; setHud(h=>({...h,paused:st.paused})) }
  const restart=()=>{ const st=stateRef.current; const W=st.W,H=st.H; stateRef.current={...initLevel(1,W,H),score:0,lives:3,W,H,paused:false,finished:false,last:performance.now()}; setHud({score:0,lives:3,level:1,paused:false,over:false,won:false,active:null,activeLeft:0,shield:false}) }
  return <div style={{marginTop:10}}>
    <div className="hud"><span className="badge">Score: {hud.score}</span><span className="badge">❤️ Lives: {hud.lives}</span><span className="badge">Level: {hud.level}</span><span className="badge">{settings.difficulty} {settings.difficulty==='Medium'?'x1.5':settings.difficulty==='Hard'?'x2':''}</span><span className="badge">ESC = Pause</span>{hud.active && <span className="badge" style={{background:BOOSTERS[hud.active].color,color:'#000'}}>{BOOSTERS[hud.active].label} • {hud.activeLeft}s</span>}{hud.shield && <span className="badge">🛡 Shield</span>}</div>
    <div ref={boxRef} className="game-box" style={{marginTop:8,border:`2px solid ${theme.accent}`,borderRadius:18,boxShadow:`0 0 26px ${theme.accent}55`,overflow:'hidden',background:'#05010f',width:'100%',aspectRatio:'4 / 3',maxHeight:'70vh'}}><canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block',touchAction:'none'}} />
      {hud.paused && !hud.over && <div className="overlay"><div className="card" style={{textAlign:'center'}}><h2 style={{margin:'0 0 6px'}}>Paused</h2><p style={{margin:'0 0 10px'}}>Press ESC or Resume to continue.</p><button className="btn" onClick={togglePause}>▶ Resume</button></div></div>}
      {hud.over && <div className="overlay"><div className="card" style={{textAlign:'center'}}><h2 style={{margin:'0 0 6px'}}>{hud.won?'You Win! 🏆':'Game Over'}</h2><p style={{margin:'0 0 10px'}}>Final Score: <b>{hud.score}</b></p><div className="row" style={{justifyContent:'center'}}><button className="btn" onClick={restart}>▶ Play Again</button><button className="btn btn2" onClick={onExit}>🏠 Home</button></div></div></div>}
    </div>
    <div className="row" style={{justifyContent:'center',marginTop:10}}><button className="btn btn2" onClick={togglePause}>{hud.paused?'▶ Resume':'⏸ Pause (ESC)'}</button>{hud.active==='LASER' && <button className="btn" style={{background:'#ef4444'}} onClick={()=>stateRef.current?._shoot()}>🔫 SHOOT (SPACE)</button>}<button className="btn btn2" onClick={restart}>↻ Restart</button><button className="btn btn2" onClick={onOpenSettings}>⚙️ Settings</button><button className="btn btn2" onClick={onExit}>🏠 Home</button></div>
  </div>
}