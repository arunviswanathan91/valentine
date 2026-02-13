/**
 * Animation loop controller using requestAnimationFrame
 * Manages smooth 60fps animations
 */

class AnimationLoop {
    constructor() {
        this.callbacks = new Set();
        this.running = false;
        this.frameId = null;
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    /**
     * Stop the animation loop
     */
    stop() {
        this.running = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    /**
     * Main animation loop
     */
    loop() {
        if (!this.running) return;

        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Execute all registered callbacks
        this.callbacks.forEach(callback => {
            try {
                callback(this.deltaTime, currentTime);
            } catch (error) {
                console.error('Animation callback error:', error);
            }
        });

        this.frameId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Register a callback to be called each frame
     * @param {Function} callback - Function to call each frame (receives deltaTime, currentTime)
     * @returns {Function} Function to unregister the callback
     */
    register(callback) {
        this.callbacks.add(callback);

        // Return unregister function
        return () => this.unregister(callback);
    }

    /**
     * Unregister a callback
     */
    unregister(callback) {
        this.callbacks.delete(callback);
    }

    /**
     * Clear all callbacks
     */
    clear() {
        this.callbacks.clear();
    }
}

// Create singleton instance
const animationLoop = new AnimationLoop();

export default animationLoop;
