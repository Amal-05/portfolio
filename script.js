document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       Navigation Scroll Effect
       ========================================= */
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* =========================================
       Mobile Menu Toggle
       ========================================= */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinksContainer.classList.remove('active');
            });
        });
    }

    /* =========================================
       Advanced IntersectionObserver Reveal Animation
       ========================================= */
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Remove to allow re-animating when scrolling up and down (Heavy feel)
                entry.target.classList.remove('active'); 
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* =========================================
       Typing Effect
       ========================================= */
    const typingText = document.querySelector('.typing-text');
    const words = ['Computer Science Student', 'Developer', 'Problem Solver', 'Tech Enthusiast'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 150;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(type, typeSpeed);
    };

    setTimeout(type, 1000); // Start delay

    /* =========================================
       Skill Card Glow Map (Mouse Tracking)
       ========================================= */
    const skillCards = document.querySelectorAll('.skill-card');

    document.getElementById('skills').addEventListener('mousemove', e => {
        skillCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* =========================================
       Active Nav Link Highlighting
       ========================================= */
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /* =========================================
       Terminal / Hacker Mode Logic
       ========================================= */
    const terminalToggleBtn = document.querySelector('.terminal-toggle-btn');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalCloseDot = document.getElementById('terminal-close-dot');
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');

    if (terminalToggleBtn && terminalOverlay) {
        const openTerminal = () => {
            terminalOverlay.classList.add('active');
            setTimeout(() => terminalInput.focus(), 100);
        };

        const closeTerminal = () => {
            terminalOverlay.classList.remove('active');
        };

        terminalToggleBtn.addEventListener('click', openTerminal);
        terminalCloseDot.addEventListener('click', closeTerminal);
        
        // Close on clicking outside the window
        terminalOverlay.addEventListener('click', (e) => {
            if (e.target === terminalOverlay) {
                closeTerminal();
            }
        });

        const printLine = (text, isCommand = false, isError = false) => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            if (isCommand) {
                line.innerHTML = `<span class="terminal-prompt">guest@amal-portfolio:~$</span> ${text}`;
            } else if (isError) {
                line.innerHTML = `<span class="term-error">${text}</span>`;
            } else {
                line.innerHTML = text;
            }
            terminalBody.appendChild(line);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim().toLowerCase();
                if (cmd !== '') {
                    printLine(cmd, true);
                    terminalInput.value = '';
                    
                    switch(cmd) {
                        case 'help':
                            printLine("Available commands:");
                            printLine("<span class='term-highlight'>about</span>    - Learn more about Amal");
                            printLine("<span class='term-highlight'>projects</span> - View featured projects");
                            printLine("<span class='term-highlight'>games</span>    - Launch the Mini Games Hub");
                            printLine("<span class='term-highlight'>clear</span>    - Clear terminal output");
                            printLine("<span class='term-highlight'>exit</span>     - Close the terminal");
                            break;
                        case 'about':
                            printLine("Navigating to About section...");
                            setTimeout(() => {
                                closeTerminal();
                                document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
                            }, 800);
                            break;
                        case 'projects':
                            printLine("Navigating to Projects section...");
                            setTimeout(() => {
                                closeTerminal();
                                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
                            }, 800);
                            break;
                        case 'games':
                            printLine("Initializing Mini Games Hub...");
                            setTimeout(() => {
                                window.open('game_pro/index.html', '_blank');
                            }, 500);
                            break;
                        case 'clear':
                            terminalBody.innerHTML = '';
                            break;
                        case 'exit':
                            printLine("Terminating session...");
                            setTimeout(closeTerminal, 500);
                            break;
                        default:
                            printLine(`Command not found: ${cmd}`, false, true);
                            printLine("Type 'help' for a list of commands.");
                    }
                }
            }
        });
        
        // Keep focus on input if clicking inside terminal
        document.querySelector('.terminal-window').addEventListener('click', () => {
            terminalInput.focus();
        });
    }

    /* =========================================
       Interactive Robot Logic
       ========================================= */
    const botContainer = document.getElementById('interactive-bot');
    const eyeWrappers = document.querySelectorAll('.bot-eye-wrapper');

    if (botContainer && eyeWrappers.length > 0) {
        const botPupils = document.querySelectorAll('.bot-pupil');

        document.addEventListener('mousemove', (e) => {
            if (!botContainer) return;
            
            // Get bot center coordinates safely
            const botRect = botContainer.getBoundingClientRect();
            const botX = botRect.left + botRect.width / 2;
            const botY = botRect.top + botRect.height / 2;

            // Calculate angle and distance
            const dx = e.clientX - botX;
            const dy = e.clientY - botY;
            const angle = Math.atan2(dy, dx);
            
            // Calculate a factor that reaches 1 when mouse is 300px away
            const dist = Math.hypot(dx, dy);
            const factor = Math.min(dist / 300, 1);
            
            // Move the pupil slightly more inside the eye (max 8px for stronger tracking)
            const pupilDist = factor * 8;
            const pupilX = Math.cos(angle) * pupilDist;
            const pupilY = Math.sin(angle) * pupilDist;

            // KEEP ONLY pupil movement
            botPupils.forEach(pupil => {
                pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
            });
        });

        // Click interactions
        botContainer.addEventListener('mousedown', () => {
            botContainer.classList.add('surprised');
        });

        botContainer.addEventListener('mouseup', () => {
            botContainer.classList.remove('surprised');
        });

        botContainer.addEventListener('mouseleave', () => {
            botContainer.classList.remove('surprised');
        });
        
        // Touch interactions for mobile
        botContainer.addEventListener('touchstart', (e) => {
            e.preventDefault(); // prevent default click to handle manually
            botContainer.classList.add('surprised');
        });
        
        botContainer.addEventListener('touchend', () => {
            botContainer.classList.remove('surprised');
        });
    }
});
