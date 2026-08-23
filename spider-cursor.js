/*!
 * Spider Cursor (vanilla JS, no React/build tools needed)
 * Full-screen animated background: two "spiders" made of wobbly legs
 * that follow the cursor around the page. Purely visual, no sound.
 */
(function (global) {
  "use strict";

  function create(container) {
    container = container
      ? (typeof container === "string" ? document.querySelector(container) : container)
      : document.body;

    if (!container) {
      console.error("SpiderCursor: container element not found");
      return { destroy: function () {} };
    }

    var isBody = container === document.body;

    var canvas = document.createElement("canvas");
    canvas.style.display = "block";

    if (isBody) {
      // Full-page background layer, behind normal content, clicks pass through.
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.zIndex = "-1";
      canvas.style.pointerEvents = "none";
    } else {
      if (getComputedStyle(container).position === "static") {
        container.style.position = "relative";
      }
      container.style.overflow = "hidden";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    }

    container.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var sin = Math.sin, cos = Math.cos, PI = Math.PI,
        hypot = Math.hypot, min = Math.min, max = Math.max;

    var w, h, rafId;

    function rnd(x, dx) {
      if (x === undefined) x = 1;
      if (dx === undefined) dx = 0;
      return Math.random() * x + dx;
    }

    function many(n, f) {
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(f(i));
      return arr;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function noise(x, y, t) {
      if (t === undefined) t = 101;
      var w0 = sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * sin(0.4 * y + -1.3 * t + 1.0));
      var w1 = sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * sin(0.5 * x + -1.2 * t + 0.5));
      return w0 + w1;
    }

    function pt(x, y) {
      return { x: x, y: y };
    }

    function drawCircle(x, y, r) {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r, 0, 0, PI * 2);
      ctx.fill();
    }

    function drawLine(x0, y0, x1, y1) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      many(100, function (i) {
        i = (i + 1) / 100;
        var x = lerp(x0, x1, i);
        var y = lerp(y0, y1, i);
        var k = noise(x / 5 + x0, y / 5 + y0) * 2;
        ctx.lineTo(x + k, y + k);
      });
      ctx.stroke();
    }

    function viewW() {
      return isBody ? window.innerWidth : container.clientWidth;
    }
    function viewH() {
      return isBody ? window.innerHeight : container.clientHeight;
    }

    function spawn() {
      var pts = many(333, function () {
        return { x: rnd(viewW()), y: rnd(viewH()), len: 0, r: 0 };
      });

      var pts2 = many(9, function (i) {
        return { x: cos((i / 9) * PI * 2), y: sin((i / 9) * PI * 2) };
      });

      var seed = rnd(100);
      var tx = rnd(viewW());
      var ty = rnd(viewH());
      var x = rnd(viewW());
      var y = rnd(viewH());
      var kx = rnd(0.5, 0.5);
      var ky = rnd(0.5, 0.5);
      var walkRadius = pt(rnd(50, 50), rnd(50, 50));
      var legR = viewW() / rnd(100, 150);

      function paintPt(p) {
        pts2.forEach(function (pt2) {
          if (!p.len) return;
          drawLine(
            lerp(x + pt2.x * legR, p.x, p.len * p.len),
            lerp(y + pt2.y * legR, p.y, p.len * p.len),
            x + pt2.x * legR,
            y + pt2.y * legR
          );
        });
        drawCircle(p.x, p.y, p.r);
      }

      return {
        follow: function (nx, ny) {
          tx = nx;
          ty = ny;
        },
        tick: function (t) {
          var selfMoveX = cos(t * kx + seed) * walkRadius.x;
          var selfMoveY = sin(t * ky + seed) * walkRadius.y;
          var fx = tx + selfMoveX;
          var fy = ty + selfMoveY;

          x += min(viewW() / 100, (fx - x) / 10);
          y += min(viewH() / 100, (fy - y) / 10);

          var i = 0;
          pts.forEach(function (p) {
            var dx = p.x - x, dy = p.y - y;
            var len = hypot(dx, dy);
            var r = min(2, viewW() / len / 5);
            var increasing = len < viewW() / 10 && i++ < 8;
            var dir = increasing ? 0.1 : -0.1;
            if (increasing) r *= 1.5;
            p.r = r;
            p.len = max(0, min(p.len + dir, 1));
            paintPt(p);
          });
        }
      };
    }

    var spiders = many(2, spawn);

    function handlePointerMove(e) {
      var x, y;
      if (isBody) {
        x = e.clientX;
        y = e.clientY;
      } else {
        var rect = canvas.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      
      spiders.forEach(function (spider) {
        spider.follow(x, y);
      });
    }

    function resize() {
      var cw = viewW();
      var ch = viewH();
      if (w !== cw) w = canvas.width = cw;
      if (h !== ch) h = canvas.height = ch;
    }

    function anim(t) {
      resize();
      
      // Clear the canvas cleanly
      ctx.clearRect(0, 0, w, h);
      
      // Changed to frosty white to perfectly match the website's glassmorphism theme (--white variable)
      ctx.fillStyle = ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
      ctx.lineWidth = 1.4;
      
      t /= 1000;
      spiders.forEach(function (spider) {
        spider.tick(t);
      });
      rafId = requestAnimationFrame(anim);
    }

    var moveTarget = isBody ? window : canvas;
    moveTarget.addEventListener("pointermove", handlePointerMove);
    if (!isBody) canvas.style.touchAction = "none";

    resize();
    rafId = requestAnimationFrame(anim);

    return {
      destroy: function () {
        moveTarget.removeEventListener("pointermove", handlePointerMove);
        cancelAnimationFrame(rafId);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
  }

  global.SpiderCursor = { create: create };
})(window);
