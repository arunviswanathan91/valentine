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

    // Initial setup for background hearts
    createFloatingHearts();

    // Movement logic for "No" button
    noBtn.addEventListener('mouseover', moveButton);
    noBtn.addEventListener('touchstart', moveButton);

    function moveButton() {
        // Change text
        const randomMsg = noMessages[Math.floor(Math.random() * noMessages.length)];
        noBtn.innerText = randomMsg;

        // Grow Yes button
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${yesScale})`;

        // Calculate movement
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const btnRect = noBtn.getBoundingClientRect();
        const btnWidth = btnRect.width;
        const btnHeight = btnRect.height;

        // Keep it strictly within bounds
        // use 90% of viewport to be safe
        const padding = 50;

        let newX = Math.random() * (viewportWidth - btnWidth - padding * 2) + padding;
        let newY = Math.random() * (viewportHeight - btnHeight - padding * 2) + padding;

        noBtn.style.position = 'fixed';
        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
        noBtn.style.zIndex = '1000'; // Always on top
    }

    // Success logic
    yesBtn.addEventListener('click', () => {
        questionContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        createConfetti();
        // Reset scale for layout
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
