/**
 * Firefly Particle Effect
 * Creates a subtle, smooth background animation of glowing dots.
 */

(function () {
    const CONFIG = {
        count: 20,              // Reduced intensity
        minSize: 2,             // Smaller particles
        maxSize: 4,             // Smaller particles
        minDuration: 8000,      // Faster (was 10000)
        maxDuration: 18000,     // Faster (was 20000)
        color: 'rgba(0, 168, 255, 0.9)' // Electric Blue
    };

    // Inject CSS
    function injectStyles() {
        const css = `
      #firefly-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 50; /* Ensure visibility on top of content */
        overflow: hidden;
        display: none; /* Hidden in Light Mode */
      }

      /* Only show in Dark Mode */
      html.dark #firefly-container {
        display: block;
      }

      .firefly {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, ${CONFIG.color} 0%, transparent 70%);
        opacity: 0;
        will-change: transform, opacity;
        box-shadow: 0 0 4px ${CONFIG.color}; /* Reduced glow */
      }
    `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Create Container
    function createContainer() {
        if (document.getElementById('firefly-container')) return document.getElementById('firefly-container');

        const container = document.createElement('div');
        container.id = 'firefly-container';
        // Append to end of body to ensure it sits on top of other content
        document.body.appendChild(container);
        return container;
    }

    function createFirefly(container) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');

        // Random Start Position
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        firefly.style.left = `${startX}%`;
        firefly.style.top = `${startY}%`;

        // Random Size
        const size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
        firefly.style.width = `${size}px`;
        firefly.style.height = `${size}px`;

        // Random Destination (relative movement)
        const moveX = (Math.random() - 0.5) * 500; // Wider movement
        const moveY = (Math.random() - 0.5) * 500;

        // Animation Duration
        const duration = CONFIG.minDuration + Math.random() * (CONFIG.maxDuration - CONFIG.minDuration);

        // Using Web Animations API
        const animation = firefly.animate([
            { transform: 'translate(0, 0) scale(0)', opacity: 0 },
            { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.2 }, // Fully visible peak
            { transform: `translate(${moveX}px, ${moveY}px) scale(0)`, opacity: 0 } // Move & Fade out
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            fill: 'forwards'
        });

        container.appendChild(firefly);

        animation.onfinish = () => {
            firefly.remove();
            if (!document.hidden) createFirefly(container);
        };
    }

    function init() {
        console.log('✨ initParticles (Intense) started');
        injectStyles();
        const container = createContainer();

        // Initial Spawn
        for (let i = 0; i < CONFIG.count; i++) {
            setTimeout(() => {
                createFirefly(container);
            }, Math.random() * 2000); // Faster spawn rate
        }

        // Visibility Handler
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                while (container.children.length < CONFIG.count) {
                    createFirefly(container);
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
