// Cursor — smooth RAF tracking
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');
let mx = -100, my = -100, tx = -100, ty = -100;
const LERP = 0.13;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
function rafLoop() {
  cursor.style.transform = `translate(${mx - cursor.offsetWidth/2}px, ${my - cursor.offsetHeight/2}px)`;
  tx += (mx - tx) * LERP;
  ty += (my - ty) * LERP;
  trail.style.transform = `translate(${tx - trail.offsetWidth/2}px, ${ty - trail.offsetHeight/2}px)`;
  requestAnimationFrame(rafLoop);
}
rafLoop();
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); trail.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); trail.classList.remove('hover'); });
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => obs.observe(el));

// Animate stat numbers
function animateNum(el, target, suffix='') {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const statNums = document.querySelectorAll('.stat-num');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = [['150','+'], ['340','%'], ['12',''], ['3','X']];
      statNums.forEach((el, i) => animateNum(el, parseInt(nums[i][0]), nums[i][1]));
      statObs.disconnect();
    }
  });
}, { threshold: 0.5 });
if (statNums[0]) statObs.observe(statNums[0]);

// Tools carousel
const toolsTrack = document.getElementById('toolsTrack');
const toolsCards = toolsTrack ? Array.from(toolsTrack.querySelectorAll('.tool-card')) : [];
const toolsPrev = document.getElementById('toolsPrev');
const toolsNext = document.getElementById('toolsNext');
let activeToolIndex = 0;
let toolIsAnimating = false;

function updateToolStates(direction = '') {
  if (!toolsCards.length) return;

  toolsCards.forEach((card, index) => {
    card.classList.remove('is-active', 'is-prev', 'is-next', 'is-hidden-left', 'is-hidden-right');

    if (index === activeToolIndex) {
      card.classList.add('is-active');
      return;
    }

    const prevIndex = (activeToolIndex - 1 + toolsCards.length) % toolsCards.length;
    const nextIndex = (activeToolIndex + 1) % toolsCards.length;

    if (index === prevIndex) {
      card.classList.add('is-prev');
    } else if (index === nextIndex) {
      card.classList.add('is-next');
    } else if ((index + toolsCards.length - activeToolIndex) % toolsCards.length < toolsCards.length / 2) {
      card.classList.add('is-hidden-right');
    } else {
      card.classList.add('is-hidden-left');
    }
  });

  if (!toolsTrack) return;

  toolsTrack.classList.remove('is-animating-next', 'is-animating-prev');
  if (direction) {
    toolsTrack.classList.add(direction === 'next' ? 'is-animating-next' : 'is-animating-prev');
    window.setTimeout(() => {
      toolsTrack.classList.remove('is-animating-next', 'is-animating-prev');
    }, 900);
  }
}

function moveTools(direction) {
  if (!toolsCards.length || toolIsAnimating) return;

  toolIsAnimating = true;
  activeToolIndex = direction === 'next'
    ? (activeToolIndex + 1) % toolsCards.length
    : (activeToolIndex - 1 + toolsCards.length) % toolsCards.length;

  updateToolStates(direction);

  window.setTimeout(() => {
    toolIsAnimating = false;
  }, 900);
}

if (toolsCards.length) {
  updateToolStates();
  toolsPrev?.addEventListener('click', () => moveTools('prev'));
  toolsNext?.addEventListener('click', () => moveTools('next'));
}
