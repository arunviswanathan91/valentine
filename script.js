/**
 * Main Valentine App - Ultra-Cute Interactive Experience
 * Physics-based button interactions with delightful micro-animations
 */

import animationLoop from './animations.js';
import Physics from './physics.js';
import CanvasEffects from './canvas.js';

class ValentineApp {
    constructor() {
        this.noBtn = document.getElementById('no-btn');
        this.yesBtn = document.getElementById('yes-btn');
        this.questionCard = document.getElementById('question-card');
        this.successCard = document.getElementById('success-card');
        this.eyes = document.querySelectorAll('.eye-pupil');
        this.emojiContainer = document.getElementById('emoji-reactions');

        // Physics state for NO button
        this.noBtnState = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            targetX: 0,
            targetY: 0
        };

        // Mouse tracking
        this.mouse = { x: 0, y: 0 };

        // Button chase count (for increasing difficulty)
        this.chaseCount = 0;

        // Emoji reactions for NO button
        this.emojiReactions = [
            "nope! 😜",
            "hehe 😆",
            "not today! 🙈",
            "try again! 😂",
            "almost! 😝",
            "so close! 🤭",
            "nice try! 😁",
            "nuh-uh! 🙅",
            "catch me! 🏃"
        ];

        this.init();
    }

    init() {
        // Initialize canvas effects
        this.canvasEffects = new CanvasEffects('background-canvas');

        // Set initial NO button position
        this.initializeNoButton();

        // Track mouse globally
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });

        // YES button events
        this.yesBtn.addEventListener('click', () => this.onYesClick());
        this.yesBtn.addEventListener('mouseenter', () => this.onYesHover());

        // NO button touch events (mobile)
        this.noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.moveNoButtonAway();
        });

        // Start animation loop
        animationLoop.start();
        animationLoop.register((dt) => this.update(dt));

        // Animate card entrance
        this.animateEntrance();
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

    /**
     * Main update loop - called every frame
     */
    update(deltaTime) {
        // Check proximity to NO button
        const btnRect = this.noBtn.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        const distance = Physics.distance(
            { x: this.mouse.x, y: this.mouse.y },
            { x: btnCenterX, y: btnCenterY }
        );

        // Dynamic detection radius (gets larger after multiple chases)
        const detectionRadius = 120 + (this.chaseCount * 10);

        if (distance < detectionRadius) {
            this.moveNoButtonAway();
        }

        // Smooth physics-based movement for NO button
        this.updateNoButtonPosition(deltaTime);
    }

    /**
     * Move NO button away with smooth physics
     */
    moveNoButtonAway() {
        this.chaseCount++;

        // Show emoji reaction
        this.showEmojiReaction();

        // Shake the button in panic
        this.noBtn.classList.add('shake');
        setTimeout(() => this.noBtn.classList.remove('shake'), 500);

        // Grow YES button
        const currentScale = parseFloat(this.yesBtn.style.getPropertyValue('--scale') || 1);
        this.yesBtn.style.setProperty('--scale', currentScale + 0.1);

        // Calculate repulsion force
        const btnRect = this.noBtn.getBoundingClientRect();
        const btnCenter = {
            x: btnRect.left + btnRect.width / 2,
            y: btnRect.top + btnRect.height / 2
        };

        // Use magnetic repulsion with increased strength based on chase count
        const strength = 150 + (this.chaseCount * 20);
        const force = Physics.magneticRepulsion(
            btnCenter,
            this.mouse,
            strength,
            200
        );

        // Add some orbital motion for unpredictability
        const angle = Math.atan2(btnCenter.y - this.mouse.y, btnCenter.x - this.mouse.x);
        const orbitalForce = this.chaseCount % 2 === 0 ? 50 : -50;
        force.x += Math.cos(angle + Math.PI / 2) * orbitalForce;
        force.y += Math.sin(angle + Math.PI / 2) * orbitalForce;

        // Set target position (with boundary limits)
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

    /**
     * Update NO button position with spring physics
     */
    updateNoButtonPosition(deltaTime) {
        // Spring physics for smooth movement
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

        // Apply position to button
        const btnRect = this.noBtn.getBoundingClientRect();
        const left = this.noBtnState.x - btnRect.width / 2;
        const top = this.noBtnState.y - btnRect.height / 2;

        this.noBtn.style.left = `${left}px`;
        this.noBtn.style.top = `${top}px`;
    }

    /**
     * Show cute emoji reaction near NO button
     */
    showEmojiReaction() {
        const emoji = document.createElement('div');
        emoji.className = 'emoji-reaction';
        emoji.textContent = this.emojiReactions[Math.floor(Math.random() * this.emojiReactions.length)];

        const btnRect = this.noBtn.getBoundingClientRect();
        emoji.style.left = `${btnRect.left + btnRect.width / 2}px`;
        emoji.style.top = `${btnRect.top - 30}px`;

        this.emojiContainer.appendChild(emoji);

        // Remove after animation
        setTimeout(() => emoji.remove(), 2000);
    }

    /**
     * Update cartoon eyes to follow mouse
     */
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

    /**
     * Subtle card tilt following mouse
     */
    updateCardTilt() {
        const cardRect = this.questionCard.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const deltaX = (this.mouse.x - cardCenterX) / cardRect.width;
        const deltaY = (this.mouse.y - cardCenterY) / cardRect.height;

        const tiltX = deltaY * 5; // Max 5deg tilt
        const tiltY = deltaX * -5;

        this.questionCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    /**
     * YES button hover effect
     */
    onYesHover() {
        // Add sparkle particles at button position
        const rect = this.yesBtn.getBoundingClientRect();
        this.canvasEffects.addParticleBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            8
        );
    }

    /**
     * YES button click - celebration!
     */
    onYesClick() {
        // Hide question card
        this.questionCard.classList.add('hidden');

        // Show success card
        this.successCard.classList.remove('hidden');

        // Trigger confetti
        this.canvasEffects.confetti();

        // Create heart explosion
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight + 50;
                this.canvasEffects.addParticleBurst(x, y, 3);
            }, i * 50);
        }
    }

    /**
     * Animate elements on page load
     */
    animateEntrance() {
        // Stagger animation for elements
        setTimeout(() => this.questionCard.classList.add('visible'), 100);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ValentineApp();
});
