// ── Image list ────────────────────────────────
const IMAGES = [
  'achha.webp','anya-forger.gif','baby-laugh-ai-baby.gif',
  'bamboozled-astonished.gif','betrayal-phone.gif','blinking-eyes-white-guy.gif',
  'blush.gif','bobawooyo-dog-confused.gif','bund-mraa.png',
  'cast-net-fishing-fall.gif','cat-huh-cat-huh-etr.gif','cat-no.gif',
  'corgi-smirk.gif','crying-happy.gif','disappointed-fridge-guy.gif',
  'dog-smirk-dark-side.gif','dont-smile-dont-laugh.gif','druski.gif',
  'druski-got-me.gif','druski-shrug.gif','druski-shrug-1.gif',
  'druski-shrug-hands-up-druski-shrug.gif','fade-away-peace-out.gif',
  'far-cry6-laugh.gif','firat-roblox.gif','fly-insect.gif',
  'ford-and-ferrari-hats-off.gif','freaky-sonic-sistertonin.gif',
  'freaky-sonic-sonic-the-hedgehog.gif','ghee-khatam.gif','go-do-it.gif',
  'gonna-touch-you-son.gif','goth-baddie-please.gif','hamster-cute.gif',
  'happy-cat.gif','heh-huh.gif','help.gif','high-five-walter-white.gif',
  'hooray-letsgo.gif','huh-cat.gif','i-got-you.gif','i-know-but-i-cant-proof.gif',
  'it-shouldve-been-me-not-him.gif','its-me.gif','its-time-to-stop.gif',
  'i-use-ai.gif','james-doakes-dexter-dexter.gif','james-harden-bye.gif',
  'jumping-hopping.gif','kanye-laugh.gif','kanye-waste.gif',
  'ketartine-ragondin.gif','kmt-yeah.gif',
  'laughing-then-serious-laughing-then-stoned.gif','lil-dihh.gif',
  'made-it-to-friday.gif','mario-goth.gif','middle-finger-f-u.gif',
  'money.gif','mr-least.webp','noot-noot-dark.gif','nope.gif',
  'nubcat-iwanttocatyou.gif','nubcat-iwanttocatyou-1.gif',
  'nub-cat-nub.gif','nub-cat-nub-1.gif','nub-cat-nub-2.gif',
  'nub-nub-cat.gif','nub-nub-cat-1.gif','nub-nub-cat-11.gif',
  'nub-nub-cat-12.gif','nub-nub-cat-13.gif','nub-nub-cat-14.gif',
  'nub-nub-cat-15.gif','nub-nub-cat-16.gif','nub-nub-cat-17.gif',
  'nub-nub-cat-18.gif','nub-nub-cat-19.gif','nub-nub-cat-2.gif',
  'nub-nub-cat-4.gif','nub-nub-cat-6.gif','nub-nub-cat-7.gif',
  'nub-nub-cat-8.gif','nub-nub-cat-9.gif','oh-yeah.gif','oh-yeah-sameer.gif',
  'peace-out.gif','peace-out-im-out.gif','peace-out-peace-sign.gif',
  'pedro-pascal.gif','pedro-pascal-1.gif','pentol-stiker-pentol.gif',
  'QR0qVENyy1gDS.webp','rolando-ronaldo.gif','sarcastic-clap.gif',
  'shannon-sharpe-suit-meme.gif','shaq-shimmy.gif','shocked-ishowspeed.gif',
  'shocked-surprised.gif','shocked-surprised-1.gif',
  'shock-wtf-joe-coin-emotiguy-stare-serious-disgust-dark.gif',
  'silly-nub-cat-mommy.gif','sillynubcat-nubcat.gif','small-dihh.gif',
  'sonic-zesty.gif','squinting-skeptical.gif','stan-twt-evil-chihuahua.gif',
  'stan-twt-evil-chihuahua-1.gif','stop-it-stop.gif','strange-statement.gif',
  'suenitosgifs-nollywood-roll.gif','suenitosgifs-traumatized-mr-incredible.gif',
  'sure.gif','sure-oh-ok.gif','suspicious-eyes.gif','sussy-cant-prove-it.gif',
  'taking-notes.gif','thumbs-up-hamster-cute.gif','type-c.jpg',
  'up-is-not-jump-knee.gif','viagra.gif','what-you-sure.gif',
  'yellow-emoji-no-no-emotiguy.gif','youre-joddamn-right-jod.gif',
];

// ── Constants ─────────────────────────────────
const PAGE_SIZE = 10;
const ROTS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

// ── State ─────────────────────────────────────
let filtered   = [];
let page       = 0;
let allLoaded  = false;
let loading    = false;
let rotIdx     = 0;

// export state
let curFile    = null;
let selFmt     = 'png';
let selBg      = 'transparent';
let selQuality = 92;

// ── DOM refs ──────────────────────────────────
const grid       = document.getElementById('grid');
const sentinel   = document.getElementById('sentinel');
const loaderEl   = document.getElementById('loader');
const emptyEl    = document.getElementById('empty');
const emptyQ     = document.getElementById('empty-q');
const countPill  = document.getElementById('count-pill');
const ftrCount   = document.getElementById('ftr-count');
const searchEl   = document.getElementById('search');
const sClear     = document.getElementById('s-clear');

const modalBg    = document.getElementById('modal-bg');
const previewImg = document.getElementById('preview-img');
const pmTitle    = document.getElementById('pm-title');
const pmDim      = document.getElementById('pm-dim');
const gifNote    = document.getElementById('gif-note');
const qualitySec = document.getElementById('quality-sec');
const bgSec      = document.getElementById('bg-sec');
const qualitySlider = document.getElementById('quality-slider');
const qualityVal    = document.getElementById('quality-val');
const sizeEst    = document.getElementById('size-est');
const copyBtn    = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');

// ── Boot ──────────────────────────────────────
reset('');

// ── Infinite scroll ───────────────────────────
const scrollObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) loadBatch();
}, { rootMargin: '400px' });

scrollObs.observe(sentinel);

// ── Search ────────────────────────────────────
let searchTimer;
searchEl.addEventListener('input', e => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  sClear.classList.toggle('hidden', q === '');
  searchTimer = setTimeout(() => reset(q), 280);
});

sClear.addEventListener('click', () => {
  searchEl.value = '';
  sClear.classList.add('hidden');
  searchEl.focus();
  reset('');
});

// ── Tweaks (columns) ──────────────────────────
const colsSlider = document.getElementById('cols-slider');
const colsVal    = document.getElementById('cols-val');

colsSlider.addEventListener('input', () => {
  const v = colsSlider.value;
  colsVal.textContent = v;
  document.documentElement.style.setProperty('--cols', v);
  grid.style.gridTemplateColumns = `repeat(${v}, 1fr)`;
});

// ── Core: reset ───────────────────────────────
function reset(query) {
  const q = query.toLowerCase();
  filtered = q
    ? IMAGES.filter(n => n.toLowerCase().includes(q))
    : IMAGES.slice();

  page      = 0;
  allLoaded = false;
  loading   = false;
  rotIdx    = 0;

  grid.innerHTML = '';
  emptyEl.classList.add('hidden');

  const label = filtered.length + ' meme' + (filtered.length !== 1 ? 's' : '');
  countPill.textContent = label;
  ftrCount.textContent  = label;

  loadBatch();
}

function loadBatch() {
  if (loading || allLoaded) return;
  loading = true;
  loaderEl.classList.remove('hidden');

  const start = page * PAGE_SIZE;
  const batch = filtered.slice(start, start + PAGE_SIZE);

  if (batch.length === 0) {
    allLoaded = true;
    loaderEl.classList.add('hidden');
    loading = false;
    if (filtered.length === 0) {
      emptyEl.classList.remove('hidden');
      emptyQ.textContent = searchEl.value.trim();
    }
    return;
  }

  page++;

  requestAnimationFrame(() => {
    const frag = document.createDocumentFragment();
    batch.forEach(name => frag.appendChild(createTile(name)));
    grid.appendChild(frag);

    if (start + batch.length >= filtered.length) allLoaded = true;
    loaderEl.classList.add('hidden');
    loading = false;

    // fill viewport if sentinel still visible
    if (!allLoaded) {
      const r = sentinel.getBoundingClientRect();
      if (r.top < window.innerHeight + 500) loadBatch();
    }
  });
}

// ── Tile ──────────────────────────────────────
function createTile(name) {
  const title = makeTitle(name);
  const ext   = getExt(name);
  const rot   = ROTS[rotIdx++ % ROTS.length];

  const tile = document.createElement('button');
  tile.className = 'tile';
  tile.style.setProperty('--rot', rot + 'deg');
  tile.title = title;

  // media wrapper
  const media = document.createElement('div');
  media.className = 'tile-media';

  const img = document.createElement('img');
  img.alt      = title;
  img.loading  = 'lazy';
  img.decoding = 'async';
  img.addEventListener('load',  () => { img.classList.add('loaded'); media.classList.add('loaded'); });
  img.addEventListener('error', () => { img.classList.add('loaded'); media.classList.add('loaded'); });
  img.src = name;

  const tag = document.createElement('span');
  tag.className = 'tile-tag ' + ext;
  tag.textContent = ext;

  media.appendChild(img);
  media.appendChild(tag);

  // name footer
  const nameEl = document.createElement('div');
  nameEl.className = 'tile-name';
  nameEl.textContent = title;

  tile.appendChild(media);
  tile.appendChild(nameEl);

  tile.addEventListener('click', () => openModal(name));

  return tile;
}

// ── Extra DOM refs ────────────────────────────
const sizeSec    = document.getElementById('size-sec');
const expWInput  = document.getElementById('exp-w');
const expHInput  = document.getElementById('exp-h');
const lockBtn    = document.getElementById('lock-btn');
const gifFmtBtn  = document.getElementById('gif-fmt-btn');
const gifFmtSub  = document.getElementById('gif-fmt-sub');

// ── Modal state ───────────────────────────────
let natW = 0, natH = 0;
let selW = 0, selH = 0;
let lockRatio = true;
let selPreset = 'original';

// ── Modal open/close ──────────────────────────
function openModal(name) {
  curFile    = name;
  selFmt     = 'png';
  selBg      = 'transparent';
  selQuality = 92;
  selPreset  = 'original';
  lockRatio  = true;
  natW = natH = selW = selH = 0;

  const isGif = name.toLowerCase().endsWith('.gif');

  // format buttons
  document.querySelectorAll('.fmt-btn').forEach(b => b.classList.toggle('on', b.dataset.fmt === 'png'));
  gifFmtBtn.disabled = !isGif;
  gifFmtSub.textContent = isGif ? 'original · anim' : 'n/a';

  // size + quality + bg reset
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.preset === 'original'));
  document.querySelectorAll('.swatch').forEach(s => s.classList.toggle('on', s.dataset.bg === 'transparent'));
  lockBtn.classList.add('on');
  qualitySlider.value = 92;
  qualityVal.textContent = '92';
  sizeEst.textContent = '—';
  expWInput.value = '—';
  expHInput.value = '—';

  pmTitle.textContent = makeTitle(name);
  pmDim.textContent   = '— × — px';
  previewImg.src = name;

  updateModalSections();

  modalBg.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // async: get natural dimensions
  loadImg(name).then(img => {
    natW = img.naturalWidth;
    natH = img.naturalHeight;
    selW = natW;
    selH = natH;
    expWInput.value = selW;
    expHInput.value = selH;
    const ext = getExt(name).toUpperCase();
    pmDim.textContent = natW + ' × ' + natH + ' px · ' + ext + (isGif ? ' · animated' : '');
    updateSizeEst();
  }).catch(() => {});
}

function closeModal() {
  modalBg.classList.add('hidden');
  document.body.style.overflow = '';
  setTimeout(() => { previewImg.src = ''; curFile = null; }, 250);
}

document.getElementById('modal-close').addEventListener('click', closeModal);
modalBg.addEventListener('click', e => { if (e.target === modalBg) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Format buttons ────────────────────────────
document.querySelectorAll('.fmt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    selFmt = btn.dataset.fmt;
    updateModalSections();
    updateSizeEst();
  });
});

function updateModalSections() {
  const isGifFmt  = selFmt === 'gif';
  const needsQual = selFmt === 'jpg' || selFmt === 'webp';
  const needsBg   = selFmt === 'png' || selFmt === 'webp';
  const isAnimGif = curFile && curFile.toLowerCase().endsWith('.gif');

  sizeSec.style.display    = isGifFmt ? 'none' : '';
  qualitySec.style.display = needsQual ? '' : 'none';
  bgSec.style.display      = needsBg  ? '' : 'none';
  gifNote.classList.toggle('hidden', !isAnimGif || isGifFmt);
}

// ── Size presets ──────────────────────────────
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    applyPreset(chip.dataset.preset);
  });
});

function applyPreset(p) {
  selPreset = p;
  const aspect = natW && natH ? natW / natH : 1;
  if      (p === 'original') { selW = natW;  selH = natH; }
  else if (p === 'sm')       { selW = 240;   selH = Math.round(240 / aspect); }
  else if (p === 'md')       { selW = 480;   selH = Math.round(480 / aspect); }
  else if (p === 'lg')       { selW = 800;   selH = Math.round(800 / aspect); }
  else if (p === 'sq')       { selW = 512;   selH = 512; }

  expWInput.value = selW;
  expHInput.value = selH;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.preset === p));
  updateSizeEst();
}

// ── W / H inputs ──────────────────────────────
expWInput.addEventListener('change', () => {
  const v = Math.max(1, parseInt(expWInput.value) || 1);
  selW = v;
  if (lockRatio && natW && natH) { selH = Math.round(v / (natW / natH)); expHInput.value = selH; }
  selPreset = 'custom';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  updateSizeEst();
});

expHInput.addEventListener('change', () => {
  const v = Math.max(1, parseInt(expHInput.value) || 1);
  selH = v;
  if (lockRatio && natW && natH) { selW = Math.round(v * (natW / natH)); expWInput.value = selW; }
  selPreset = 'custom';
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  updateSizeEst();
});

// ── Aspect lock ───────────────────────────────
lockBtn.addEventListener('click', () => {
  lockRatio = !lockRatio;
  lockBtn.classList.toggle('on', lockRatio);
  lockBtn.textContent = lockRatio ? '🔒' : '🔓';
});

// ── Quality slider ────────────────────────────
qualitySlider.addEventListener('input', () => {
  selQuality = +qualitySlider.value;
  qualityVal.textContent = selQuality;
  updateSizeEst();
});

// ── Background swatches ───────────────────────
document.querySelectorAll('.swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
    sw.classList.add('on');
    selBg = sw.dataset.bg;
  });
});

// ── Live size estimate ────────────────────────
function updateSizeEst() {
  if (!selW || !selH || selFmt === 'gif') { sizeEst.textContent = selFmt === 'gif' ? 'original' : '—'; return; }
  const px = selW * selH;
  const q  = selQuality / 100;
  let kb;
  if      (selFmt === 'jpg')  kb = Math.round(px * q * 0.18 / 1024);
  else if (selFmt === 'webp') kb = Math.round(px * q * 0.12 / 1024);
  else if (selFmt === 'png')  kb = Math.round(px * 0.7 / 1024);
  else { sizeEst.textContent = '—'; return; }
  sizeEst.textContent = kb < 1024 ? kb + ' KB' : (kb / 1024).toFixed(1) + ' MB';
}

// ── Copy to clipboard ─────────────────────────
copyBtn.addEventListener('click', async () => {
  if (!curFile || selFmt === 'gif') return;
  const orig = copyBtn.textContent;
  copyBtn.disabled = true;

  try {
    const canvas = await renderCanvas();
    await new Promise((res, rej) => {
      canvas.toBlob(async blob => {
        try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); res(); }
        catch (e) { rej(e); }
      }, 'image/png');
    });
    copyBtn.textContent = '✓ copied!';
  } catch {
    try { await navigator.clipboard.writeText(curFile); copyBtn.textContent = '✓ name!'; }
    catch { copyBtn.textContent = '✗ failed'; }
  }

  copyBtn.disabled = false;
  setTimeout(() => { copyBtn.textContent = orig; }, 2200);
});

// ── Download ──────────────────────────────────
downloadBtn.addEventListener('click', async () => {
  if (!curFile) return;
  const orig = downloadBtn.textContent;
  downloadBtn.disabled = true;
  downloadBtn.textContent = 'rendering…';

  try {
    if (selFmt === 'gif') {
      // download original file as-is
      triggerDownload(curFile, curFile);
      downloadBtn.textContent = 'downloaded ✓';
    } else {
      const canvas = await renderCanvas();
      const mime = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }[selFmt];
      const ext  = selFmt;
      const q    = (selFmt === 'jpg' || selFmt === 'webp') ? selQuality / 100 : undefined;

      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        triggerDownload(url, curFile.replace(/\.[^.]+$/, '') + '.' + ext);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
        // show actual blob size
        const kb = Math.round(blob.size / 1024);
        sizeEst.textContent = kb < 1024 ? kb + ' KB' : (kb / 1024).toFixed(1) + ' MB';
        downloadBtn.textContent = 'downloaded ✓';
        setTimeout(() => { downloadBtn.textContent = orig; downloadBtn.disabled = false; }, 1800);
      }, mime, q);
      return; // early return, disabled=false handled in toBlob callback
    }
  } catch {
    downloadBtn.textContent = '✗ error';
  }

  setTimeout(() => { downloadBtn.textContent = orig; downloadBtn.disabled = false; }, 1800);
});

// ── Canvas render helper ──────────────────────
async function renderCanvas() {
  const img = await loadImg(curFile);
  const w = selW || img.naturalWidth;
  const h = selH || img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // fill background
  let fill = null;
  if (selFmt === 'jpg') {
    fill = selBg === 'transparent' ? '#ffffff' : selBg;
  } else if (selBg !== 'transparent') {
    fill = selBg;
  }
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, w, h); }

  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

// ── Helpers ───────────────────────────────────
function makeTitle(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getExt(name) {
  return (name.match(/\.([^.]+)$/) || ['', ''])[1].toLowerCase();
}

function triggerDownload(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
