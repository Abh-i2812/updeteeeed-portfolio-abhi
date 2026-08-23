/*!
 * Cursor Particle Typography (vanilla JS, no React/build tools needed)
 * Renders text as a field of canvas particles that scatter away from the
 * cursor and drift back to their original position. Optionally plays soft
 * ambient notes as the cursor moves across the text.
 */
(function (global) {
  "use strict";

  function Particle(x, y, size, color, dispersion, returnSpd) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.size = size;
    this.color = color;
    this.dispersion = dispersion;
    this.returnSpd = returnSpd;
  }

  Particle.prototype.update = function (mouseX, mouseY) {
    var dx = mouseX - this.x;
    var dy = mouseY - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var interactionRadius = 120;

    if (distance < interactionRadius && mouseX !== -1000 && mouseY !== -1000) {
      var fx = dx / distance;
      var fy = dy / distance;
      var force = (interactionRadius - distance) / interactionRadius;

      this.vx -= fx * force * this.dispersion;
      this.vy -= fy * force * this.dispersion;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;

    this.vx *= 0.85;
    this.vy *= 0.85;

    var distToOrigin = Math.sqrt(
      Math.pow(this.x - this.originX, 2) + Math.pow(this.y - this.originY, 2)
    );

    if (distToOrigin < 1 && Math.random() > 0.95) {
      this.vx += (Math.random() - 0.5) * 0.2;
      this.vy += (Math.random() - 0.5) * 0.2;
    }

    this.x += this.vx;
    this.y += this.vy;
  };

  Particle.prototype.draw = function (ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  };

  // C major pentatonic across two octaves — no combination of notes clashes
  var SCALE = [
    261.63, 293.66, 329.63, 392.0, 440.0,
    523.25, 587.33, 659.25, 783.99, 880.0
  ];

  function create(container, options) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    if (!container) {
      console.error("CursorParticleTypography: container element not found");
      return { destroy: function () {}, update: function () {} };
    }

    var settings = Object.assign(
      {
        text: "Design",
        fontSize: 120,
        fontFamily: "Inter, sans-serif",
        particleSize: 1.5,
        particleDensity: 6,
        dispersionStrength: 15,
        returnSpeed: 0.08,
        color: null,
        enableSound: false,
        soundVolume: 0.05
      },
      options
    );

    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }
    container.style.touchAction = "none";
    container.style.overflow = "hidden";

    var canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    container.appendChild(canvas);

    var ctx = canvas.getContext("2d", { willReadFrequently: true });

    var animationFrameId;
    var particles = [];
    var mouseX = -1000;
    var mouseY = -1000;
    var containerWidth = 0;
    var containerHeight = 0;

    // ---- Sound (Web Audio API) ----
    var audioCtx = null;
    var lastNoteTime = 0;
    var noteCooldownMs = 90;

    function unlockAudio() {
      if (!settings.enableSound) return;
      if (!audioCtx) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        audioCtx = new AudioCtx();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    }

    function playNote(freqIndex, pan) {
      if (!settings.enableSound || !audioCtx || audioCtx.state !== "running") return;

      var now = audioCtx.currentTime;
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var hasPanner = typeof audioCtx.createStereoPanner === "function";
      var panner = hasPanner ? audioCtx.createStereoPanner() : null;

      osc.type = "sine";
      var idx = Math.max(0, Math.min(SCALE.length - 1, freqIndex));
      osc.frequency.value = SCALE[idx];

      // Quick pluck envelope: fast attack, gentle exponential decay.
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(settings.soundVolume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      if (panner) {
        panner.pan.value = Math.max(-1, Math.min(1, pan));
        gain.connect(panner);
        panner.connect(audioCtx.destination);
      } else {
        gain.connect(audioCtx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.5);
    }

    function maybePlayNoteForMouse() {
      if (!settings.enableSound || !containerWidth || !containerHeight) return;
      var now = performance.now();
      if (now - lastNoteTime < noteCooldownMs) return;
      lastNoteTime = now;

      var verticalRatio = 1 - Math.min(1, Math.max(0, mouseY / containerHeight));
      var freqIndex = Math.floor(verticalRatio * (SCALE.length - 1));
      var pan = (mouseX / containerWidth) * 2 - 1;
      playNote(freqIndex, pan);
    }

    function init() {
      // Merged width/height fixes to ensure it renders properly
      containerWidth = container.clientWidth || container.offsetWidth || 800;
      containerHeight = container.clientHeight || container.offsetHeight || 420;
      if (!containerWidth || !containerHeight) return;

      var dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = containerWidth + "px";
      canvas.style.height = containerHeight + "px";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      var computedStyle = window.getComputedStyle(container);
      var textColor = settings.color || computedStyle.color || "#000000";

      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // Kept the larger font size multiplier (0.35 instead of 0.15) from our fix
      var effectiveFontSize = Math.min(settings.fontSize, containerWidth * 0.35);
      ctx.fillStyle = textColor;
      ctx.font = "bold " + effectiveFontSize + "px " + settings.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(settings.text, containerWidth / 2, containerHeight / 2);

      var textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
      particles = [];

      var step = Math.max(1, Math.floor(settings.particleDensity * dpr));

      for (var y = 0; y < textCoordinates.height; y += step) {
        for (var x = 0; x < textCoordinates.width; x += step) {
          var index = (y * textCoordinates.width + x) * 4;
          var alpha = textCoordinates.data[index + 3] || 0;
          if (alpha > 128) {
            particles.push(
              new Particle(
                x / dpr,
                y / dpr,
                settings.particleSize,
                textColor,
                settings.dispersionStrength,
                settings.returnSpeed
              )
            );
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update(mouseX, mouseY);
        particles[i].draw(ctx);
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    function handleMouseMove(e) {
      var rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      maybePlayNoteForMouse();
    }

    function handleMouseLeave() {
      mouseX = -1000;
      mouseY = -1000;
    }

    function handleTouchMove(e) {
      if (e.touches && e.touches[0]) {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
        maybePlayNoteForMouse();
      }
    }

    function handleTouchEnd() {
      mouseX = -1000;
      mouseY = -1000;
    }

    function handlePointerDown() {
      unlockAudio();
    }

    var resizeObserver = new ResizeObserver(function () {
      init();
    });
    resizeObserver.observe(container);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerdown", unlockAudio, { once: true });

    // Merged layout ready retry logic
    var timeoutId = setTimeout(function () {
      init();
      if (particles.length === 0) {
        setTimeout(init, 300);
      }
      animate();
    }, 300);

    return {
      destroy: function () {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("pointerdown", handlePointerDown);
        document.removeEventListener("pointerdown", unlockAudio);
        cancelAnimationFrame(animationFrameId);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (audioCtx) {
          audioCtx.close();
          audioCtx = null;
        }
      },
      update: function (newOptions) {
        Object.assign(settings, newOptions);
        init();
      }
    };
  }

  global.CursorParticleTypography = { create: create };
})(window);
