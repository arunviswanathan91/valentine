/**
 * Canvas-based starfield and particle effects
 * Optimized for performance with requestAnimationFrame
 */

import animationLoop from './animations.js';

class CanvasEffects {
    constructor(canvasId = 'starfield-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Canvas element not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.enabled = true;

        this.init();
    }

    init() {
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Track mouse for particle effects
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Generate stars
        this.generateStars(150);

        // Register animation loop
        animationLoop.register((deltaTime) => this.render(deltaTime));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Add a particle burst at specified position
     */
    addParticleBurst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2,
                color: this.randomColor()
            });
        }
    }

    randomColor() {
        const colors = ['#fda4af', '#a3e635', '#8b5cf6', '#ec4899', '#ffffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    render(deltaTime) {
        if (!this.enabled) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render stars with twinkling
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const twinkle = Math.sin(star.twinklePhase) * 0.3;
            const opacity = Math.max(0, Math.min(1, star.opacity + twinkle));

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.fill();
        });

        // Render and update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life -= p.decay;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            // Render particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            this.ctx.fill();
        }
    }

    /**
     * Toggle effects on/off
     */
    toggle(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * Trigger confetti effect
     */
    confetti() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Create multiple bursts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.addParticleBurst(centerX, centerY, 30);
            }, i * 100);
        }
    }
}

export default CanvasEffects;
