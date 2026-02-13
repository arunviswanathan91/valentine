document.addEventListener('DOMContentLoaded', () => {
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const questionContainer = document.getElementById('question-container');
    const successContainer = document.getElementById('success-container');
    const bgHearts = document.querySelector('.bg-hearts');
    const body = document.body;

    // Messages for the "No" button
    const noMessages = [
        "No?", "Are you sure?", "Really?", "Think again!",
        "Last chance!", "Don't do this!", "You breaking my heart!",
        "I'm gonna cry...", "Please?", "Pretty please?",
        "Have a heart!", "Don't be mean!", "But I love you!",
        "Alien sad...", "You can't catch me!", "Try again!",
        "Wrong answer!", "Nope!", "Nu-uh!", "Impossible!"
    ];

    let yesScale = 1;
    let mouseX = 0;
    let mouseY = 0;
    let noBtnX = 0;
    let noBtnY = 0;
    let messageIndex = 0;

    // Initial setup for background hearts
    createFloatingHearts();

    // Set initial position for No button (fixed from start)
    function initializeNoButton() {
        noBtn.style.position = 'fixed';
        const rect = noBtn.getBoundingClientRect();
        noBtnX = rect.left;
        noBtnY = rect.top;
        noBtn.style.left = `${noBtnX}px`;
        noBtn.style.top = `${noBtnY}px`;
    }

    initializeNoButton();

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        checkProximityAndMove();
    });

    // Also handle touch for mobile
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        checkProximityAndMove();
    });

    function checkProximityAndMove() {
        const rect = noBtn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        // Calculate distance from mouse to button center
        const distance = Math.sqrt(
            Math.pow(mouseX - btnCenterX, 2) +
            Math.pow(mouseY - btnCenterY, 2)
        );

        // If mouse is within 150px, move the button away
        if (distance < 150) {
            moveButtonAway();
        }
    }

    function moveButtonAway() {
        // Change the message
        messageIndex = (messageIndex + 1) % noMessages.length;
        noBtn.innerText = noMessages[messageIndex];

        // Grow Yes button
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${yesScale})`;

        // Get current button dimensions (after text change)
        const rect = noBtn.getBoundingClientRect();
        const btnWidth = rect.width;
        const btnHeight = rect.height;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate direction away from mouse
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(btnCenterY - mouseY, btnCenterX - mouseX);

        // Move 200px away from mouse
        const moveDistance = 200;
        let newCenterX = btnCenterX + Math.cos(angle) * moveDistance;
        let newCenterY = btnCenterY + Math.sin(angle) * moveDistance;

        // Convert from center coordinates to top-left coordinates
        let newX = newCenterX - btnWidth / 2;
        let newY = newCenterY - btnHeight / 2;

        // Add some randomness to make it less predictable
        newX += (Math.random() - 0.5) * 100;
        newY += (Math.random() - 0.5) * 100;

        // STRICT boundary enforcement
        const margin = 10;
        const minX = margin;
        const minY = margin;
        const maxX = viewportWidth - btnWidth - margin;
        const maxY = viewportHeight - btnHeight - margin;

        // Clamp to bounds
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));

        // Apply the new position
        noBtnX = newX;
        noBtnY = newY;
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
        noBtn.style.transition = 'left 0.3s ease, top 0.3s ease';
    }

    // Success logic
    yesBtn.addEventListener('click', () => {
        questionContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        createConfetti();
        yesBtn.style.transform = 'scale(1)';
    });

    function createFloatingHearts() {
        const heartCount = 15;
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('floating-heart');
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.fontSize = Math.random() * 20 + 10 + 'px';
            heart.style.animationDuration = Math.random() * 10 + 5 + 's';
            heart.style.animationDelay = Math.random() * 5 + 's';
            bgHearts.appendChild(heart);
        }
    }

    function createConfetti() {
        const colors = ['#e94560', '#a3e635', '#ffffff', '#ffd1d1', '#8b5cf6'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '2000';

            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 0.5;

            confetti.style.animation = `fall ${duration}s linear ${delay}s forwards`;

            body.appendChild(confetti);
        }

        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(styleSheet);
    }
});
