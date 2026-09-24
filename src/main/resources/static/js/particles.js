/**
 * ADVANCED ANTIGRAVITY PARTICLE DYNAMICS SYSTEM
 * 
 * High-performance physics simulation featuring:
 * 1. Inverse-Gravitational Field & Anti-Gravity Wells around cursor and multi-touch points
 * 2. Inertial Momentum Transfer: Swiping/flicking mouse or touch throws particles with fluid velocity
 * 3. Kinetic Shockwave Pulses: Tap / Click generates expanding acoustic shockwave rings
 * 4. Micro-Spring Elastic Equilibrium: Particles gently tethered to organic floating anchors
 * 5. Constellation & Triangulated Geometric Mesh in Warm Crema & Roasted Coffee Tones
 * 6. High-DPI Canvas scaling & adaptive density for touchscreens, mobile, and 4K displays
 */

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width = 0;
  let height = 0;
  let dpr = 1;

  // Physics & Visual Configuration
  const CONFIG = {
    friction: 0.935,            // Momentum air resistance (closer to 1 = longer glide)
    springStrength: 0.0018,     // Return-to-equilibrium tether force
    cursorRadius: 175,          // Antigravity force field radius (px)
    cursorRepulsion: 7.2,       // Repulsion blast intensity
    flickMultiplier: 0.22,      // Velocity transferred from pointer swipe
    maxVelocity: 14,            // Velocity cap to avoid instability
    connectionDist: 115,        // Max distance for constellation lines
    triangleDist: 75,           // Max distance for translucent geometric facets
    shockwaveSpeed: 7.5,        // Speed of click shockwave expansion
    shockwavePower: 16          // Force exerted by shockwaves
  };

  // Luxury Coffee & Crema Color Palette
  const PALETTE = [
    { fill: 'rgba(198, 139, 89, 0.85)',  glow: 'rgba(217, 119, 6, 0.45)',  size: 2.8 }, // Roasted Crema
    { fill: 'rgba(127, 85, 57, 0.80)',   glow: 'rgba(127, 85, 57, 0.35)',  size: 2.2 }, // Deep Mocha
    { fill: 'rgba(221, 184, 146, 0.90)', glow: 'rgba(221, 184, 146, 0.50)', size: 1.8 }, // Crema Light
    { fill: 'rgba(176, 125, 98, 0.82)',  glow: 'rgba(176, 125, 98, 0.38)', size: 2.5 }, // Caramel
    { fill: 'rgba(217, 119, 6, 0.95)',   glow: 'rgba(217, 119, 6, 0.60)',  size: 3.2 }  // Golden Ember
  ];

  // Active pointers (Supports multi-touch and mouse)
  const pointers = new Map();

  // Active kinetic shockwaves from clicks/taps
  const shockwaves = [];

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.anchorX = this.x;
      this.anchorY = this.y;

      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;

      const style = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      this.color = style.fill;
      this.glow = style.glow;
      this.baseRadius = style.size * (0.8 + Math.random() * 0.5);
      this.radius = this.baseRadius;
      this.mass = this.baseRadius * 1.5;

      // Curl / Brownian drift parameters
      this.noisePhaseX = Math.random() * Math.PI * 2;
      this.noisePhaseY = Math.random() * Math.PI * 2;
      this.noiseSpeed = 0.008 + Math.random() * 0.012;
      this.breathPhase = Math.random() * Math.PI * 2;
    }

    update() {
      // 1. Organic Ambient Float (Breathing sinusoidal motion like coffee aroma)
      this.noisePhaseX += this.noiseSpeed;
      this.noisePhaseY += this.noiseSpeed;
      this.breathPhase += 0.02;

      this.vx += Math.sin(this.noisePhaseX) * 0.045;
      this.vy += Math.cos(this.noisePhaseY) * 0.045;

      // 2. Tether to moving anchor with soft elasticity
      const dxAnchor = this.anchorX - this.x;
      const dyAnchor = this.anchorY - this.y;
      this.vx += dxAnchor * CONFIG.springStrength;
      this.vy += dyAnchor * CONFIG.springStrength;

      // Slowly drift anchor across screen
      this.anchorX += Math.sin(this.noisePhaseY * 0.5) * 0.25;
      this.anchorY += Math.cos(this.noisePhaseX * 0.5) * 0.25;

      // 3. Antigravity Fields from Active Pointers (Mouse or Multi-Touch)
      pointers.forEach(pointer => {
        if (!pointer.active) return;
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist < CONFIG.cursorRadius && dist > 1) {
          const normal = dist / CONFIG.cursorRadius;
          // Non-linear gravitational push
          const force = (1 - normal) * CONFIG.cursorRepulsion / (this.mass * 0.8);
          const angle = Math.atan2(dy, dx);

          // Radial repulsion
          this.vx -= Math.cos(angle) * force;
          this.vy -= Math.sin(angle) * force;

          // Tangential swirl (vortex deflection around finger/mouse)
          const swirl = (1 - normal) * 1.4;
          this.vx += -Math.sin(angle) * swirl;
          this.vy += Math.cos(angle) * swirl;

          // Momentum transfer from flicking pointer
          this.vx += pointer.vx * (1 - normal) * CONFIG.flickMultiplier;
          this.vy += pointer.vy * (1 - normal) * CONFIG.flickMultiplier;
        }
      });

      // 4. Kinetic Shockwave Distortions (From clicks / taps)
      for (let i = 0; i < shockwaves.length; i++) {
        const sw = shockwaves[i];
        const dx = this.x - sw.x;
        const dy = this.y - sw.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const waveDelta = Math.abs(dist - sw.radius);

        if (waveDelta < 32 && dist > 0.1) {
          const wavePower = (1 - waveDelta / 32) * (1 - sw.radius / sw.maxRadius) * CONFIG.shockwavePower;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * wavePower / this.mass;
          this.vy += Math.sin(angle) * wavePower / this.mass;
        }
      }

      // 5. Apply Friction and Speed Limits
      this.vx *= CONFIG.friction;
      this.vy *= CONFIG.friction;

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > CONFIG.maxVelocity) {
        this.vx = (this.vx / speed) * CONFIG.maxVelocity;
        this.vy = (this.vy / speed) * CONFIG.maxVelocity;
      }

      this.x += this.vx;
      this.y += this.vy;

      // 6. Dynamic Visual Sizing (Grows with kinetic energy / speed)
      this.radius = this.baseRadius + Math.sin(this.breathPhase) * 0.35 + Math.min(speed * 0.4, 2.5);

      // Boundary Wrap
      const pad = 30;
      if (this.x < -pad) { this.x = width + pad; this.anchorX = this.x; }
      if (this.x > width + pad) { this.x = -pad; this.anchorX = this.x; }
      if (this.y < -pad) { this.y = height + pad; this.anchorY = this.y; }
      if (this.y > height + pad) { this.y = -pad; this.anchorY = this.y; }
    }

    draw() {
      // Radiant particle with soft glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.4, this.radius), 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.glow;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  let particles = [];

  function createParticles() {
    particles = [];
    // Calculate balanced particle density based on viewport resolution
    const pixelArea = width * height;
    const count = Math.min(Math.max(Math.floor(pixelArea / 11500), 45), 140);

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // Create shockwave ripple on tap or click
  function triggerShockwave(x, y) {
    shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: Math.max(width, height) * 0.38,
      speed: CONFIG.shockwaveSpeed,
      alpha: 0.8
    });
  }

  function updateAndDrawShockwaves() {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = (1 - sw.radius / sw.maxRadius) * 0.8;

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.01) {
        shockwaves.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(217, 119, 6, ' + sw.alpha + ')';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(217, 119, 6, 0.6)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Render constellation filaments and geometric facets
  function drawConstellations() {
    const len = particles.length;

    for (let i = 0; i < len; i++) {
      const p1 = particles[i];

      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDist) {
          const alpha = (1 - dist / CONFIG.connectionDist) * 0.26;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(198, 139, 89, ' + alpha + ')';
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Delaunay-style triangular translucent facets
          for (let k = j + 1; k < len; k++) {
            const p3 = particles[k];
            const d2 = Math.hypot(p2.x - p3.x, p2.y - p3.y);
            const d3 = Math.hypot(p1.x - p3.x, p1.y - p3.y);

            if (d2 < CONFIG.triangleDist && d3 < CONFIG.triangleDist) {
              const triAlpha = (1 - (dist + d2 + d3) / (CONFIG.triangleDist * 3)) * 0.055;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.closePath();
              ctx.fillStyle = 'rgba(198, 139, 89, ' + triAlpha + ')';
              ctx.fill();
            }
          }
        }
      }
    }
  }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update pointers (decay velocity over time if stationary)
    pointers.forEach(pointer => {
      pointer.vx *= 0.65;
      pointer.vy *= 0.65;
    });

    // Draw background shockwave ripples
    updateAndDrawShockwaves();

    // Update and draw all particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // Draw elastic filament mesh and facets
    drawConstellations();

    animationFrameId = requestAnimationFrame(animate);
  }

  // --- INTERACTION EVENT LISTENERS ---

  // Mouse handling
  window.addEventListener('mousemove', (e) => {
    let p = pointers.get('mouse');
    if (!p) {
      p = { x: e.clientX, y: e.clientY, prevX: e.clientX, prevY: e.clientY, vx: 0, vy: 0, active: true };
      pointers.set('mouse', p);
    } else {
      p.vx = e.clientX - p.prevX;
      p.vy = e.clientY - p.prevY;
      p.prevX = p.x;
      p.prevY = p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      p.active = true;
    }
  });

  window.addEventListener('mousedown', (e) => {
    triggerShockwave(e.clientX, e.clientY);
  });

  window.addEventListener('mouseleave', () => {
    const p = pointers.get('mouse');
    if (p) p.active = false;
  });

  // Touchscreen handling (Kiosks, Tablets, Phones)
  window.addEventListener('touchstart', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      pointers.set(t.identifier, {
        x: t.clientX,
        y: t.clientY,
        prevX: t.clientX,
        prevY: t.clientY,
        vx: 0,
        vy: 0,
        active: true
      });
      triggerShockwave(t.clientX, t.clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const p = pointers.get(t.identifier);
      if (p) {
        p.vx = t.clientX - p.prevX;
        p.vy = t.clientY - p.prevY;
        p.prevX = p.x;
        p.prevY = p.y;
        p.x = t.clientX;
        p.y = t.clientY;
        p.active = true;
      }
    }
  }, { passive: true });

  function endTouch(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      pointers.delete(t.identifier);
    }
  }

  window.addEventListener('touchend', endTouch);
  window.addEventListener('touchcancel', endTouch);
  window.addEventListener('resize', resize);

  // Initialize
  resize();
  animate();
})();