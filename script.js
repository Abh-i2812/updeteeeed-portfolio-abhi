const frameBase = 'assets/hero-frames/ezgif-frame-';
const frameCount = 147;
const framePaths = Array.from({ length: frameCount }, (_, index) => `${frameBase}${String(index + 1).padStart(3, '0')}.jpg`);

const heroFrame = document.getElementById('heroFrame');
const heroFrameNext = document.getElementById('heroFrameNext');
const heroSection = document.querySelector('.hero');
const heroCopy = document.getElementById('heroCopy');
const progressRing = document.querySelector('.ring-fill');
const progressDot = document.querySelector('.progress-dot');
const revealEls = document.querySelectorAll('.reveal');
const certificatesTrack = document.querySelector('.certificates-track');
const certificateCards = Array.from(document.querySelectorAll('.certificate-card'));
const prevBtn = document.querySelector('.carousel-arrow.prev');
const nextBtn = document.querySelector('.carousel-arrow.next');
const dots = Array.from(document.querySelectorAll('.dot'));

const states = [
  {
    threshold: 0,
    title: 'Let ideas move with intent.',
    lead: 'I build digital products that feel precise, tactile, and alive.'
  },
  {
    threshold: 0.36,
    title: 'Designing stories with motion.',
    lead: 'Sharp systems, quiet signals, and thoughtful experiences that hold attention.'
  },
  {
    threshold: 0.72,
    title: 'Digital craft that carries weight.',
    lead: 'From product strategy to front-end execution, I shape work that feels lived-in and considered.'
  }
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

let lastFrameIndex = -1;
let heroFrameTransitionTimer = null;

function updateFrameForScroll() {
  if (!heroSection || !heroFrame) return;

  const rect = heroSection.getBoundingClientRect();
  const total = heroSection.offsetHeight - window.innerHeight;
  const progress = clamp((window.scrollY - (heroSection.offsetTop - 40)) / Math.max(total, 1), 0, 1);
  const easedProgress = 1 - Math.pow(1 - progress, 2.4);
  const frameIndex = Math.min(framePaths.length - 1, Math.floor(easedProgress * (framePaths.length - 1)));

  if (frameIndex === lastFrameIndex) {
    const state = states.reduce((current, next) => (progress >= next.threshold ? next : current), states[0]);
    heroCopy.querySelector('h1').textContent = state.title;
    heroCopy.querySelector('.intro').textContent = state.lead;
    return;
  }

  lastFrameIndex = frameIndex;
  const framePath = framePaths[frameIndex];

  if (heroFrameNext) {
    heroFrameNext.style.backgroundImage = `url('${framePath}')`;
    heroFrameNext.classList.add('is-visible');
    heroFrame.style.opacity = '0';
    heroFrameNext.style.opacity = '1';

    window.clearTimeout(heroFrameTransitionTimer);
    heroFrameTransitionTimer = window.setTimeout(() => {
      heroFrame.style.backgroundImage = `url('${framePath}')`;
      heroFrame.style.opacity = '1';
      heroFrameNext.style.opacity = '0';
      heroFrameNext.classList.remove('is-visible');
    }, 120);
  } else {
    heroFrame.style.backgroundImage = `url('${framePath}')`;
  }

  const state = states.reduce((current, next) => (progress >= next.threshold ? next : current), states[0]);
  heroCopy.querySelector('h1').textContent = state.title;
  heroCopy.querySelector('.intro').textContent = state.lead;
}

function updateProgressRing() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
  const circumference = 2 * Math.PI * 52;
  progressRing.style.strokeDasharray = `${circumference}`;
  progressRing.style.strokeDashoffset = `${circumference * (1 - progress)}`;
  const angle = progress * 360;
  progressDot.style.setProperty('--orbit-angle', `${angle}deg`);
}

function applyCurveScroll() {
  const curveItems = document.querySelectorAll('[data-curve]');
  if (!curveItems.length) return;

  const vh = window.innerHeight;

  curveItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = (vh / 2 - center) / vh;
    const drift = clamp(distance * 36, -24, 24);
    const opacity = clamp(0.45 + (1 - Math.abs(distance)) * 0.55, 0.5, 1);
    item.style.transform = `translate3d(0, ${drift}px, 0)`;
    item.style.opacity = opacity.toFixed(3);
  });
}

function updateCertificateCarousel(index) {
  if (!certificatesTrack || !certificateCards.length) return;

  const activeIndex = ((index % certificateCards.length) + certificateCards.length) % certificateCards.length;
  certificateCards.forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === activeIndex);
  });

  const gap = 18;
  const offset = certificateCards[0].getBoundingClientRect().width + gap;
  certificatesTrack.style.transform = `translateX(-${activeIndex * offset}px)`;

  dots.forEach((dot) => {
    dot.classList.toggle('active', Number(dot.dataset.index) === activeIndex);
  });
}

function bindCertificateCarousel() {
  if (!certificatesTrack || !certificateCards.length) return;

  let activeIndex = 0;

  const goTo = (index) => {
    activeIndex = ((index % certificateCards.length) + certificateCards.length) % certificateCards.length;
    updateCertificateCarousel(activeIndex);
  };

  prevBtn?.addEventListener('click', () => goTo(activeIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(activeIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });

  certificateCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const url = card.dataset.verifyUrl;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      goTo(index);
    });
  });

  updateCertificateCarousel(activeIndex);
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  revealEls.forEach((el) => observer.observe(el));
}



function setMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic');

  buttons.forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);
      const x = offsetX * 0.18;
      const y = offsetY * 0.18;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });

    button.addEventListener('pointerleave', () => {
      button.style.transform = '';
    });
  });
}

function createGalaxyBackground() {
  const canvas = document.getElementById('galaxyCanvas');
  const ctx = canvas.getContext('2d');
  const stars = [];
  const shootingStars = [];

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function seedStars() {
    stars.length = 0;
    const count = Math.min(160, Math.max(90, Math.floor(window.innerWidth / 12)));
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.12,
        alpha: Math.random() * 0.7 + 0.2
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    stars.forEach((star) => {
      const twinkle = 0.55 + Math.sin((performance.now() * 0.0007) + star.x) * 0.45;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${star.alpha * twinkle})`;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    shootingStars.forEach((star) => {
      const progress = (performance.now() - star.start) / star.duration;
      if (progress >= 1) {
        shootingStars.shift();
        return;
      }

      const x = star.x + star.dx * progress * 400;
      const y = star.y + star.dy * progress * 400;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${1 - progress})`;
      ctx.lineWidth = 1.2;
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
  }

  function maybeSpawnShootingStar() {
    if (Math.random() > 0.006) return;
    shootingStars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.45,
      dx: (Math.random() * 0.8) - 0.4,
      dy: Math.random() * 0.8 + 0.4,
      start: performance.now(),
      duration: 1200 + Math.random() * 900
    });
  }

  function animate() {
    drawStars();
    maybeSpawnShootingStar();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  seedStars();
  animate();

  window.addEventListener('resize', () => {
    resizeCanvas();
    seedStars();
  });

  window.addEventListener('pointermove', (event) => {
    const offsetX = (event.clientX / window.innerWidth - 0.5) * 12;
    const offsetY = (event.clientY / window.innerHeight - 0.5) * 12;
    canvas.style.transform = `translate(${offsetX * 0.2}px, ${offsetY * 0.2}px)`;
  });
}

function initOrbitAngles() {
  const orbitItems = document.querySelectorAll('.skill-orbit li');
  orbitItems.forEach((item, index) => {
    const angle = (360 / orbitItems.length) * index + (index % 2 === 0 ? 16 : -12);
    item.style.setProperty('--angle', `${angle}deg`);
  });
}

let thockAudioCtx = null;
let thockAudioBuffer = null;

function unlockAudio() {
  if (thockAudioCtx && thockAudioCtx.state === 'suspended') {
    thockAudioCtx.resume().catch(() => {});
  }
}

function initThockAudio() {
  if (thockAudioCtx) return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    thockAudioCtx = new Ctor();

    ['pointerdown', 'keydown', 'click', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, unlockAudio, { capture: true });
    });

    const AUDIO_SAMPLE = "data:@file/ogg;base64,T2dnUwACAAAAAAAAAAD8mDZiAAAAAPn8AdgBHgF2b3JiaXMAAAAAAoC7AAAAAAAAgLUBAAAAAAC4AU9nZ1MAAAAAAAAAAAAA/Jg2YgEAAAAkrRTxET////////////////////8HA3ZvcmJpcwwAAABMYXZmNjEuNy4xMDABAAAAHwAAAGVuY29kZXI9TGF2YzYxLjE5LjEwMSBsaWJ2b3JiaXMBBXZvcmJpcyVCQ1YBAEAAACRzGCpGpXMWhBAaQlAZ4xxCzmvsGUJMEYIcMkxbyyVzkCGkoEKIWyiB0JBVAABAAACHQXgUhIpBCCGEJT1YkoMnPQghhIg5eBSEaUEIIYQQQgghhBBCCCGERTlokoMnQQgdhOMwOAyD5Tj4HIRFOVgQgydB6CCED0K4moOsOQghhCQ1SFCDBjnoHITCLCiKgsQwuBaEBDUojILkMMjUgwtCiJqDSTX4GoRnQXgWhGlBCCGEJEFIkIMGQcgYhEZBWJKDBjm4FITLQagahCo5CB+EIDRkFQCQAACgoiiKoigKEBqyCgDIAAAQQFEUx3EcyZEcybEcCwgNWQUAAAEACAAAoEiKpEiO5EiSJFmSJVmSJVmS5omqLMuyLMuyLMsyEBqyCgBIAABQUQxFcRQHCA1ZBQBkAAAIoDiKpViKpWiK54iOCISGrAIAgAAABAAAEDRDUzxHlETPVFXXtm3btm3btm3btm3btm1blmUZCA1ZBQBAAAAQ0mlmqQaIMAMZBkJDVgEACAAAgBGKMMSA0JBVAABAAACAGEoOogmtOd+c46BZDppKsTkdnEi1eZKbirk555xzzsnmnDHOOeecopxZDJoJrTnnnMSgWQqaCa0555wnsXnQmiqtOeeccc7pYJwRxjnnnCateZCajbU555wFrWmOmkuxOeecSLl5UptLtTnnnHPOOeecc84555zqxekcnBPOOeecqL25lpvQxTnnnE/G6d6cEM4555xzzjnnnHPOOeecIDRkFQAABABAEIaNYdwpCNLnaCBGEWIaMulB9+gwCRqDnELq0ehopJQ6CCWVcVJKJwgNWQUAAAIAQAghhRRSSCGFFFJIIYUUYoghhhhyyimnoIJKKqmooowyyyyzzDLLLLPMOuussw47DDHEEEMrrcRSU2011lhr7jnnmoO0VlprrbVSSimllFIKQkNWAQAgAAAEQgYZZJBRSCGFFGKIKaeccgoqqIDQkFUAACAAgAAAAABP8hzRER3RER3RER3RER3R8RzPESVREiVREi3TMjXTU0VVdWXXlnVZt31b2IVd933d933d+HVhWJZlWZZlWZZlWZZlWZZlWZYgNGQVAAACAAAghBBCSCGFFFJIKcYYc8w56CSUEAgNWQUAAAIACAAAAHAUR3EcyZEcSbIkS9IkzdIsT/M0TxM9URRF0zRV0RVdUTdtUTZl0zVdUzZdVVZtV5ZtW7Z125dl2/d93/d93/d93/d93/d9XQdCQ1YBABIAADqSIymSIimS4ziOJElAaMgqAEAGAEAAAIriKI7jOJIkSZIlaZJneZaomZrpmZ4qqkBoyCoAABAAQAAAAAAAAIqmeIqpeIqoeI7oiJJomZaoqZoryqbsuq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq4LhIasAgAkAAB0JEdyJEdSJEVSJEdygNCQVQCADACAAAAcwzEkRXIsy9I0T/M0TxM90RM901NFV3SB0JBVAAAgAIAAAAAAAAAMybAUy9EcTRIl1VItVVMt1VJF1VNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVN0zRNEwgNWQkAkAEAkBBTLS3GmgmLJGLSaqugYwxS7KWxSCpntbfKMYUYtV4ah5RREHupJGOKQcwtpNApJq3WVEKFFKSYYyoVUg5SIDRkhQAQmgHgcBxAsixAsiwAAAAAAAAAkDQN0DwPsDQPAAAAAAAAACRNAyxPAzTPAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABA0jRA8zxA8zwAAAAAAAAA0DwP8DwR8EQRAAAAAAAAACzPAzTRAzxRBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABA0jRA8zxA8zwAAAAAAAAAsDwP8EQR0DwRAAAAAAAAACzPAzxRBDzRAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAEOAAABBgIRQasiIAiBMAcEgSJAmSBM0DSJYFTYOmwTQBkmVB06BpME0AAAAAAAAAAAAAJE2DpkHTIIoASdOgadA0iCIAAAAAAAAAAAAAkqZB06BpEEWApGnQNGgaRBEAAAAAAAAAAAAAzzQhihBFmCbAM02IIkQRpgkAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAGHAAAAgwoQwUGrIiAIgTAHA4imUBAIDjOJYFAACO41gWAABYliWKAABgWZooAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAYcAAACDChDBQashIAiAIAcCiKZQHHsSzgOJYFJMmyAJYF0DyApgFEEQAIAAAocAAACLBBU2JxgEJDVgIAUQAABsWxLE0TRZKkaZoniiRJ0zxPFGma53meacLzPM80IYqiaJoQRVE0TZimaaoqME1VFQAAUOAAABBgg6bE4gCFhqwEAEICAByKYlma5nmeJ4qmqZokSdM8TxRF0TRNU1VJkqZ5niiKommapqqyLE3zPFEURdNUVVWFpnmeKIqiaaqq6sLzPE8URdE0VdV14XmeJ4qiaJqq6roQRVE0TdNUTVV1XSCKpmmaqqqqrgtETxRNU1Vd13WB54miaaqqq7ouEE3TVFVVdV1ZBpimaaqq68oyQFVV1XVdV5YBqqqqruu6sgxQVdd1XVmWZQCu67qyLMsCAAAOHAAAAoygk4wqi7DRhAsPQKEhKwKAKAAAwBimFFPKMCYhpBAaxiSEFEImJaXSUqogpFJSKRWEVEoqJaOUUmopVRBSKamUCkIqJZVSAADYgQMA2IGFUGjISgAgDwCAMEYpxhhzTiKkFGPOOScRUoox55yTSjHmnHPOSSkZc8w556SUzjnnnHNSSuacc845KaVzzjnnnJRSSuecc05KKSWEzkEnpZTSOeecEwAAVOAAABBgo8jmBCNBhYasBABSAQAMjmNZmuZ5omialiRpmud5niiapiZJmuZ5nieKqsnzPE8URdE0VZXneZ4oiqJpqirXFUXTNE1VVV2yLIqmaZqq6rowTdNUVdd1XZimaaqq67oubFtVVdV1ZRm2raqq6rqyDFzXdWXZloEsu67s2rIAAPAEBwCgAhtWRzgpGgssNGQlAJABAEAYg5BCCCFlEEIKIYSUUggJAAAYcAAACDChDBQashIASAUAAIyx1lprrbXWQGettdZaa62AzFprrbXWWmuttdZaa6211lPrrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmuttdZaa6211lprrbXWWmstpZRSSimllFJKKaWUUkoppZRSSgUA+lU4APg/2LA6wknRWGChISsBgHAAAMAYpRhzDEIppVQIMeacdFRai7FCiDHnJKTUWmzFc85BKCGV1mIsnnMOQikpxVZjUSmEUlJKLbZYi0qho5JSSq3VWIwxqaTWWoutxmKMSSm01FqLMRYjbE2ptdhqq7EYY2sqLbQYY4zFCF9kbC2m2moNxggjWywt1VprMMYY3VuLpbaaizE++NpSLDHWXAAAd4MDAESCjTOsJJ0VjgYXGrISAAgJACAQUooxxhhzzjnnpFKMOeaccw5CCKFUijHGnHMOQgghlIwx5pxzEEIIIYRSSsaccxBCCCGEkFLqnHMQQgghhBBKKZ1zDkIIIYQQQimlgxBCCCGEEEoopaQUQgghhBBCCKmklEIIIYRSQighlZRSCCGEEEIpJaSUUgohhFJCCKGElFJKKYUQQgillJJSSimlEkoJJYQSUikppRRKCCGUUkpKKaVUSgmhhBJKKSWllFJKIYQQSikFAAAcOAAABBhBJxlVFmGjCRcegEJDVgIAZAAAkKKUUiktRYIipRikGEtGFXNQWoqocgxSzalSziDmJJaIMYSUk1Qy5hRCDELqHHVMKQYtlRhCxhik2HJLoXMOAAAAQQCAgJAAAAMEBTMAwOAA4XMQdAIERxsAgCBEZohEw0JweFAJEBFTAUBigkIuAFRYXKRdXECXAS7o4q4DIQQhCEEsDqCABByccMMTb3jCDU7QKSp1IAAAAAAADADwAACQXAAREdHMYWRobHB0eHyAhIiMkAgAAAAAABcAfAAAJCVAREQ0cxgZGhscHR4fICEiIyQBAIAAAgAAAAAggAAEBAQAAAAAAAIAAAAEBE9nZ1MABIAWAAAAAAAA/Jg2YgIAAADYOe7ODzYz3dLLKCknJy4pMTPW2TTfw+Ng0nwPj4PJrVRCJiQlhcYajKg0TRNtt3uGkKbTabTd1699a236fV6dThNULcM3Bl9kJkzxF0uHpviLpUPbrCQ5I7aq6exg2LRNj25Vk8eETlWPrsb5bEpTUU23+Saz5ah0oDfhKZpZ5eHVDqAFQr4Ih6aZVR5e7ABaIMSVcKhh+pGyWierNdVARrs92cbgLLYpxmLODahYhBQxxloFUTVWxO7gaDdsDjZHwTAxqqkebY9up9u0VSpt002bNhWpGOHn5UvDlatXlm9GhkF6jl9eXphbqQq+Xq/P5dyhVSpt06abarpNt+m6KKC1Ctyp+exB2fvq1SED87II3a/+mZfzBTYEO//ANyMiQBM9/4X0GokqvSy0yk7qEKA1ULbeppruUkWBzL3LIwj4QzINM9O686/b2aF6jhaK0YvCJw6CAlQBfulEepvLmpiaB9JaOi6dSG9z2Sam5kJaS8c5LGbD0QnOyrGqCkBCwjhiI3FhGCpwALGJ4JiwJYlaEUfjwiAIcBDrIBJgoajiDQKQCd6s8JbhHymba5hPgW7qakeV8/1lPDQgBCaybIRWiurrBZ1oVjZtrAwrrKDTq+hNZTh7XU2wVIBYZYE7gyW0YkA44G4R4RduEdMkfcwbQ0TiytC/NvteAABoERs1q41cAEs5d614v+x+4Kx7s6Z704gS0eDqV0e6n66u5gWvU2sW5U7c/49z9wVn/x2G8W2d0uD/Nvdj3j/21sD90d79r616+l9y1d211q8t5dXd3bTdrd1a5mxe/bVb991z+9i2/tQ33xT2e19d+VteVvWur63vve+/71ve1d70x7u36Vlf3Nn/e2/0vL++7r0f52ndd4y3u+7f+1ve179f1fdfX3v6d19/33iGveX2v/e+9+/y39b4/m3b4l/N+b/m/934f89/m/b3e4Vv2/fOa/1z3d31v83zvu7b51b333333333333333+7z9bZ/3+f73vO1/72/7z27eT677n027/t9f3e+632/v3v/+73//W1t+9/v9/f7u/2+z+d+9/N+v282zzvv3671rX18f1/9tq+b++/v6z7781x/5/2+t9ve3zvvX/e+1/f31ve5733f3+v/7/1+//zevr3Pff425vv7/v41zzvvN++fVz/nvd5v+/q73l//7//7//7/3z93z/1s3vf5vd9v+/e519/f33u++x6/957vut/3e/3f93zf/bxf+/v+d//X8//e577vu9/f//3/f3+ve99jnt/eX///f6/P5/3a+///vv+272/1fe2+1z++n+3r45j3173fe74+vtf++j//69re9363n+3fe9u///v6/u/v+f3v+d/6vve9z/u+7+99X7uv4xvz2re+79f++rvd+x4fx1c/z2ef3661te9vr9/73vf//n/v7znP+93vf+2//+29t69931/f/3v++/6/X3uf/+sff5zX302/11/X/7r3a/vd+/i///++r/f+2l97f69f2/t5ft7fe77b+/e/91X7/rf99ffae//ve/3/vv+77z3e+3t//7z/++vve0xrW9/r3vf8v1f7/r6/6//7+n7v8dzned/7fv3//n/f55nv/X7f3x+3zvvX9v31//3//97P+xzrvL6/z+P6+nre+13f1/2/P1//6+9vf/t7f3//2/e+//P+/e/7v5/3n7/3/v73+/f+/T4P/2//+r5e/9fe9/f/+vte43n98/3+/q/l+/28P+//u/7e63n+33W+95x3zPv7/r/r671f+//f+3uf+7j/9/f/++v/6xvf/v3/7/1/z3tf3/n899v7fB7j/9/3/9/zfb5r/e97ve//z6/3++/v2t//37vv9b1++x6///vf332te/3f9/n/+7r+99f+/r2f9b23v//j2vd1/d/neY/f7+/d53k+P//P97/f/13//5nvbf+9r//6+z//a3vv632+7/+5rn/f/9/nvp//5/f1+nvd33/fe5/Xve3zfb/nfT738Vz///1+//f/+9/Xe/7f///v87r/6/+e89/r6/+u+7zH8f9+30+tz3u+177fe/2/9/d9n++71n/+3v/+fX5//7/v8/n9Xff5e3//9///+r/+f/9X/+9vvudrf/3/vv+2ff089/3/v38v2772v/7fe59nfd1v2/r//n+v/9/+ft7vv/7+f1+v///+//mufZ///t/vbf//vvf+/39f+///7//f/1f/f93n//7X/3/X3t/v///+///v+/1v/7//2/+x7r2+3r333u//37/fe/u9n+/vv1/X59b/36+/tfe9//++/+d9vefve3/3eZ7f9/n/+5l/9bve7/P+2vbv6//2+/39///9r///f3/v7//vv9///b/+///7f9//vv9///b7+rve/7vv/+2tff/623///3/zXntf21v//n9/z9/+d/+/r+/5/f29//6/b//f/1/3+9977vvX3///X9//7//3v3//7//3v3//7//v/9/+/f/+2/v9///f+vr+7/3v+9//b1//f9//vf+t/41tz3vef39/3///2/+///v/+///v/1/f/7v3/+9n6+3/fv+3+/z++9/n+/v6/2/7+/v+r6v8fl99///3/+13+///r7/X3f86//+f7//+3vf///+vv+//vff3vv1f2//fv+//+2tfe/9v/+9/+2tf/3f7//Xf/+vv9/b/vfX99vXv/9vX///f/+u8/3+/vr////X0///e///f///+/3/93/+//f/7/f/e7/339//f3+9v/+u+vv1+////v7/Xvf3ff/9r7/f///rf////e//b99//v//8=";
    const binary = atob(AUDIO_SAMPLE.split(',')[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    thockAudioCtx.decodeAudioData(bytes.buffer, (buf) => {
      thockAudioBuffer = buf;
    });
  } catch(e) {}
}

function synthClickSound(category) {
  if (!thockAudioCtx) return;
  try {
    const now = thockAudioCtx.currentTime;
    
    // 1. Thock Pitch Sweep Osc
    const osc = thockAudioCtx.createOscillator();
    const oscGain = thockAudioCtx.createGain();
    
    const startFreq = category === 'spacebar' ? 220 : (category === 'modifier' ? 280 : 380);
    const endFreq = category === 'spacebar' ? 30 : 45;
    const duration = category === 'spacebar' ? 0.055 : 0.035;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    oscGain.gain.setValueAtTime(1.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(thockAudioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);

    // 2. Crisp Snap Click Noise
    const bufferSize = Math.floor(thockAudioCtx.sampleRate * 0.02);
    const noiseBuffer = thockAudioCtx.createBuffer(1, bufferSize, thockAudioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = thockAudioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = thockAudioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = category === 'spacebar' ? 1800 : 3400;
    filter.Q.value = 1.8;

    const noiseGain = thockAudioCtx.createGain();
    noiseGain.gain.setValueAtTime(1.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(thockAudioCtx.destination);

    noise.start(now);
  } catch(e) {}
}

function playThockSound(category, muted) {
  initThockAudio();
  if (!thockAudioCtx) return;
  if (thockAudioCtx.state === 'suspended') {
    thockAudioCtx.resume().catch(() => {});
  }

  // Pure Web Audio synthesized click
  synthClickSound(category);

  // Sample overlay
  if (thockAudioBuffer) {
    try {
      const src = thockAudioCtx.createBufferSource();
      src.buffer = thockAudioBuffer;
      const profile = {
        normal: { rate: [0.97, 1.04], gain: 1.2 },
        spacebar: { rate: [0.72, 0.78], gain: 1.4 },
        modifier: { rate: [0.86, 0.92], gain: 1.0 }
      }[category] || { rate: [0.95, 1.05], gain: 1.1 };

      const rate = profile.rate[0] + Math.random() * (profile.rate[1] - profile.rate[0]);
      src.playbackRate.value = rate;

      const gainNode = thockAudioCtx.createGain();
      gainNode.gain.value = (muted ? profile.gain * 0.75 : profile.gain) * 1.3;

      src.connect(gainNode);
      gainNode.connect(thockAudioCtx.destination);
      src.start(0);
    } catch(e) {}
  }
}

function createKeyboardInstance(containerEl, options = {}) {
  if (!containerEl) return null;
  const { showIndicator = true, idPrefix = 'kb' } = options;

  const ROWS = [
    [
      { id: 'esc', label: 'Esc', small: true, align: 'left' },
      { id: '1', label: '1', shiftLabel: '!' },
      { id: '2', label: '2', shiftLabel: '@' },
      { id: '3', label: '3', shiftLabel: '#' },
      { id: '4', label: '4', shiftLabel: '$' },
      { id: '5', label: '5', shiftLabel: '%' },
      { id: '6', label: '6', shiftLabel: '^' },
      { id: '7', label: '7', shiftLabel: '&' },
      { id: '8', label: '8', shiftLabel: '*' },
      { id: '9', label: '9', shiftLabel: '(' },
      { id: '0', label: '0', shiftLabel: ')' },
      { id: 'minus', label: '-', shiftLabel: '_' },
      { id: 'equal', label: '=', shiftLabel: '+' },
      { id: 'backspace', label: 'Backspace', width: 2, small: true, align: 'left' }
    ],
    [
      { id: 'tab', label: 'Tab', width: 1.5, align: 'left', small: true },
      { id: 'q', label: 'Q' }, { id: 'w', label: 'W' }, { id: 'e', label: 'E' }, { id: 'r', label: 'R' }, { id: 't', label: 'T' },
      { id: 'y', label: 'Y' }, { id: 'u', label: 'U' }, { id: 'i', label: 'I' }, { id: 'o', label: 'O' }, { id: 'p', label: 'P' },
      { id: 'lbracket', label: '[', shiftLabel: '{' },
      { id: 'rbracket', label: ']', shiftLabel: '}' },
      { id: 'backslash', label: '\\', shiftLabel: '|', width: 1.5 }
    ],
    [
      { id: 'caps', label: 'CapsLock', width: 1.75, align: 'left', small: true },
      { id: 'a', label: 'A' }, { id: 's', label: 'S' }, { id: 'd', label: 'D' }, { id: 'f', label: 'F' }, { id: 'g', label: 'G' },
      { id: 'h', label: 'H' }, { id: 'j', label: 'J' }, { id: 'k', label: 'K' }, { id: 'l', label: 'L' },
      { id: 'semicolon', label: ';', shiftLabel: ':' },
      { id: 'quote', label: "'", shiftLabel: '"' },
      { id: 'enter', label: 'Enter', width: 2.25, align: 'left', small: true }
    ],
    [
      { id: 'lshift', label: 'Shift', width: 2.25, align: 'left', small: true },
      { id: 'z', label: 'Z' }, { id: 'x', label: 'X' }, { id: 'c', label: 'C' }, { id: 'v', label: 'V' }, { id: 'b', label: 'B' },
      { id: 'n', label: 'N' }, { id: 'm', label: 'M' },
      { id: 'comma', label: ',', shiftLabel: '<' },
      { id: 'period', label: '.', shiftLabel: '>' },
      { id: 'slash', label: '/', shiftLabel: '?' },
      { id: 'rshift', label: 'Shift', width: 2.75, align: 'left', small: true }
    ],
    [
      { id: 'lctrl', label: 'Ctrl', width: 1.25, small: true, muted: true, align: 'left' },
      { id: 'lwin', label: 'Win', width: 1.25, small: true, muted: true, align: 'left' },
      { id: 'lalt', label: 'Alt', width: 1.25, small: true, muted: true, align: 'left' },
      { id: 'space', label: '', width: 6.25 },
      { id: 'ralt', label: 'Alt', width: 1.25, small: true, muted: true, align: 'left' },
      { id: 'rwin', label: 'Win', width: 1.25, small: true, muted: true, align: 'left' },
      { id: 'fn', label: 'Fn', width: 1.25, small: true, muted: true, align: 'left' }
    ]
  ];

  const CODE_TO_KEY_ID = {
    Escape: 'esc', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9', Digit0: '0',
    Minus: 'minus', Equal: 'equal', Backspace: 'backspace', Tab: 'tab', KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r', KeyT: 't', KeyY: 'y', KeyU: 'u',
    KeyI: 'i', KeyO: 'o', KeyP: 'p', BracketLeft: 'lbracket', BracketRight: 'rbracket', Backslash: 'backslash', CapsLock: 'caps', KeyA: 'a', KeyS: 's',
    KeyD: 'd', KeyF: 'f', KeyG: 'g', KeyH: 'h', KeyJ: 'j', KeyK: 'k', KeyL: 'l', Semicolon: 'semicolon', Quote: 'quote', Enter: 'enter', ShiftLeft: 'lshift',
    KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b', KeyN: 'n', KeyM: 'm', Comma: 'comma', Period: 'period', Slash: 'slash', ShiftRight: 'rshift',
    ControlLeft: 'lctrl', MetaLeft: 'lwin', AltLeft: 'lalt', Space: 'space', AltRight: 'ralt', MetaRight: 'rwin'
  };

  const ALL_KEYS = {};
  ROWS.forEach(row => row.forEach(key => ALL_KEYS[key.id] = key));
  const MODIFIER_IDS = new Set(['esc', 'tab', 'caps', 'enter', 'backspace', 'lshift', 'rshift', 'lctrl', 'lwin', 'lalt', 'ralt', 'rwin', 'fn']);

  function getSoundCategory(id) {
    if (id === 'space') return 'spacebar';
    if (MODIFIER_IDS.has(id)) return 'modifier';
    return 'normal';
  }

  containerEl.innerHTML = `
    <div style="width: 100%; max-width: 48rem; display: flex; flex-direction: column; align-items: center;">
      ${showIndicator ? `
      <div id="${idPrefix}-indicator" style="display: flex; align-items: center; justify-content: center; margin-bottom: 0.8rem; min-height: 2rem;">
        <span style="font-size: 0.875rem; font-weight: 500; color: #71717a;">Press any key...</span>
      </div>` : ''}
      <div style="perspective: 1800px; width: 100%;">
        <div style="position: relative; width: 100%; transform: rotateX(7deg); transform-origin: 50% 100%;">
          <div style="position: relative; border-radius: 0.5rem; padding: 1.2%; background: linear-gradient(178deg, #9C673B 0%, #875529 35%, #71421A 70%, #59300E 100%); box-shadow: 0 0.5px 0 rgba(255,222,185,0.3) inset, 0 -2px 5px rgba(35,19,6,0.4) inset, 0 4px 12px rgba(15,8,3,0.35);">
            <div style="position: relative; border-radius: 0.35rem; padding: 5px; background: #14110E; box-shadow: inset 0 3px 8px rgba(0,0,0,0.7);">
              <div id="${idPrefix}-rows" style="display: flex; flex-direction: column; gap: 3.5px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const rowsContainer = containerEl.querySelector(`#${idPrefix}-rows`);
  const indicatorEl = showIndicator ? containerEl.querySelector(`#${idPrefix}-indicator`) : null;
  const activeKeys = new Set();

  ROWS.forEach((row, rowIndex) => {
    const rowEl = document.createElement('div');
    rowEl.style.display = 'flex';
    rowEl.style.gap = '3.5px';
    rowEl.style.width = '100%';

    row.forEach(key => {
      const keyBtn = document.createElement('button');
      keyBtn.type = 'button';
      keyBtn.className = 'kb-key';
      keyBtn.id = `${idPrefix}-key-${key.id}`;
      keyBtn.style.position = 'relative';
      keyBtn.style.userSelect = 'none';
      keyBtn.style.outline = 'none';
      keyBtn.style.flex = `${key.width || 1} 1 0%`;
      keyBtn.style.minWidth = '0';
      keyBtn.style.height = 'clamp(2.15rem, min(4.15vw, 7.5vh), 2.95rem)';

      const label = key.id === 'space' ? '' : key.label;
      keyBtn.innerHTML = `
        ${key.shiftLabel ? `<span style="position: absolute; top: 3px; left: 6px; font-size: 0.55rem; color: #726d64; font-weight: 500;">${key.shiftLabel}</span>` : ''}
        <span style="position: absolute; bottom: 5px; ${key.align === 'left' ? 'left: 7px;' : 'left: 50%; transform: translateX(-50%);'} font-size: ${key.small ? '0.65rem' : '0.8rem'}; font-weight: 700; color: #383430;">${label}</span>
      `;

      const press = () => {
        keyBtn.setAttribute('data-pressed', 'true');
        activeKeys.add(key.id);
        if (indicatorEl) updateIndicator();
        playThockSound(getSoundCategory(key.id), key.muted);
      };

      const release = () => {
        keyBtn.removeAttribute('data-pressed');
        activeKeys.delete(key.id);
        if (indicatorEl) updateIndicator();
      };

      keyBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        press();
      });
      keyBtn.addEventListener('pointerup', release);
      keyBtn.addEventListener('pointerleave', release);

      rowEl.appendChild(keyBtn);
    });

    rowsContainer.appendChild(rowEl);
  });

  function updateIndicator() {
    if (!indicatorEl) return;
    if (activeKeys.size === 0) {
      indicatorEl.innerHTML = `<span style="font-size: 0.875rem; font-weight: 500; color: #71717a;">Press any key...</span>`;
      return;
    }
    const parts = Array.from(activeKeys).map(id => ALL_KEYS[id]?.label || id);
    indicatorEl.innerHTML = `<div style="display: flex; align-items: center; gap: 5px;">${parts.map(p => `<kbd style="padding: 4px 8px; font-size: 0.75rem; font-weight: 600; color: #3f3f46; background: #ffffff; border: 1px solid #e4e4e7; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${p}</kbd>`).join('<span style="font-size: 0.72rem; color: #b9b9be;">+</span>')}</div>`;
  }

  function triggerPress(id) {
    const btn = containerEl.querySelector(`#${idPrefix}-key-${id}`);
    if (btn) {
      btn.setAttribute('data-pressed', 'true');
      activeKeys.add(id);
      if (indicatorEl) updateIndicator();
      playThockSound(getSoundCategory(id), ALL_KEYS[id]?.muted);
    }
  }

  function triggerRelease(id) {
    const btn = containerEl.querySelector(`#${idPrefix}-key-${id}`);
    if (btn) {
      btn.removeAttribute('data-pressed');
      activeKeys.delete(id);
      if (indicatorEl) updateIndicator();
    }
  }

  return {
    triggerPress,
    triggerRelease,
    CODE_TO_KEY_ID,
    ALL_KEYS
  };
}

function initLoader() {
  const loader = document.getElementById('loaderScreen');
  const loaderName = document.getElementById('loaderName');
  const introContainer = document.getElementById('introKeyboardContainer');
  if (!loader || !loaderName) return;

  let introKb = null;
  if (introContainer) {
    introKb = createKeyboardInstance(introContainer, { showIndicator: false, idPrefix: 'intro-kb' });
  }

  const fullName = 'Abhishek Yadgalwad';
  let currentIndex = 0;

  function getCharKeyId(char) {
    if (char === ' ') return { id: 'space', shift: false };
    const lower = char.toLowerCase();
    const isUpper = char !== lower;
    return { id: lower, shift: isUpper };
  }

  const typeNextChar = () => {
    if (currentIndex >= fullName.length) {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.classList.remove('is-loading');
      }, 700);
      return;
    }

    const char = fullName[currentIndex];
    const { id, shift } = getCharKeyId(char);
    currentIndex++;

    if (introKb && id) {
      if (shift) {
        introKb.triggerPress('lshift');
        setTimeout(() => {
          introKb.triggerPress(id);
          loaderName.textContent = fullName.slice(0, currentIndex);
          setTimeout(() => {
            introKb.triggerRelease(id);
            introKb.triggerRelease('lshift');
            setTimeout(typeNextChar, 110);
          }, 110);
        }, 50);
      } else {
        introKb.triggerPress(id);
        loaderName.textContent = fullName.slice(0, currentIndex);
        setTimeout(() => {
          introKb.triggerRelease(id);
          setTimeout(typeNextChar, 110);
        }, 110);
      }
    } else {
      loaderName.textContent = fullName.slice(0, currentIndex);
      setTimeout(typeNextChar, 140);
    }
  };

  setTimeout(typeNextChar, 400);
}

function initVintageKeyboard() {
  const container = document.getElementById('vintageKeyboardContainer');
  if (!container) return;

  const mainKb = createKeyboardInstance(container, { showIndicator: true, idPrefix: 'main-kb' });
  if (!mainKb) return;

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    const id = mainKb.CODE_TO_KEY_ID[e.code];
    if (id) {
      mainKb.triggerPress(id);
    }
  });

  window.addEventListener('keyup', (e) => {
    const id = mainKb.CODE_TO_KEY_ID[e.code];
    if (id) {
      mainKb.triggerRelease(id);
    }
  });
}


function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function pronounceName() {
  if (!('speechSynthesis' in window)) {
    showToast("Abhishek");
    return;
  }

  window.speechSynthesis.cancel();

  // Phonetic English spelling so the TTS engine reads it naturally.
  // "Uh-bhee-shek" = correct syllable breakdown of Abhishek
  const phoneticText = "Uh-bhee-shek";

  function speak(voices) {
    const utterance = new SpeechSynthesisUtterance(phoneticText);
    utterance.rate = 0.82;
    utterance.pitch = 1.0;

    // Prefer Indian English voice — it handles South Asian names much more naturally.
    // Fall back to any English voice if en-IN isn't available.
    const preferred =
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    utterance.lang = preferred ? preferred.lang : "en-IN";

    window.speechSynthesis.speak(utterance);
    showToast("🗣️ Abhishek");
  }

  // Voices may not be loaded yet on first call — wait for them if needed
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    speak(voices);
  } else {
    window.speechSynthesis.onvoiceschanged = function () {
      speak(window.speechSynthesis.getVoices());
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
}

function initPronounceName() {
  const btn = document.getElementById('pronounceBtn');
  if (btn) {
    btn.addEventListener('click', pronounceName);
  }
}

function initLiveClock() {
  const display = document.getElementById('liveTimeDisplay');
  const hourHand = document.getElementById('clockHour');
  const minHand = document.getElementById('clockMinute');

  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    if (display) display.textContent = `${timeStr} IST`;

    if (hourHand && minHand) {
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const hourDeg = (hours + minutes / 60) * 30;
      const minDeg = minutes * 6;

      hourHand.setAttribute('transform', `rotate(${hourDeg} 12 12)`);
      minHand.setAttribute('transform', `rotate(${minDeg} 12 12)`);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-action-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = btn.dataset.copy;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied ${text} to clipboard!`);
        }).catch(() => {
          showToast(`Email: ${text}`);
        });
      }
    });
  });
}

function initCommandPalette() {
  const trigger = document.getElementById('cmdPaletteTrigger');
  const modal = document.getElementById('cmdPaletteModal');
  const input = document.getElementById('cmdInput');
  const list = document.getElementById('cmdList');
  if (!modal || !input || !list) return;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    input.value = '';
    filterItems('');
    setTimeout(() => input.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function filterItems(query) {
    const items = list.querySelectorAll('.cmd-item');
    const q = query.toLowerCase().trim();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (trigger) trigger.addEventListener('click', openModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  input.addEventListener('input', (e) => {
    filterItems(e.target.value);
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('open')) closeModal();
      else openModal();
    } else if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.cmd-item');
    if (!item) return;

    const action = item.dataset.action;
    const target = item.dataset.target;
    const url = item.dataset.url;

    closeModal();

    if (action === 'nav' && target) {
      const targetEl = document.querySelector(target);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'copy-email') {
      navigator.clipboard.writeText('abhishekyadgalwad2812@gmail.com').then(() => {
        showToast('Copied email to clipboard!');
      });
    } else if (action === 'pronounce') {
          pronounceName();
    } else if (action === 'link' && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
}

function initSpiderCursor() {
  // Delegates to the standalone spider-cursor.js module.
  // That script creates its own canvas (fixed, z-index -1) and
  // handles pointer tracking, resize, and color theming itself.
  if (window.SpiderCursor) {
    window.SpiderCursor.create(); // attaches to <body>, full-viewport, behind content
  } else {
    console.error('SpiderCursor is not defined — spider-cursor.js did not load. Check the <script src> path/network tab.');
  }
}

function init() {
  updateFrameForScroll();
  updateProgressRing();
  applyCurveScroll();
  revealOnScroll();
  initOrbitAngles();
  bindCertificateCarousel();
  setMagneticButtons();

  createGalaxyBackground();
  initLoader();
  // NOTE: initFloatingParallax() and initCounters() were being called here
  // but were never defined anywhere in this file. That threw a
  // ReferenceError which silently stopped every init() call after it,
  // including initSpiderCursor() and everything below it. Removed until
  // those features are actually implemented.
  initVintageKeyboard();
  initPronounceName();
  initLiveClock();
  initCopyButtons();
  initCommandPalette();
}

window.addEventListener('load', init);
// Runs independently on its own listener so it can never be blocked by
// an error anywhere else in init() again.
window.addEventListener('load', initSpiderCursor);
window.addEventListener('scroll', () => {
  updateFrameForScroll();
  updateProgressRing();
  applyCurveScroll();
}, { passive: true });
window.addEventListener('resize', () => {
  updateFrameForScroll();
  updateProgressRing();
  applyCurveScroll();
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const heroCopy = document.getElementById('heroCopy');
  if (heroCopy) {
    heroCopy.querySelector('h1').textContent = 'Let ideas move with intent.';
    heroCopy.querySelector('.intro').textContent = 'I build digital products that feel precise, tactile, and alive.';
  }
} 
