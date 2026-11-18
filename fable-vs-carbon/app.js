// 1. RIVERHAND Embedded Stage Launcher
const gameStageWrap = document.getElementById('game-stage-wrap');
const gamePlaceholder = document.getElementById('game-placeholder');
const gameOpenExternal = document.getElementById('game-open-external');
const gameFullscreenBtn = document.getElementById('game-fullscreen-btn');
const gameTabs = [...document.querySelectorAll('[data-game-tab]')];
const gameLaunchBtns = [...document.querySelectorAll('[data-launch-game]')];

const GAME_URLS = {
  fable: './games/fable/',
  carbon: './games/carbon/',
  astra: './games/astra/',
};

const GAME_LABELS = {
  fable: 'Claude Fable 5.2 (xhigh)',
  carbon: 'Gemini 4 Carbon (high)',
  astra: 'GPT-6.2 Astra (xhigh)',
};

let activeGame = 'fable';
let gameIframe = null;

function selectGame(model, autoLoad = false) {
  if (!GAME_URLS[model]) return;
  activeGame = model;
  gameTabs.forEach((btn) => btn.classList.toggle('active', btn.dataset.gameTab === model));
  if (gameOpenExternal) {
    gameOpenExternal.href = GAME_URLS[model];
    gameOpenExternal.textContent = `${GAME_LABELS[model]} 새 탭 열기 ↗`;
  }
  if (autoLoad) {
    mountGameIframe(model);
  }
}

function mountGameIframe(model) {
  if (!gameStageWrap) return;
  if (gamePlaceholder) {
    gamePlaceholder.style.display = 'none';
  }
  if (!gameIframe) {
    gameIframe = document.createElement('iframe');
    gameIframe.title = 'RIVERHAND 3D Web Game';
    gameIframe.allow = 'fullscreen; autoplay';
    gameStageWrap.appendChild(gameIframe);
  }
  gameIframe.src = GAME_URLS[model];
}

gameTabs.forEach((btn) => {
  btn.addEventListener('click', () => selectGame(btn.dataset.gameTab, true));
});

gameLaunchBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const model = btn.dataset.launchGame;
    selectGame(model, true);
    document.getElementById('game-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

document.getElementById('game-placeholder-launch')?.addEventListener('click', () => {
  mountGameIframe(activeGame);
});

gameFullscreenBtn?.addEventListener('click', () => {
  if (!gameIframe) mountGameIframe(activeGame);
  if (gameStageWrap?.requestFullscreen) {
    gameStageWrap.requestFullscreen().catch(() => {});
  }
});

// 2. 3-Way Synchronized Blender Video Player
const videoStage = document.getElementById('video-stage');
const videoCols = [...document.querySelectorAll('.video-col')];
const videos = videoCols.map((c) => c.querySelector('video'));
const playBtn = document.getElementById('v-play');
const restartBtn = document.getElementById('v-restart');
const soloBtn = document.getElementById('v-solo');
const sndBtns = [...document.querySelectorAll('[data-snd]')];

function setSound(key) {
  videoCols.forEach((col, i) => {
    const on = col.dataset.k === key;
    col.classList.toggle('on', on);
    if (videos[i]) videos[i].muted = !on;
  });
  sndBtns.forEach((b) => b.classList.toggle('sel', b.dataset.snd === key));
}

function toggleVideos() {
  if (!videos[0]) return;
  if (videos[0].paused) {
    const t = videos[0].currentTime;
    videos.forEach((v) => {
      v.currentTime = t;
      v.play().catch(() => {});
    });
    if (playBtn) playBtn.textContent = '❚❚ 멈춤';
  } else {
    videos.forEach((v) => v.pause());
    if (playBtn) playBtn.textContent = '▶ 동시에 재생';
  }
}

function restartVideos() {
  videos.forEach((v) => {
    v.currentTime = 0;
    v.play().catch(() => {});
  });
  if (playBtn) playBtn.textContent = '❚❚ 멈춤';
}

playBtn?.addEventListener('click', toggleVideos);
restartBtn?.addEventListener('click', restartVideos);
soloBtn?.addEventListener('click', () => {
  videoStage?.classList.toggle('solo');
  soloBtn.classList.toggle('sel', videoStage?.classList.contains('solo'));
});
sndBtns.forEach((b) => b.addEventListener('click', () => setSound(b.dataset.snd)));
videoCols.forEach((col) => {
  col.querySelector('video')?.addEventListener('click', () => setSound(col.dataset.k));
});

setInterval(() => {
  if (!videos[0] || videos[0].paused) return;
  videos.slice(1).forEach((v) => {
    if (Math.abs(v.currentTime - videos[0].currentTime) > 0.12) {
      v.currentTime = videos[0].currentTime;
    }
  });
}, 2000);

// Keyboard shortcuts only when Round 2 player is visible and focus is not inside game iframe/inputs
addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName;
  if (tag === 'IFRAME' || tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (!videoStage) return;
  const rect = videoStage.getBoundingClientRect();
  const inView = rect.top < window.innerHeight && rect.bottom > 0;
  if (!inView) return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleVideos();
  } else if (e.key === '1') {
    setSound('fable');
  } else if (e.key === '2') {
    setSound('carbon');
  } else if (e.key === '3') {
    setSound('astra');
  } else if (e.key === 's' || e.key === 'S') {
    videoStage.classList.toggle('solo');
    soloBtn?.classList.toggle('sel', videoStage.classList.contains('solo'));
  } else if (e.key === 'r' || e.key === 'R') {
    restartVideos();
  }
});

// 3. Round 3 Tweet Model Tabs
const tweetTabs = [...document.querySelectorAll('[data-tweet-tab]')];
const tweetPanels = [...document.querySelectorAll('[data-tweet-panel]')];

tweetTabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    const k = btn.dataset.tweetTab;
    tweetTabs.forEach((b) => b.classList.toggle('active', b.dataset.tweetTab === k));
    tweetPanels.forEach((p) => p.classList.toggle('active', p.dataset.tweetPanel === k));
  });
});

// 4. Copy Buttons (Prompts)
document.querySelectorAll('[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.copyTarget;
    const el = document.getElementById(id);
    if (!el) return;
    try {
      await navigator.clipboard.writeText(el.textContent);
      const orig = btn.textContent;
      btn.textContent = '복사 완료 ✓';
      setTimeout(() => { btn.textContent = orig; }, 1600);
    } catch {
      btn.textContent = '복사 실패';
    }
  });
});
