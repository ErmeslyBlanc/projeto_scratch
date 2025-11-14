
/* ===== NAV mobile ===== */
const toggle = document.getElementById('nav-toggle');
const list   = document.getElementById('nav-list');
toggle?.addEventListener('click', () => {
  const open = list.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

/* ===== Smooth scroll + ativo no menu ===== */
const sections = [...document.querySelectorAll('section[id]')];
const links = [...document.querySelectorAll('.nav-list a')].filter(a => {
  const id = a.getAttribute('href') || '';
  return id.startsWith('#') && document.querySelector(id);
});
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id && document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    list?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});

const onScroll = () => {
  const y = window.scrollY + 120;
  let current = sections[0]?.id;
  sections.forEach(s => { if (y >= s.offsetTop) current = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
};
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ===== Stepbar dinâmica ===== */
const stepbarFill = document.getElementById('stepbar-fill');
const dots = [...document.querySelectorAll('.stepbar-dots .dot')];
const steps = [...document.querySelectorAll('.steps .step')];

const updateStepbar = () => {
  if (!steps.length || !stepbarFill) return;
  const y = window.scrollY + window.innerHeight * .35;
  let idx = 0;
  steps.forEach((s, i) => { if (y >= s.getBoundingClientRect().top + window.scrollY) idx = i; });
  const percent = ((idx + 1) / steps.length) * 100;
  stepbarFill.style.inset = `0 ${Math.max(0, 100 - percent)}% 0 0`;

  dots.forEach((d,i) => {
    d.classList.toggle('active', i === idx);
    d.classList.toggle('reached', i < idx);
  });
};
window.addEventListener('scroll', updateStepbar, { passive:true });
updateStepbar();

/* ===== Ambient dots — ATIVO SOMENTE NA PÁGINA METODOLOGIA ===== */
(function(){
  const root = document.getElementById('ambient-dots');
  const isMetodologia = !!document.getElementById('metodologia');
  if (!root || !isMetodologia) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DOTS = reduced ? 0 : 42;
  const rand = (min, max) => Math.random() * (max - min) + min;

  for(let i=0; i<DOTS; i++){
    const d = document.createElement('span');
    d.className = 'ambient-dot';
    const xPct  = rand(0, 100).toFixed(2) + '%';
    const size  = rand(4, 9).toFixed(1) + 'px';
    const dur   = rand(10, 20).toFixed(2) + 's';
    const delay = rand(0, 10).toFixed(2) + 's';
    const sway  = rand(4, 8).toFixed(2) + 's';
    const swayX = (Math.random() < 0.5 ? -1 : 1) * rand(12, 26);
    const color = Math.random() < 0.5 ? 'var(--accent)' : 'var(--accent-2)';

    d.style.setProperty('--x', xPct);
    d.style.setProperty('--size', size);
    d.style.setProperty('--dur', dur);
    d.style.setProperty('--delay', delay);
    d.style.setProperty('--sway', sway);
    d.style.setProperty('--sx', swayX + 'px');
    d.style.setProperty('--dot-color', color);
    d.style.top = rand(-40, window.innerHeight * 0.6) + 'px';

    root.appendChild(d);
  }
})();

/* =========================================================
   Desafios rápidos: copiar e jogar (+ título dinâmico)
========================================================= */
const chipsRoot = document.getElementById('quick-challenges') || document.querySelector('.chips-row');

function getChipLabel(chip){
  if (!chip) return 'Desafio';
  const labelAttr = chip.getAttribute('data-label');
  if (labelAttr) return labelAttr;
  const c = chip.cloneNode(true);
  c.querySelectorAll('button').forEach(b => b.remove());
  return c.textContent.trim().replace(/\s+/g,' ');
}
function slugify(s){
  return (s||'').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

/* mapa modo + configs por jogo */
const MODE_BY_SLUG = {
  'capturar-frutas': 'catch',
  'jogo-da-cobrinha': 'snake',
  'ping-pong': 'pong',
  'condicao-por-cor': 'catch',
  'lacos-direcao': 'catch'
};
const GAME_CONFIG = {
  'capturar-frutas': { time:30, startOrbs:6, speed:1.00, palette:['#7dd3fc','#a78bfa'] },
  'jogo-da-cobrinha': { time:35, grid:20, speed:10, palette:['#34d399','#60a5fa'] },
  'ping-pong': { time:25, lives:3, ballSpeed:200, palette:['#f472b6','#a78bfa'] },
  'condicao-por-cor': { time:30, startOrbs:6, speed:1.10, palette:['#22d3ee','#60a5fa'] },
  'lacos-direcao': { time:30, startOrbs:6, speed:1.20, palette:['#fde047','#a78bfa'] }
};
let currentGameKey = 'capturar-frutas';

chipsRoot?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy');
  if (!btn) return;
  const chip = btn.closest('.chipx');
  const txt = chip?.dataset.copy || '';
  try{
    await navigator.clipboard.writeText(txt);
    btn.classList.add('copied');
    btn.textContent = 'Copiado!';
    setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'Copiar'; }, 1200);
  }catch(err){ console.warn('Clipboard bloqueado:', err); }
});

/* abrir modal de jogo */
chipsRoot?.addEventListener('click', (e) => {
  const btn = e.target.closest('.play');
  if (!btn) return;
  const chip = btn.closest('.chipx');
  const pid = (chip?.dataset.project || '940627620').trim();
  openModal(pid, chip);
});

/* ===== Modal Scratch/Mini-game ===== */
const modal = document.getElementById('modal-desafio');
const closeBtn = modal?.querySelector('.modal-close');
const tabs = modal ? [...modal.querySelectorAll('.tab')] : [];
const panels = modal ? [...modal.querySelectorAll('.tab-panel')] : [];
const embedWrap = modal?.querySelector('.scratch-embed');
const linkProjeto = modal?.querySelector('#ver-projeto');
const linkRemix = modal?.querySelector('#remixar-projeto');
const modalTitle = document.getElementById('modal-title');

function setEmbed(projectId){
  if (!embedWrap) return;
  embedWrap.dataset.project = projectId;
  embedWrap.innerHTML = `<iframe allowtransparency="true" src="https://scratch.mit.edu/projects/${projectId}/embed" allowfullscreen></iframe>`;
  if (linkProjeto) linkProjeto.href = `https://scratch.mit.edu/projects/${projectId}`;
  if (linkRemix) linkRemix.href = `https://scratch.mit.edu/projects/${projectId}/editor`;
}

function openModal(projectId, chip){
  const label = getChipLabel(chip);
  currentGameKey = slugify(label) || 'capturar-frutas';
  const mode = MODE_BY_SLUG[currentGameKey] || 'catch';
  const cfg = GAME_CONFIG[currentGameKey] || GAME_CONFIG['capturar-frutas'];

  if (modalTitle) modalTitle.textContent = `Jogar - ${label}`;
  window.setMiniConfig && window.setMiniConfig({ ...cfg, mode });

  setEmbed(projectId);
  modal?.classList.add('open');
  switchTab('scratch'); // abre na aba Scratch por padrão
}

function closeModal(){
  modal?.classList.remove('open');
  if (embedWrap) embedWrap.innerHTML = ''; // descarrega o iframe
  window.stopMiniGame && window.stopMiniGame();
}

closeBtn?.addEventListener('click', closeModal);
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
});

function switchTab(name){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  panels.forEach(p => p.classList.toggle('show', p.dataset.panel === name));
}
tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

/* =========================================================
   MINI-GAMES (3 modos: catch, snake, pong)
========================================================= */
(() => {
  const canvas = document.getElementById('miniCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const tempoEl = document.getElementById('tempo');
  const pontosEl = document.getElementById('pontos');
  const btnStart = document.getElementById('iniciar-mini');

  let w = canvas.width, h = canvas.height;
  let raf = null, last = 0;
  let state = {
    running:false, mode:'catch',
    time:30, points:0,
    // catch
    paddle:null, drops:[], dropTimer:0,
    // snake
    grid:20, cell:18, snake:null, dir:{x:1,y:0}, nextDir:{x:1,y:0}, food:null, stepAcc:0, stepsPerSec:10,
    // pong
    ball:null, paddleP:null, lives:3
  };

  /* ===== API pública p/ configurar por jogo ===== */
  const defaults = { mode:'catch', time:30, startOrbs:6, speed:1.0, grid:20, steps:10, lives:3, ballSpeed:200, palette:['#7dd3fc','#a78bfa'] };
  window.setMiniConfig = (cfg={}) => {
    const c = { ...defaults, ...cfg };
    state.mode = c.mode;
    state.time = c.time|0;
    state.points = 0;

    // modo catch
    state.drops = [];
    state.dropTimer = 0;

    // modo snake
    state.grid = c.grid|0 || 20;
    state.stepsPerSec = c.speed || c.steps || 10;
    state.cell = Math.floor(Math.min(w, h) / state.grid);

    // modo pong
    state.lives = c.lives|0 || 3;

    tempoEl && (tempoEl.textContent = state.time);
    pontosEl && (pontosEl.textContent = state.points);
  };
  window.stopMiniGame = () => {
    state.running = false;
    cancelAnimationFrame(raf);
  };

  /* ===== Helpers ===== */
  const isMiniActive = () => {
    return modal?.classList.contains('open') &&
           modal.querySelector('.tab.active')?.dataset.tab === 'mini';
  };
  const rnd = (a,b)=>Math.random()*(b-a)+a;

  /* ===== START por modo ===== */
  function start(){
    cancelAnimationFrame(raf);
    last = performance.now();
    state.points = 0;
    tempoEl.textContent = state.time|0;
    pontosEl.textContent = 0;

    if (state.mode === 'catch'){
      state.paddle = { x: w/2, w: 120, h: 14, y: h-30, speed: 380, vx:0 };
      state.drops = [];
      state.dropTimer = 0;
    }
    else if (state.mode === 'snake'){
      const cx = Math.floor((w/state.cell)/2)|0;
      const cy = Math.floor((h/state.cell)/2)|0;
      state.snake = [{x:cx-1,y:cy},{x:cx,y:cy}];
      state.dir = {x:1,y:0};
      state.nextDir = {x:1,y:0};
      placeFood();
      state.stepAcc = 0;
    }
    else if (state.mode === 'pong'){
      state.paddleP = { y: h/2 - 40, h: 80, w: 10, x: 20, speed: 360 };
      resetBall();
      state.lives = state.lives || 3;
    }

    state.running = true;
    raf = requestAnimationFrame(step);
  }

  /* ===== UPDATE LOOP ===== */
  function step(ts){
    const dt = (ts - last)/1000; last = ts;
    // fundo
    ctx.fillStyle = '#081426';
    ctx.fillRect(0,0,w,h);

    if (state.mode === 'catch') updateCatch(dt);
    else if (state.mode === 'snake') updateSnake(dt);
    else updatePong(dt);

    // tempo
    state.time -= dt;
    tempoEl.textContent = Math.max(0, state.time|0);
    if (state.time <= 0 || (state.mode==='pong' && state.lives <= 0)){
      state.running = false;
      cancelAnimationFrame(raf);
      drawGameOver();
      return;
    }

    if (state.running) raf = requestAnimationFrame(step);
  }

  /* ===== MODO: CATCH ===== */
  function updateCatch(dt){
    // input (paddle)
    const moveLeft = keys['ArrowLeft'] || keys['a'];
    const moveRight = keys['ArrowRight'] || keys['d'];
    state.paddle.vx = (moveLeft ? -1 : 0) + (moveRight ? 1 : 0);
    state.paddle.x += state.paddle.vx * state.paddle.speed * dt;
    state.paddle.x = Math.max(state.paddle.w/2, Math.min(w - state.paddle.w/2, state.paddle.x));

    // spawn de gotas
    state.dropTimer -= dt;
    if (state.dropTimer <= 0){
      state.drops.push({ x:rnd(20,w-20), y:-10, r:rnd(10,16), vy:rnd(120, 220) });
      state.dropTimer = rnd(0.4, 0.85);
    }

    // mover + colisão
    state.drops.forEach(d => d.y += d.vy * dt);
    for(let i=state.drops.length-1;i>=0;i--){
      const d = state.drops[i];
      // colisão com paddle
      if (d.y + d.r >= state.paddle.y &&
          d.x >= state.paddle.x - state.paddle.w/2 &&
          d.x <= state.paddle.x + state.paddle.w/2){
        state.drops.splice(i,1);
        state.points++; pontosEl.textContent = state.points;
        continue;
      }
      // saiu da tela
      if (d.y - d.r > h) state.drops.splice(i,1);
    }

    // draw paddle
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(state.paddle.x - state.paddle.w/2, state.paddle.y, state.paddle.w, state.paddle.h);
    // draw drops
    state.drops.forEach(d=>{
      const grd = ctx.createRadialGradient(d.x-d.r*0.3,d.y-d.r*0.3,2,d.x,d.y,d.r);
      grd.addColorStop(0,'#eaffff'); grd.addColorStop(1,'#a78bfa');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
    });
  }

  /* ===== MODO: SNAKE ===== */
  function placeFood(){
    const cols = Math.floor(w/state.cell), rows = Math.floor(h/state.cell);
    let fx = (Math.random()*cols)|0, fy = (Math.random()*rows)|0;
    state.food = {x:fx,y:fy};
  }
  function updateSnake(dt){
    // acumula até o próximo passo
    state.stepAcc += dt;
    const stepTime = 1 / state.stepsPerSec;
    if (state.stepAcc < stepTime){
      drawSnake(); return;
    }
    state.stepAcc -= stepTime;

    // vira
    state.dir = state.nextDir;

    // próximo head
    const cols = Math.floor(w/state.cell), rows = Math.floor(h/state.cell);
    const head = state.snake[state.snake.length-1];
    let nx = head.x + state.dir.x, ny = head.y + state.dir.y;

    // colisão parede -> fim imediato
    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows){
      state.time = 0; drawSnake(); return;
    }
    // colisão corpo
    if (state.snake.some(s => s.x===nx && s.y===ny)){
      state.time = 0; drawSnake(); return;
    }

    // move
    state.snake.push({x:nx,y:ny});
    // comida?
    if (state.food && nx===state.food.x && ny===state.food.y){
      state.points++; pontosEl.textContent = state.points;
      placeFood();
    }else{
      state.snake.shift();
    }

    drawSnake();
  }
  function drawSnake(){
    // fundo grade leve
    ctx.strokeStyle = '#0f1e3a';
    ctx.lineWidth = 1;
    for(let x=0;x<w;x+=state.cell){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for(let y=0;y<h;y+=state.cell){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // food
    if (state.food){
      ctx.fillStyle = '#34d399';
      ctx.fillRect(state.food.x*state.cell+2, state.food.y*state.cell+2, state.cell-4, state.cell-4);
    }
    // snake
    ctx.fillStyle = '#60a5fa';
    state.snake.forEach(s=>{
      ctx.fillRect(s.x*state.cell+2, s.y*state.cell+2, state.cell-4, state.cell-4);
    });
  }

  /* ===== MODO: PONG ===== */
  function resetBall(){
    const angle = (Math.random()*Math.PI/3 - Math.PI/6); // -30º..30º
    const dir = Math.random()<0.5 ? 1 : -1;
    const speed = GAME_CONFIG['ping-pong'].ballSpeed || 200;
    state.ball = { x:w*0.6, y:h*0.5, r:8, vx: -dir*speed, vy: Math.sin(angle)*speed };
  }
  function updatePong(dt){
    // paddle input
    const up = keys['ArrowUp'] || keys['w'];
    const down = keys['ArrowDown'] || keys['s'];
    const vy = (up?-1:0)+(down?1:0);
    state.paddleP.y += vy * state.paddleP.speed * dt;
    state.paddleP.y = Math.max(0, Math.min(h - state.paddleP.h, state.paddleP.y));

    // ball move
    const b = state.ball;
    b.x += b.vx*dt; b.y += b.vy*dt;

    // walls
    if (b.y-b.r < 0 && b.vy < 0) b.vy *= -1;
    if (b.y+b.r > h && b.vy > 0) b.vy *= -1;

    // right wall = rebate
    if (b.x+b.r > w && b.vx > 0){ b.vx *= -1; }

    // paddle collision
    if (b.x-b.r < state.paddleP.x + state.paddleP.w &&
        b.y > state.paddleP.y &&
        b.y < state.paddleP.y + state.paddleP.h &&
        b.vx < 0){
      b.vx = Math.abs(b.vx) * 1.05; // acelera um pouco
      const rel = (b.y - (state.paddleP.y + state.paddleP.h/2)) / (state.paddleP.h/2);
      b.vy = Math.max(-1, Math.min(1, rel)) * Math.abs(b.vx); // direcional
      state.points++; pontosEl.textContent = state.points;
    }
    // miss (saiu à esquerda)
    if (b.x + b.r < 0){
      state.lives--;
      resetBall();
    }
    // draw
    // paddle
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(state.paddleP.x, state.paddleP.y, state.paddleP.w, state.paddleP.h);
    // ball
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    // lives
    ctx.fillStyle = '#cfe1ff';
    ctx.font = '14px Inter, system-ui'; ctx.fillText(`Vidas: ${state.lives}`, w-90, 20);
  }

  function drawGameOver(){
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#e6ecff';
    ctx.font = '24px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Fim de jogo!', w/2, h/2 - 6);
    ctx.font = '16px Inter, system-ui';
    ctx.fillText(`Pontos: ${state.points}`, w/2, h/2 + 18);
  }

  /* ===== INPUT ===== */
  const keys = {};
  window.addEventListener('keydown', (e) => {
    if (!isMiniActive()) return;
    keys[e.key] = true;
    // evitar scroll com setas quando modal/mini ativo
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();

    // virar snake
    if (state.mode === 'snake'){
      if (e.key === 'ArrowLeft'  && state.dir.x !==  1) state.nextDir = {x:-1,y: 0};
      if (e.key === 'ArrowRight' && state.dir.x !== -1) state.nextDir = {x: 1,y: 0};
      if (e.key === 'ArrowUp'    && state.dir.y !==  1) state.nextDir = {x: 0,y:-1};
      if (e.key === 'ArrowDown'  && state.dir.y !== -1) state.nextDir = {x: 0,y: 1};
    }
  }, { passive:false });
  window.addEventListener('keyup', (e) => { if (isMiniActive()) keys[e.key] = false; });

  btnStart?.addEventListener('click', () => {
    start();
    // muda automaticamente para a aba "Mini-game"
    const tabMini = modal?.querySelector('.tab[data-tab="mini"]');
    tabMini && tabMini.click();
  });
})();

/* Indicadores */
(() => {
  const els = [...document.querySelectorAll('#impacto [data-target]')];
  if (!els.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCount(el){
    const target = Number(el.getAttribute('data-target') || 0);
    const dur = Number(el.getAttribute('data-duration') || 1200); // ms
    let start = null;

    function step(ts){
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const val = Math.round(target * easeOut(p));
      el.textContent = val.toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  els.forEach(el => io.observe(el));
})();



/* =========================================================
   Formulário de Contato
========================================================= */
(() => {
  const form = document.querySelector('form[action*="processar_contato"]');
  if (!form) return;

  const nome = form.querySelector('#nome');
  const email = form.querySelector('#email');
  const assunto = form.querySelector('#assunto');
  const mensagem = form.querySelector('#mensagem');
  const btnEnviar = form.querySelector('button[type="submit"]');
  const MSG_MIN = 10;

  // Toast flutuante
  function showToast(msg, tipo = 'success') {
    let toast = document.querySelector('.toast-popup');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-popup';
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.dataset.type = tipo;
    toast.classList.add('show');

    // some após 3s
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function valida() {
    let ok = true;
    if ((nome.value || '').trim().length < 2) ok = false;
    if ((email.value || '').trim().length < 5 || !email.value.includes('@')) ok = false;
    if ((assunto.value || '').trim().length < 3) ok = false;
    if ((mensagem.value || '').trim().length < MSG_MIN) ok = false;
    return ok;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!valida()) {
      showToast('⚠️ Verifique os campos obrigatórios.', 'error');
      return;
    }

    // anima botão
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';

    try {
      await new Promise(r => setTimeout(r, 1000));
      form.reset();
      showToast('✅ Mensagem enviada com sucesso!');
    } catch (err) {
      showToast('❌ Falha ao enviar. Tente novamente.', 'error');
      console.warn(err);
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = 'Enviar mensagem';
    }
  });
})();
