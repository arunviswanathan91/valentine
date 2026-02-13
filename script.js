/**
 * ULTRA-CUTE VALENTINE APP - ALL-IN-ONE VERSION
 * Combined physics + animations + canvas + app logic
 * No ES6 modules - works perfectly on GitHub Pages!
 */

// ============================================
// PHYSICS UTILITIES
// ============================================
const Physics = {
    easing: {
        easeOutElastic(t) {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 :
                Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeOutQuad(t) {
            return t * (2 - t);
        },
        easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }
    },

    spring(current, target, velocity, config = {}) {
        const { stiffness = 0.1, damping = 0.8 } = config;
        const force = (target - current) * stiffness;
        velocity = (velocity + force) * damping;
        return { position: current + velocity, velocity };
    },

    magneticRepulsion(obj, repulsor, strength = 100, radius = 150) {
        const dx = obj.x - repulsor.x;
        const dy = obj.y - repulsor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radius || distance === 0) {
            return { x: 0, y: 0 };
        }

        const force = strength / (distance * distance);
        const angle = Math.atan2(dy, dx);

        return {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force
        };
    },

    distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

// ============================================
// ANIMATION LOOP
// ============================================
class AnimationLoop {
    constructor() {
        this.callbacks = new Set();
        this.running = false;
        this.frameId = null;
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.loop();
    }

    loop() {
        if (!this.running) return;
        this.callbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Animation error:', error);
            }
        });
        this.frameId = requestAnimationFrame(() => this.loop());
    }

    register(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }
}

// ============================================
// CANVAS EFFECTS
// ============================================
class CanvasEffects {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.particles = [];
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.generateStars(150);
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

    addParticleBurst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            const colors = ['#fda4af', '#a3e635', '#8b5cf6', '#ec4899', '#ffffff'];

            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render stars
        this.stars.forEach(star => {
            star.twinklePhase += star.twinkleSpeed;
            const opacity = star.opacity + Math.sin(star.twinklePhase) * 0.3;

            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, opacity))})`;
            this.ctx.fill();
        });

        // Render particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            this.ctx.fill();
        }
    }

    confetti() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.addParticleBurst(centerX, centerY, 30), i * 100);
        }
    }
}

// ============================================
// MAIN VALENTINE APP
// ============================================
class ValentineApp {
    constructor() {
        this.noBtn = document.getElementById('no-btn');
        this.yesBtn = document.getElementById('yes-btn');
        this.questionCard = document.getElementById('question-card');
        this.successCard = document.getElementById('success-card');
        this.eyes = document.querySelectorAll('.eye-pupil');
        this.emojiContainer = document.getElementById('emoji-reactions');

        // Physics state for NO button
        this.noBtnState = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0 };
        this.mouse = { x: 0, y: 0 };
        this.chaseCount = 0;

        // YES button scale (with maximum limit!)
        this.yesScale = 1;
        this.MAX_YES_SCALE = 2.5; // Cap at 2.5x size

        this.emojiReactions = [
            "nope! 😜", "hehe 😆", "not today! 🙈", "try again! 😂",
            "almost! 😝", "so close! 🤭", "nice try! 😁", "nuh-uh! 🙅"
        ];

        this.init();
    }

    init() {
        // Initialize canvas
        this.canvasEffects = new CanvasEffects('background-canvas');
        this.animationLoop = new AnimationLoop();

        // Set initial NO button position
        this.initializeNoButton();

        // Event listeners
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });

        this.yesBtn.addEventListener('click', () => this.onYesClick());
        this.yesBtn.addEventListener('mouseenter', () => this.onYesHover());
        this.noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.moveNoButtonAway();
        });

        // Start animation
        this.animationLoop.start();
        this.animationLoop.register(() => {
            this.update();
            this.canvasEffects.render();
        });

        // Show card
        setTimeout(() => this.questionCard.classList.add('visible'), 100);
    }

    initializeNoButton() {
        const rect = this.noBtn.getBoundingClientRect();
        this.noBtnState.x = rect.left + rect.width / 2;
        this.noBtnState.y = rect.top + rect.height / 2;
        this.noBtnState.targetX = this.noBtnState.x;
        this.noBtnState.targetY = this.noBtnState.y;
    }

    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.updateEyeTracking();
        this.updateCardTilt();
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            this.mouse.x = e.touches[0].clientX;
            this.mouse.y = e.touches[0].clientY;
            this.updateEyeTracking();
        }
    }

    update() {
        // Check proximity to NO button
        const btnRect = this.noBtn.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        const distance = Physics.distance(
            { x: this.mouse.x, y: this.mouse.y },
            { x: btnCenterX, y: btnCenterY }
        );

        const detectionRadius = 120 + (this.chaseCount * 10);

        if (distance < detectionRadius) {
            this.moveNoButtonAway();
        }

        this.updateNoButtonPosition();
    }

    moveNoButtonAway() {
        this.chaseCount++;

        // Show emoji
        this.showEmojiReaction();

        // Shake button
        this.noBtn.classList.add('shake');
        setTimeout(() => this.noBtn.classList.remove('shake'), 500);

        // Grow YES button (WITH CAP!)
        this.yesScale = Math.min(this.yesScale + 0.1, this.MAX_YES_SCALE);
        this.yesBtn.style.transform = `scale(${this.yesScale})`;

        // Calculate repulsion
        const btnRect = this.noBtn.getBoundingClientRect();
        const btnCenter = {
            x: btnRect.left + btnRect.width / 2,
            y: btnRect.top + btnRect.height / 2
        };

        const strength = 150 + (this.chaseCount * 20);
        const force = Physics.magneticRepulsion(btnCenter, this.mouse, strength, 200);

        // Add orbital motion
        const angle = Math.atan2(btnCenter.y - this.mouse.y, btnCenter.x - this.mouse.x);
        const orbitalForce = this.chaseCount % 2 === 0 ? 50 : -50;
        force.x += Math.cos(angle + Math.PI / 2) * orbitalForce;
        force.y += Math.sin(angle + Math.PI / 2) * orbitalForce;

        // Set target with boundaries
        const margin = 60;
        this.noBtnState.targetX = Physics.clamp(
            btnCenter.x + force.x * 3,
            margin,
            window.innerWidth - margin
        );
        this.noBtnState.targetY = Physics.clamp(
            btnCenter.y + force.y * 3,
            margin,
            window.innerHeight - margin
        );
    }

    updateNoButtonPosition() {
        const springX = Physics.spring(
            this.noBtnState.x,
            this.noBtnState.targetX,
            this.noBtnState.vx,
            { stiffness: 0.08, damping: 0.7 }
        );

        const springY = Physics.spring(
            this.noBtnState.y,
            this.noBtnState.targetY,
            this.noBtnState.vy,
            { stiffness: 0.08, damping: 0.7 }
        );

        this.noBtnState.x = springX.position;
        this.noBtnState.y = springY.position;
        this.noBtnState.vx = springX.velocity;
        this.noBtnState.vy = springY.velocity;

        const btnRect = this.noBtn.getBoundingClientRect();
        const left = this.noBtnState.x - btnRect.width / 2;
        const top = this.noBtnState.y - btnRect.height / 2;

        this.noBtn.style.left = `${left}px`;
        this.noBtn.style.top = `${top}px`;
    }

    showEmojiReaction() {
        const emoji = document.createElement('div');
        emoji.className = 'emoji-reaction';
        emoji.textContent = this.emojiReactions[Math.floor(Math.random() * this.emojiReactions.length)];

        const btnRect = this.noBtn.getBoundingClientRect();
        emoji.style.left = `${btnRect.left + btnRect.width / 2}px`;
        emoji.style.top = `${btnRect.top - 30}px`;

        this.emojiContainer.appendChild(emoji);
        setTimeout(() => emoji.remove(), 2000);
    }

    updateEyeTracking() {
        this.eyes.forEach(pupil => {
            const eye = pupil.parentElement;
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            const angle = Math.atan2(this.mouse.y - eyeCenterY, this.mouse.x - eyeCenterX);
            const distance = Math.min(
                Physics.distance(
                    { x: this.mouse.x, y: this.mouse.y },
                    { x: eyeCenterX, y: eyeCenterY }
                ),
                100
            ) / 100;

            const maxMove = 8;
            const moveX = Math.cos(angle) * distance * maxMove;
            const moveY = Math.sin(angle) * distance * maxMove;

            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    updateCardTilt() {
        const cardRect = this.questionCard.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const deltaX = (this.mouse.x - cardCenterX) / cardRect.width;
        const deltaY = (this.mouse.y - cardCenterY) / cardRect.height;

        const tiltX = deltaY * 5;
        const tiltY = deltaX * -5;

        this.questionCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    onYesHover() {
        const rect = this.yesBtn.getBoundingClientRect();
        this.canvasEffects.addParticleBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            8
        );
    }

    onYesClick() {
        this.questionCard.classList.add('hidden');
        this.successCard.classList.remove('hidden');
        this.canvasEffects.confetti();

        // Heart explosion
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight + 50;
                this.canvasEffects.addParticleBurst(x, y, 3);
            }, i * 50);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ValentineApp();
});
