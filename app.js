// ─── Hero Slider ─────────────────────────────────────────────────────────────

const SLIDES = document.querySelectorAll('.hero-title.slide');
const currentEl   = document.getElementById('slide-current');
const totalEl     = document.getElementById('slide-total');
const pauseBtn    = document.getElementById('slider-pause');
const prevBtn     = document.getElementById('slider-prev');
const nextBtn     = document.getElementById('slider-next');
const progressFill = document.getElementById('slider-progress-fill');

const TOTAL    = SLIDES.length;
const INTERVAL = 8000; // ms — 8초마다 자동 전환

let current = 0;
let paused  = false;
let timer   = null;

if (totalEl) totalEl.textContent = TOTAL;

// ─── 프로그레스 바 ───────────────────────────────────────────────────────────

function startProgress() {
  if (!progressFill) return;
  // 즉시 0으로 리셋 (transition 없이)
  progressFill.style.transition = 'none';
  progressFill.style.width = '0%';
  // 리플로우 강제 (다음 프레임에 트랜지션 적용)
  progressFill.getBoundingClientRect();
  // INTERVAL 동안 100%로 선형 채움
  progressFill.style.transition = `width ${INTERVAL}ms linear`;
  progressFill.style.width = '100%';
}

function pauseProgress() {
  if (!progressFill) return;
  // 현재 위치에서 정지
  const computed = getComputedStyle(progressFill).width;
  const parent   = progressFill.parentElement;
  const pct = parent ? (parseFloat(computed) / parent.offsetWidth) * 100 : 0;
  progressFill.style.transition = 'none';
  progressFill.style.width = pct + '%';
}

function resumeProgress() {
  if (!progressFill || paused) return;
  // 현재 위치에서 남은 시간 계산
  const parent = progressFill.parentElement;
  if (!parent) return;
  const current_pct = parseFloat(progressFill.style.width) || 0;
  const remaining_pct = 100 - current_pct;
  const remaining_ms  = (remaining_pct / 100) * INTERVAL;
  progressFill.style.transition = `width ${remaining_ms}ms linear`;
  progressFill.style.width = '100%';
}

// ─── 슬라이드별 아이콘 색상 ───────────────────────────────────────────────────
const SLIDE_COLORS = ['#215B66', '#002EAE', '#D45032', '#192C3B'];

function updateIconColor(index) {
  const color = SLIDE_COLORS[index] || SLIDE_COLORS[0];
  /* setAttribute로 직접 제어 — CSS 캐스케이드 간섭 없음 */
  document.querySelectorAll('.headline-icon path').forEach(p => {
    p.setAttribute('fill', color);
  });
}

// ─── 슬라이드 이동 ───────────────────────────────────────────────────────────

function goTo(index) {
  if (index < 0)     index = TOTAL - 1;
  if (index >= TOTAL) index = 0;

  SLIDES[current].classList.remove('active');
  current = index;
  SLIDES[current].classList.add('active');

  if (currentEl) currentEl.textContent = current + 1;

  updateIconColor(current);
  if (!paused) startProgress();
}

// ─── 자동 전환 타이머 ────────────────────────────────────────────────────────

function startTimer() {
  stopTimer();
  timer = setInterval(() => goTo(current + 1), INTERVAL);
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null; }
}

// ─── 버튼 이벤트 ─────────────────────────────────────────────────────────────

const PAUSE_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="4" height="12" rx="1" fill="currentColor"/>
  <rect x="9" y="1" width="4" height="12" rx="1" fill="currentColor"/>
</svg>`;

const PLAY_ICON = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 2L12 7L3 12V2Z" fill="currentColor"/>
</svg>`;

if (pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    if (paused) {
      stopTimer();
      pauseProgress();
      pauseBtn.innerHTML = PLAY_ICON;
      pauseBtn.setAttribute('aria-label', '재생');
    } else {
      startTimer();
      resumeProgress();
      pauseBtn.innerHTML = PAUSE_ICON;
      pauseBtn.setAttribute('aria-label', '일시정지');
    }
  });
}

if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); if (!paused) startTimer(); });
if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); if (!paused) startTimer(); });

// ─── 시작 ────────────────────────────────────────────────────────────────────

goTo(0);
startTimer();
startProgress();

