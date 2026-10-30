'use strict';

const welcome = document.getElementById('welcome');
const invitation = document.getElementById('invitation');
const envelope = document.getElementById('openEnvelope');
const openButton = document.getElementById('openButton');
const shareButton = document.getElementById('shareButton');
const shareStatus = document.getElementById('shareStatus');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened = false;

function openInvitation({ jump = true } = {}) {
  if (opened) return;
  opened = true;
  welcome.classList.add('is-open');
  document.body.classList.add('opened');
  invitation.setAttribute('aria-hidden', 'false');
  envelope.setAttribute('aria-label', 'Invitation opened');
  envelope.disabled = true;
  openButton.disabled = true;

  // Let the 3D paper travel out of the envelope before revealing the card.
  if (jump) {
    window.setTimeout(() => {
      invitation.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
    }, reduceMotion ? 30 : 1400);
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

// Subtle petals float across the screen without affecting layout or clicks.
if (!reduceMotion) {
  const petalLayer = document.getElementById('petals');
  for (let i = 0; i < 13; i += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${(i * 37 + 11) % 100}%`;
    petal.style.setProperty('--fall-time', `${11 + (i % 6) * 2.5}s`);
    petal.style.setProperty('--fall-delay', `${-i * 1.8}s`);
    petal.style.setProperty('--drift', `${(i % 2 ? -1 : 1) * (38 + (i % 5) * 19)}px`);
    petal.style.scale = `${0.55 + (i % 5) * 0.16}`;
    petalLayer.appendChild(petal);
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
