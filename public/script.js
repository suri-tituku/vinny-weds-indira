'use strict';

const welcome = document.getElementById('welcome');
const invitation = document.getElementById('invitation');
const envelope = document.getElementById('openEnvelope');
const openButton = document.getElementById('openButton');
const shareButton = document.getElementById('shareButton');
const shareStatus = document.getElementById('shareStatus');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened = false;

// One-time slow-motion celebration from the wax seal. It complements the
// always-falling petals/hearts, and never blocks pointer/touch interactions.
function releaseWeddingBurst() {
  if (reduceMotion || document.documentElement.dataset.motion === 'off') return;
  const stage = document.getElementById('envelopeStage');
  if (!stage || stage.querySelector('.wedding-burst')) return;

  const layer = document.createElement('div');
  layer.className = 'wedding-burst';
  layer.setAttribute('aria-hidden', 'true');
  const small = window.matchMedia('(max-width: 600px)').matches;
  const count = small ? 28 : 46;
  const maxRadius = small ? 170 : 260;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    // Golden-angle placement gives a natural circular cloud with no straight rows.
    const angle = i * 2.399963229728653 + 0.24;
    const spread = 0.42 + ((i * 19) % 13) / 20;
    const radius = maxRadius * spread;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius * 0.76;
    const drift = Math.sin(angle * 3.17) * (small ? 28 : 44);
    const piece = document.createElement('span');
    const isHeart = i % 3 === 0;
    piece.className = 'burst-piece ' + (isHeart ? 'burst-heart' : i % 4 === 0 ? 'burst-pink-petal' : 'burst-ivory-petal');
    if (isHeart) piece.textContent = '♥';
    piece.style.setProperty('--middle-x', `${Math.round(dx * 0.88)}px`);
    piece.style.setProperty('--middle-y', `${Math.round(dy * 0.82)}px`);
    piece.style.setProperty('--finish-x', `${Math.round(dx * 1.18 + drift)}px`);
    piece.style.setProperty('--finish-y', `${Math.round(dy * 0.85 + (small ? 156 : 204))}px`);
    piece.style.setProperty('--middle-rotation', `${Math.round(i * 41)}deg`);
    piece.style.setProperty('--finish-rotation', `${Math.round(i * 41 + 170)}deg`);
    piece.style.setProperty('--burst-delay', `${(i % 8) * 48}ms`);
    piece.style.setProperty('--burst-duration', `${3900 + (i % 6) * 260}ms`);
    piece.style.setProperty('--piece-scale', `${(0.77 + (i % 4) * 0.15).toFixed(2)}`);
    fragment.appendChild(piece);
  }
  layer.appendChild(fragment);
  stage.appendChild(layer);
  window.setTimeout(() => layer.remove(), 6100);
}

function openInvitation({ jump = true } = {}) {
  if (opened) return;
  opened = true;
  if (jump) releaseWeddingBurst();
  welcome.classList.add('is-open');
  document.body.classList.add('opened');
  invitation.setAttribute('aria-hidden', 'false');
  envelope.setAttribute('aria-label', 'Invitation opened');
  envelope.disabled = true;
  openButton.disabled = true;

  // Give the flap time to open, then lift the entire paper card in front of
  // the envelope pocket. This prevents the bottom half remaining hidden.
  window.setTimeout(() => envelope.classList.add('letter-revealed'), reduceMotion ? 0 : 780);

  // Let the 3D paper travel out of the envelope before revealing the card.
  if (jump) {
    window.setTimeout(() => {
      invitation.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
    }, reduceMotion ? 30 : 3450);
  }
}

envelope.addEventListener('click', () => openInvitation());
openButton.addEventListener('click', () => openInvitation());

// Useful for screenshots/testing, or linking straight to the invitation.
const params = new URLSearchParams(window.location.search);
if (params.has('preview') || params.has('open') || window.location.hash === '#invitation') {
  openInvitation({ jump: false });
}

// Timezone-safe moment: November 5, 2026, 10:30 AM India Standard Time.
const weddingTime = new Date('2026-11-05T10:30:00+05:30').getTime();
const countEls = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};
function updateCountdown() {
  let seconds = Math.floor((weddingTime - Date.now()) / 1000);
  if (seconds <= 0) {
    document.getElementById('countdown').hidden = true;
    document.getElementById('countdownAfter').hidden = false;
    return false;
  }
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  countEls.days.textContent = String(days).padStart(2, '0');
  countEls.hours.textContent = String(hours).padStart(2, '0');
  countEls.minutes.textContent = String(minutes).padStart(2, '0');
  countEls.seconds.textContent = String(seconds).padStart(2, '0');
  return true;
}
if (updateCountdown()) {
  const countdownTimer = window.setInterval(() => {
    if (!updateCountdown()) window.clearInterval(countdownTimer);
  }, 1000);
}

// Petals and delicate rose-colored hearts float together across the page.
// Keep the mix deliberately sparse on mobile so the invitation stays readable.
// The elements are decorative only and never intercept taps or clicks.
if (!reduceMotion) {
  const petalLayer = document.getElementById('petals');
  const smallScreen = window.matchMedia('(max-width: 600px)').matches;
  const petalCount = smallScreen ? 7 : 13;
  const heartCount = smallScreen ? 4 : 8;

  for (let i = 0; i < petalCount; i += 1) {
    const petal = document.createElement('span');
    petal.className = i % 3 === 1 ? 'petal rose-petal' : 'petal';
    petal.style.left = `${(i * 37 + 11) % 100}%`;
    petal.style.setProperty('--fall-time', `${15 + (i % 6) * 2.3}s`);
    petal.style.setProperty('--fall-delay', `${-(i * 2.95 + 2)}s`);
    petal.style.setProperty('--drift', `${(i % 2 ? -1 : 1) * (24 + (i % 5) * 12)}px`);
    petal.style.scale = `${0.6 + (i % 5) * 0.13}`;
    petalLayer.appendChild(petal);
  }

  for (let i = 0; i < heartCount; i += 1) {
    const heart = document.createElement('span');
    heart.className = 'heart-petal';
    heart.textContent = '♥';
    heart.style.left = `${(i * 43 + 23) % 94 + 3}%`;
    heart.style.setProperty('--fall-time', `${19 + (i % 4) * 3.5}s`);
    heart.style.setProperty('--fall-delay', `${-(i * 4.3 + 4)}s`);
    heart.style.setProperty('--drift', `${(i % 2 ? 1 : -1) * (22 + (i % 4) * 13)}px`);
    heart.style.setProperty('--heart-size', `${15 + (i % 4) * 2}px`);
    heart.style.setProperty('--heart-opacity', `${0.40 + (i % 3) * 0.055}`);
    heart.style.setProperty('--heart-color', i % 2 ? '#bc7082' : '#a94a64');
    petalLayer.appendChild(heart);
  }
}

// Animate content only when visible; content remains visible without support.
const panels = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries, observerInstance) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observerInstance.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  panels.forEach(panel => observer.observe(panel));
} else {
  panels.forEach(panel => panel.classList.add('in-view'));
}

const sharingText = '💍 With love and God’s grace, you are invited to the Holy Wedding of Vinay & Indira!\n📅 Thursday, 5 November 2026 at 10:30 AM\n⛪ CSI Christ Church, Bhadrachalam\n🍽️ Lunch from 12:00 PM at Akshaya Function Hall, Charla Road, Bhadrachalam.\n\n';
shareButton.addEventListener('click', async () => {
  const cleanUrl = window.location.href.split(/[?#]/)[0];
  const isLocal = /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/i.test(window.location.hostname);
  const publicUrl = !isLocal ? cleanUrl : '';
  const fullText = sharingText + (publicUrl ? `See our invitation: ${publicUrl}` : 'We would love to celebrate with you!');

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Vinay & Indira | Holy Wedding Invitation', text: fullText, ...(publicUrl ? { url: publicUrl } : {}) });
      shareStatus.textContent = '';
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  // On a local server, share the wedding details rather than a localhost link.
  try {
    await navigator.clipboard.writeText(fullText);
    shareStatus.textContent = publicUrl ? 'Invitation message and link copied!' : 'Wedding details copied! Publish the site to share its link.';
  } catch (_) {
    const link = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
    shareStatus.textContent = 'WhatsApp sharing opened.';
  }
});
