/**
 * Physics utilities for smooth, natural motion
 * Includes easing functions and spring physics
 */

const Physics = {
    /**
     * Easing functions for smooth animations
     */
    easing: {
        // Smooth ease out with elastic bounce
        easeOutElastic(t) {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 :
                Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },

        // Quadratic ease out
        easeOutQuad(t) {
            return t * (2 - t);
        },

        // Cubic ease in-out
        easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        // Exponential ease out
        easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }
    },

    /**
     * Spring physics simulation
     * @param {number} current - Current position
     * @param {number} target - Target position
     * @param {number} velocity - Current velocity
     * @param {object} config - Spring configuration
     * @returns {object} New position and velocity
     */
    spring(current, target, velocity, config = {}) {
        const { stiffness = 0.1, damping = 0.8 } = config;
        const force = (target - current) * stiffness;
        velocity = (velocity + force) * damping;
        return {
            position: current + velocity,
            velocity
        };
    },

    /**
     * Magnetic repulsion force
     * Pushes object away from a point
     * @param {object} obj - Object position {x, y}
     * @param {object} repulsor - Repulsion point {x, y}
     * @param {number} strength - Repulsion strength
     * @param {number} radius - Effective radius
     * @returns {object} Force vector {x, y}
     */
    magneticRepulsion(obj, repulsor, strength = 100, radius = 150) {
        const dx = obj.x - repulsor.x;
        const dy = obj.y - repulsor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radius || distance === 0) {
            return { x: 0, y: 0 };
        }

        // Inverse square law for realistic repulsion
        const force = strength / (distance * distance);
        const angle = Math.atan2(dy, dx);

        return {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force
        };
    },

    /**
     * Calculate distance between two points
     */
    distance(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
};

export default Physics;
