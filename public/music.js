/* Vinay & Indira — original WhatsApp recording first, optional instrumental tracks.
   Start recording synchronously from a user click so Safari/Chrome do not block it.
*/
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dock = $('soundDock');
  if (!dock) return;

  const toggle = $('musicToggle');
  const settings = $('settingsToggle');
  const panel = $('soundPanel');
  const state = $('musicState');
  const status = $('soundStatus');
  const picker = $('musicTrack');
  const slider = $('musicVolume');
  const effectsInput = $('soundEffects');
  const motionInput = $('motionEffects');
  const audio = $('blessingAudio');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const remember = (key, value) => { try { localStorage.setItem('wedding-' + key, String(value)); } catch (_) {} };
  const recall = (key, fallback) => { try { return localStorage.getItem('wedding-' + key) ?? fallback; } catch (_) { return fallback; } };

  const synthTracks = {
    grace: {title: 'Chapel Grace · piano & strings', bpm: 76, voice: 'piano', chords: [[60,64,67],[57,60,64],[65,69,72],[67,71,74]], notes: [72,null,76,79,76,null,74,72,69,null,72,76,72,null,69,67,72,null,77,76,72,null,69,72,71,null,74,79,76,74,72,null]},
    vows: {title: 'Sacred Vows · church organ', bpm: 68, voice: 'organ', chords: [[62,66,69],[59,62,66],[67,71,74],[69,73,76]], notes: [69,null,74,null,78,76,74,null,71,null,74,78,76,null,74,null,74,null,79,null,78,76,74,71,73,null,76,null,78,76,74,null]},
    bells: {title: 'Wedding Bells · gentle chimes', bpm: 90, voice: 'bell', chords: [[60,64,67],[65,69,72],[57,60,64],[67,71,74]], notes: [79,76,72,null,76,79,84,null,81,77,72,77,81,null,79,null,76,72,69,null,72,76,81,79,79,76,74,71,72,null,72,null]}
  };

  // ALWAYS use the actual uploaded WhatsApp recording on a fresh page load.
  // Guests may switch to an instrumental during their current visit.
  let chosenTrack = 'blessing';
  let playing = false;
  let resumeWhenVisible = false;
  let musicAllowed = true; // A prior visit's off setting must not silently suppress the default track.
  let effects = recall('effects', 'true') !== 'false';
  let motion = recall('motion', prefersReducedMotion ? 'false' : 'true') !== 'false';
  let volume = Math.min(100, Math.max(0, Number(recall('volume', '75')) || 0));
  let ctx = null, synthGain = null, effectsGain = null, echo = null, timer = null, step = 0, nextBeat = 0;

  picker.value = chosenTrack;
  slider.value = String(volume);
  $('volumeValue').textContent = volume + '%';
  effectsInput.checked = effects;
  motionInput.checked = motion;
  document.documentElement.dataset.motion = motion ? 'on' : 'off';
  audio.volume = volume / 100;
  audio.loop = true;

  function update(message) {
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pause wedding music' : 'Play wedding music');
    state.textContent = playing ? 'Playing · tap to pause' : 'Tap to play';
    dock.classList.toggle('playing', playing);
    if (message) status.textContent = message;
  }
  update('The WhatsApp recording will play when you open the invitation.');

  function setupSynth() {
    if (ctx) return true;
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return false;
    try {
      ctx = new AudioClass();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -17;
      compressor.ratio.value = 5;
      compressor.attack.value = .012;
      compressor.release.value = .22;
      compressor.connect(ctx.destination);
      synthGain = ctx.createGain(); synthGain.gain.value = 0; synthGain.connect(compressor);
      effectsGain = ctx.createGain(); effectsGain.gain.value = effects ? .42 : 0; effectsGain.connect(compressor);
      const delay = ctx.createDelay(1); delay.delayTime.value = .25;
      const wet = ctx.createGain(); wet.gain.value = .13;
      const feedback = ctx.createGain(); feedback.gain.value = .15;
      delay.connect(wet); wet.connect(compressor); delay.connect(feedback); feedback.connect(delay);
      echo = delay;
      return true;
    } catch (_) { return false; }
  }

  function note(midi, when, duration, voice, intensity = 1, bus = synthGain) {
    if (!ctx || !bus) return;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const env = ctx.createGain();
    const amp = (voice === 'pad' ? .022 : voice === 'organ' ? .043 : .054) * intensity;
    const attack = voice === 'organ' || voice === 'pad' ? .12 : .012;
    env.gain.setValueAtTime(.0001, when);
    env.gain.exponentialRampToValueAtTime(amp, when + attack);
    env.gain.exponentialRampToValueAtTime(.0001, when + Math.max(.16, duration));
    env.connect(bus);
    if (bus === synthGain && echo) {
      const send = ctx.createGain(); send.gain.value = .16; env.connect(send); send.connect(echo);
    }
    const partials = voice === 'bell' ? [1, 2.015, 3.97] : [1, 2, 3];
    const gains = voice === 'bell' ? [1, .24, .07] : [1, .22, .065];
    partials.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const layer = ctx.createGain(); layer.gain.value = gains[i];
      osc.type = voice === 'organ' && i === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f * ratio, when);
      osc.connect(layer); layer.connect(env);
      osc.start(when); osc.stop(when + Math.max(.16, duration) + .07);
    });
  }

  function schedule() {
    if (!playing || chosenTrack === 'blessing' || !ctx || ctx.state !== 'running') return;
    const track = synthTracks[chosenTrack], halfBeat = 30 / track.bpm;
    while (nextBeat < ctx.currentTime + .23) {
      const index = step % 32;
      const chord = track.chords[Math.floor(index / 8)];
      if (index % 8 === 0) {
        chord.forEach(n => note(n, nextBeat, halfBeat * 7.8, 'pad', .82));
        note(chord[0] - 12, nextBeat, halfBeat * 5.2, 'organ', .52);
      }
      if (index % 2 === 0 && track.voice !== 'organ') note(chord[(index / 2) % 3] + 12, nextBeat, halfBeat * 1.8, track.voice, .42);
      if (track.notes[index] != null) note(track.notes[index], nextBeat, halfBeat * 1.8, track.voice, .92);
      nextBeat += halfBeat; step++;
    }
  }

  function stopCurrent() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    audio.pause();
    if (synthGain && ctx) synthGain.gain.setTargetAtTime(0, ctx.currentTime, .05);
  }

  function pause() {
    resumeWhenVisible = false; // A deliberate pause must stay paused across tab switches.
    musicAllowed = false;
    playing = false;
    stopCurrent();
    update('Music paused. Tap the music icon to resume.');
  }

  function play() {
    musicAllowed = true;
    if (playing) return;
    if (chosenTrack === 'blessing') {
      // Crucial: call play() directly in the event-handler stack. Do not await
      // AudioContext.resume() or another promise before requesting media playback.
      audio.volume = volume / 100;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          if (!musicAllowed || chosenTrack !== 'blessing') { audio.pause(); return; }
          playing = true;
          update('Playing your uploaded WhatsApp wedding audio.');
        }).catch(() => {
          playing = false;
          update('Sound is blocked. Tap the music icon to play the recording.');
        });
      } else {
        playing = true;
        update('Playing your uploaded WhatsApp wedding audio.');
      }
      return;
    }
    if (!setupSynth()) { update('Instrumental playback is not supported in this browser.'); return; }
    const resume = ctx.resume();
    Promise.resolve(resume).then(() => {
      if (!musicAllowed || chosenTrack === 'blessing') return;
      playing = true;
      step = 0;
      nextBeat = ctx.currentTime + .045;
      synthGain.gain.setTargetAtTime(volume / 100 * .96, ctx.currentTime, .06);
      timer = setInterval(schedule, 65);
      schedule();
      update('Playing ' + synthTracks[chosenTrack].title + '.');
    }).catch(() => update('Tap the music icon again to allow audio.'));
  }

  toggle.addEventListener('click', () => {
    if (playing) pause(); else play();
  });

  function closePanel() { panel.hidden = true; settings.setAttribute('aria-expanded', 'false'); }
  settings.addEventListener('click', () => { panel.hidden = !panel.hidden; settings.setAttribute('aria-expanded', String(!panel.hidden)); });
  $('closeSounds').addEventListener('click', () => { closePanel(); settings.focus(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { closePanel(); settings.focus(); } });
  document.addEventListener('pointerdown', event => { if (!dock.contains(event.target) && !panel.hidden) closePanel(); });

  picker.addEventListener('change', () => {
    if (picker.value !== 'blessing' && !synthTracks[picker.value]) return;
    const wasPlaying = playing;
    playing = false;
    stopCurrent();
    chosenTrack = picker.value;
    if (chosenTrack === 'blessing') audio.currentTime = 0;
    if (wasPlaying) play();
    else update('Selected ' + (chosenTrack === 'blessing' ? 'WhatsApp wedding recording' : synthTracks[chosenTrack].title) + '. Tap music to play.');
  });
  slider.addEventListener('input', () => {
    volume = Number(slider.value);
    remember('volume', volume);
    $('volumeValue').textContent = volume + '%';
    audio.volume = volume / 100;
    if (ctx && synthGain) synthGain.gain.setTargetAtTime(playing && chosenTrack !== 'blessing' ? volume / 100 * .96 : 0, ctx.currentTime, .05);
  });
  effectsInput.addEventListener('change', () => {
    effects = effectsInput.checked;
    remember('effects', effects);
    if (effectsGain) effectsGain.gain.value = effects ? .42 : 0;
  });
  motionInput.addEventListener('change', () => {
    motion = motionInput.checked;
    remember('motion', motion);
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
  });

  function clickSound(isOpening) {
    if (!effects || !setupSynth()) return;
    const strike = () => {
      const now = ctx.currentTime + .015;
      if (isOpening) [76, 79, 84].forEach((n, i) => note(n, now + i * .1, .58, 'bell', .55, effectsGain));
      else note(88, now, .12, 'bell', .16, effectsGain);
    };
    if (ctx.state === 'suspended') ctx.resume().then(strike).catch(() => {});
    else strike();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('#soundDock')) return;
    const isOpening = event.target.closest('#openEnvelope, #openButton');
    if (isOpening && !document.body.classList.contains('opened')) {
      // The uploaded track is the first choice on every load. Users can still
      // choose an alternative before opening via the settings button.
      if (musicAllowed) play();
      clickSound(true);
    } else if (event.target.closest('button, a')) clickSound(false);
  }, { capture: true });

  // Temporarily pause in a background tab, then resume from the same position
  // when the visitor returns. Do not override a deliberate manual pause.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resumeWhenVisible = playing && musicAllowed;
      if (resumeWhenVisible) {
        playing = false;
        stopCurrent();
        update('Music paused while the tab is inactive.');
      }
    } else if (resumeWhenVisible) {
      resumeWhenVisible = false;
      if (musicAllowed) play();
    }
  });
  audio.addEventListener('error', () => update('The uploaded MP3 could not load. Check assets/default-blessing-audio.mp3.'));
})();
