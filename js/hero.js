/* ==========================================================================
   Hero intro
   Sequence: portrait rises -> role fades in and starts cycling
   -> scroll arrow appears and bobs
   ========================================================================== */
(() => {
  // If GSAP didn't load, drop the "hidden until animated" gate so the page still shows.
  if (!window.gsap) {
    document.documentElement.classList.remove('js');
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel) => document.querySelector(sel);
  const el = {
    photo: $('.photo'),
    role: $('.role'),
    faces: [...document.querySelectorAll('.role__face')],
    cue: $('.scroll-cue'),
    cueIcon: $('.scroll-cue__gems'),
  };

  const ROLE_HOLD = 1.5; // seconds each phrase stays on screen

  // Cycles Software Engineer -> Product Builder -> Full Stack Developer -> repeat
  function startRoleLoop() {
    if (reduceMotion) return;

    const faces = el.faces;
    let i = 0;

    const flip = () => {
      const current = faces[i];
      i = (i + 1) % faces.length;
      const next = faces[i];

      gsap.timeline({ onComplete: () => gsap.delayedCall(ROLE_HOLD, flip) })
        .to(current, { rotateX: -90, duration: 0.4, ease: 'power2.in' })
        .fromTo(next, { rotateX: 90 }, { rotateX: 0, duration: 0.5, ease: 'power2.out' });
    };

    gsap.delayedCall(ROLE_HOLD, flip);
  }

  function buildTimeline() {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' },
      onComplete: onIntroComplete,
    });

    // 1. Portrait rises in
    tl.fromTo(el.photo,
      { autoAlpha: 0, y: 50 },
      { autoAlpha: 1, y: 0, duration: 0.9 },
      0);

    // 2. Role fades in, then the flip cycle starts
    tl.fromTo(el.role,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.6 },
      0.5);
    tl.add(startRoleLoop, 1.1);

    // 3. Arrow appears (bob starts in onIntroComplete)
    tl.fromTo(el.cue,
      { autoAlpha: 0, y: -14 },
      { autoAlpha: 1, y: 0, duration: 0.7 },
      1.3);

    return tl;
  }

  function onIntroComplete() {
    removeSkipListeners();
    if (reduceMotion) return;

    gsap.to(el.cueIcon, {
      y: 10,
      duration: 0.9,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  // Skip: any scroll / tap / key press jumps straight to the finished state.
  const skipEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  let tl;

  function skipIntro() {
    if (tl && tl.progress() < 1) tl.progress(1, false);
    removeSkipListeners();
  }
  function removeSkipListeners() {
    skipEvents.forEach((e) => window.removeEventListener(e, skipIntro));
  }

  async function init() {
    // Wait for web fonts so nothing reflows mid-animation (1.5s cap).
    await Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);

    tl = buildTimeline();

    if (reduceMotion) {
      tl.progress(1, false);
      return;
    }

    skipEvents.forEach((e) => window.addEventListener(e, skipIntro, { passive: true }));
    tl.play();
  }

  init();
})();