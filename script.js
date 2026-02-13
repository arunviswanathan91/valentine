document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const questionContainer = document.getElementById('question-container');
    const successContainer = document.getElementById('success-container');
    const body = document.body;

    // Movement logic for "No" button
    // It should move when the mouse gets close
    noBtn.addEventListener('mouseover', moveButton);
    noBtn.addEventListener('touchstart', moveButton); // For mobile taps if they try

    function moveButton() {
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get button dimensions
        const btnRect = noBtn.getBoundingClientRect();
        const btnWidth = btnRect.width;
        const btnHeight = btnRect.height;
        
        // 100px padding from edges to prevent it getting stuck
        const padding = 100;

        // Calculate a new random position
        // Math.random() gives 0-1.
        // We multiply by available space (viewport - button size - padding)
        // We add padding/2 to center it within the safe zone
        let newX = Math.random() * (viewportWidth - btnWidth - padding) + padding / 2;
        let newY = Math.random() * (viewportHeight - btnHeight - padding) + padding / 2;

        // Apply new position using fixed positioning to break out of flex flow visual
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
        
        // Increase the pulse of the Yes button to draw attention
        yesBtn.style.animationDuration = '0.8s';
    }

    // Success logic
    yesBtn.addEventListener('click', () => {
        questionContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        createConfetti();
    });

    function createConfetti() {
        const colors = ['#e94560', '#a3e635', '#ffffff', '#ffd1d1'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '0'; // Behind text
            
            // Random animation duration and delay
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            confetti.style.animation = `fall ${duration}s linear ${delay}s infinite`;
            
            body.appendChild(confetti);
        }
        
        // Add keyframes for falling if not in CSS (doing it here for simplicity of one file edit)
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
});
