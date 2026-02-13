interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  connections: number;
  // Parallax layer: 0 = background (slow), 1 = mid, 2 = foreground (fast)
  layer: number;
  // Each particle has an anchor position it orbits around
  anchorX: number;
  anchorY: number;
  // Orbit properties
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  // Trail history
  trail: { x: number; y: number }[];
}

const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
let particles: Particle[] = [];
let mouse = { x: -1000, y: -1000 };
let scrollProgress = 0;
let scrollVelocity = 0;
let lastScrollProgress = 0;

// Cool blue/teal palette matching o16g.com
const COLORS = ["#6bb8d0", "#8ccade", "#4a8fa8", "#a0d4e4", "#5ba0b8"];
const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 150;
const MOUSE_RADIUS = 200;

// Parallax speeds per layer — how much particles shift with scroll
const LAYER_SCROLL_SPEED = [0.3, 0.7, 1.4];
const LAYER_SIZE = [0.7, 1.0, 1.6];
const LAYER_OPACITY = [0.15, 0.3, 0.5];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function createParticle(): Particle {
  const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : 2;
  const baseRadius = (Math.random() * 1.5 + 0.5) * LAYER_SIZE[layer];
  const baseOpacity = (Math.random() * 0.3 + 0.1) * (LAYER_OPACITY[layer] / 0.3);
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;

  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    radius: baseRadius,
    baseRadius,
    opacity: baseOpacity,
    baseOpacity,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    connections: 0,
    layer,
    anchorX: x,
    anchorY: y,
    orbitRadius: Math.random() * 30 + 10,
    orbitSpeed: (Math.random() * 0.005 + 0.002) * (layer === 2 ? 1.5 : 1),
    orbitAngle: Math.random() * Math.PI * 2,
    trail: [],
  };
}

function init() {
  resize();
  particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
}

function drawParticle(p: Particle) {
  // Motion trail for foreground particles when scrolling
  if (p.layer === 2 && p.trail.length > 1 && Math.abs(scrollVelocity) > 0.003) {
    ctx.beginPath();
    ctx.moveTo(p.trail[0].x, p.trail[0].y);
    for (let i = 1; i < p.trail.length; i++) {
      ctx.lineTo(p.trail[i].x, p.trail[i].y);
    }
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = Math.min(Math.abs(scrollVelocity) * 2, 0.12);
    ctx.lineWidth = p.radius * 0.6;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Core dot
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = p.opacity;
  ctx.fill();

  // Glow
  const glowSize = p.radius * (2.5 + (p.layer === 2 ? 2 : 0));
  ctx.beginPath();
  ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
  const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
  glow.addColorStop(0, p.color);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.globalAlpha = p.opacity * 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].connections = 0;
    // Only connect particles on same or adjacent layers
    for (let j = i + 1; j < particles.length; j++) {
      if (Math.abs(particles[i].layer - particles[j].layer) > 1) continue;

      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONNECTION_DISTANCE && particles[i].connections < 3 && particles[j].connections < 3) {
        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = particles[i].color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
        particles[i].connections++;
        particles[j].connections++;
      }
    }
  }
}

function update() {
  // Smooth scroll velocity for reactive effects
  scrollVelocity = scrollProgress - lastScrollProgress;
  lastScrollProgress += (scrollProgress - lastScrollProgress) * 0.1;

  const absVel = Math.abs(scrollVelocity);

  for (const p of particles) {

    // === PARALLAX: shift particles based on scroll and their layer ===
    const scrollOffset = scrollProgress * canvas.height * LAYER_SCROLL_SPEED[p.layer];

    // Orbit — gentle expansion when scrolling fast
    const orbitBoost = 1 + absVel * 30;
    p.orbitAngle += p.orbitSpeed * orbitBoost;

    // Orbit radius grows moderately on scroll
    const dynamicOrbitRadius = p.orbitRadius * (1 + absVel * 12);

    // Target position = anchor + orbit + parallax scroll offset
    const targetX = p.anchorX + Math.cos(p.orbitAngle) * dynamicOrbitRadius;
    const targetY = p.anchorY + Math.sin(p.orbitAngle) * dynamicOrbitRadius - scrollOffset;

    // Smooth interpolation toward target
    p.vx += (targetX - p.x) * 0.02;
    p.vy += (targetY - p.y) * 0.02;

    // Mouse repulsion
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS && dist > 0) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      const layerForce = LAYER_SCROLL_SPEED[p.layer];
      p.vx += (dx / dist) * force * 0.05 * layerForce;
      p.vy += (dy / dist) * force * 0.05 * layerForce;
    }

    // Damping
    p.vx *= 0.92;
    p.vy *= 0.92;

    p.x += p.vx;
    p.y += p.vy;

    // Wrap vertically with generous bounds
    const margin = 100;
    if (p.y < -margin) {
      p.y = canvas.height + margin;
      p.anchorY += canvas.height + margin * 2;
    }
    if (p.y > canvas.height + margin) {
      p.y = -margin;
      p.anchorY -= canvas.height + margin * 2;
    }
    // Wrap horizontally
    if (p.x < -margin) p.x = canvas.width + margin;
    if (p.x > canvas.width + margin) p.x = -margin;

    // Subtle size/brightness pulse on scroll
    p.radius = p.baseRadius * (1 + absVel * 5 * LAYER_SCROLL_SPEED[p.layer]);
    p.opacity = p.baseOpacity * (1 + absVel * 4);

    // Track trail for foreground particles
    if (p.layer === 2) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 6) p.trail.shift();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cool ambient glow
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height * 0.3, 0,
    canvas.width / 2, canvas.height * 0.3, canvas.width * 0.7
  );
  gradient.addColorStop(0, "rgba(107, 184, 208, 0.035)");
  gradient.addColorStop(0.5, "rgba(74, 143, 168, 0.015)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw by layer: background first, foreground last
  drawConnections();
  for (let layer = 0; layer <= 2; layer++) {
    for (const p of particles) {
      if (p.layer === layer) drawParticle(p);
    }
  }
}

function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
}

window.addEventListener("resize", resize);
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseleave", () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

init();
updateScrollProgress();
animate();
