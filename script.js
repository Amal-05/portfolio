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
                        case 'hello bot':
                            printLine("Hello there! I'm watching you... 👀");
                            printLine("Just kidding! (Maybe.)");
                            break;
                        case 'story':
                            printLine("Starting Story Mode...");
                            if(window.botSpeak) window.botSpeak("Started with C -> moved to Python -> built AI projects -> now building full systems 🚀", 6000, true);
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
        const botHead = document.querySelector('.bot-head');
        const botBubble = document.getElementById('bot-bubble');
        const botBubbleContent = document.getElementById('bot-bubble-content');
        
        // --- Core Speaking System ---
        let isBotSpeaking = false;
        let botSpeakTimeout = null;

        const botSpeak = window.botSpeak = function(message, duration = 4000, force = false) {
            if (!botBubble || !botBubbleContent) return;
            if (isBotSpeaking && !force) return;

            isBotSpeaking = true;
            botBubbleContent.innerHTML = message;
            botBubble.classList.add('show');

            clearTimeout(botSpeakTimeout);
            botSpeakTimeout = setTimeout(() => {
                botBubble.classList.remove('show');
                setTimeout(() => { isBotSpeaking = false; }, 300);
            }, duration);
        };

        const hideBotSpeak = window.hideBotSpeak = function() {
            clearTimeout(botSpeakTimeout);
            if (botBubble) botBubble.classList.remove('show');
            isBotSpeaking = false;
        };

        // --- Bot Toggle Logic ---
        const botToggleBtn = document.getElementById('bot-toggle-btn');
        let isBotActive = true;

        if (botToggleBtn) {
            botToggleBtn.addEventListener('click', () => {
                isBotActive = !isBotActive;
                if (isBotActive) {
                    botContainer.classList.remove('hidden');
                    botToggleBtn.classList.remove('inactive');
                    botToggleBtn.innerHTML = '🤖 Hide Bot';
                    setTimeout(() => botSpeak('I\'m back! 👋', 3000, true), 400); // Wait for transition
                } else {
                    botContainer.classList.add('hidden');
                    botToggleBtn.classList.add('inactive');
                    botToggleBtn.innerHTML = '🤖 Show Bot';
                    hideBotSpeak();
                }
            });
        }

        // --- Random Events (Waving & Funny Stuff) ---
        setInterval(() => {
            if (!isBotSpeaking && Math.random() > 0.6) {
                const jokes = [
                    "Hello there! 👋",
                    "Do robots dream of electric sheep? 🐑",
                    "I'm fueled by coffee and bugs 🐛",
                    "Why do programmers prefer dark mode? Because light attracts bugs. 😂",
                    "Still here? I'm watching you... 👀",
                    "404: Sleep not found ☕"
                ];
                const msg = jokes[Math.floor(Math.random() * jokes.length)];
                botSpeak(msg, 5000);
                
                if (msg.includes("Hello")) {
                    const armRight = document.querySelector('.arm-right');
                    if (armRight) {
                        armRight.classList.add('waving');
                        setTimeout(() => armRight.classList.remove('waving'), 2000);
                    }
                }
            }
        }, 20000);

        // --- Mouse Tracking ---
        document.addEventListener('mousemove', (e) => {
            if (!botContainer) return;
            
            const botRect = botContainer.getBoundingClientRect();
            const botX = botRect.left + botRect.width / 2;
            const botY = botRect.top + botRect.height / 2;

            const dx = e.clientX - botX;
            const dy = e.clientY - botY;
            const angle = Math.atan2(dy, dx);
            
            const dist = Math.hypot(dx, dy);
            const factor = Math.min(dist / 300, 1);
            
            const pupilDist = factor * 8;
            const pupilX = Math.cos(angle) * pupilDist;
            const pupilY = Math.sin(angle) * pupilDist;

            botPupils.forEach(pupil => {
                pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
            });
        });

        // --- Click Interactions & Easter Egg ---
        let clickCount = 0;
        let clickTimeout = null;

        botContainer.addEventListener('mousedown', () => { botContainer.classList.add('surprised'); });
        botContainer.addEventListener('mouseup', () => { botContainer.classList.remove('surprised'); });
        botContainer.addEventListener('mouseleave', () => { botContainer.classList.remove('surprised'); });
        botContainer.addEventListener('touchstart', (e) => {
            botContainer.classList.add('surprised');
        }, {passive: true});
        botContainer.addEventListener('touchend', () => { botContainer.classList.remove('surprised'); });

        botContainer.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => { clickCount = 0; }, 2000);

            if (clickCount === 5) {
                botSpeak('Initiating Hacker Mode 2.0... just kidding 😂', 4000, true);
                botContainer.style.transition = 'filter 0.5s';
                botContainer.style.filter = 'hue-rotate(90deg) drop-shadow(0 0 20px #06b6d4)';
                setTimeout(() => botContainer.style.filter = 'none', 4000);
                clickCount = 0;
            }
        });

        // --- Smart Suggestions (Idle & Scroll) ---
        let idleTimer = null;
        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                botSpeak('You look bored... try my games 😏<br><button onclick="window.open(\'game_pro/index.html\', \'_blank\')">Play Games</button>', 6000);
            }, 5000);
        };
        
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('scroll', resetIdleTimer);
        document.addEventListener('click', resetIdleTimer);
        resetIdleTimer();

        let lastScrollY = window.scrollY;
        let lastScrollTime = Date.now();
        document.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const currentTime = Date.now();
            const timeDiff = currentTime - lastScrollTime;
            
            if (timeDiff > 100) {
                const speed = Math.abs(currentScrollY - lastScrollY) / timeDiff;
                if (speed > 5) {
                    botSpeak('Looking for something specific?');
                }
                lastScrollY = currentScrollY;
                lastScrollTime = currentTime;
            }
        });

        // --- Section Observers ---
        const observerOptions = { threshold: 0.5 };
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.id === 'contact') {
                        botSpeak('Want to hire me?<br><button onclick="document.querySelector(\'.contact-form input\').focus()">Contact Me</button>', 6000);
                    }
                }
            });
        }, observerOptions);

        const projectsSection = document.getElementById('projects');
        const contactSection = document.getElementById('contact');
        if (projectsSection) sectionObserver.observe(projectsSection);
        if (contactSection) sectionObserver.observe(contactSection);

        // --- Skill Hover Reactions ---
        const skillCardsBot = document.querySelectorAll('.skill-card');
        skillCardsBot.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const title = card.querySelector('.skill-name').innerText;
                if (title.includes('C & Java')) {
                    botSpeak('Ah, the classics! Where it all began ☕', 4000, true);
                } else if (title.includes('Python')) {
                    botSpeak('Python? My favorite language! 🐍', 4000, true);
                } else if (title.includes('Arduino')) {
                    botSpeak('I have some Arduino parts in me too! ⚙️', 4000, true);
                } else if (title.includes('OpenCV')) {
                    botSpeak('Computer Vision... I see everything! 👁️', 4000, true);
                }
            });
            card.addEventListener('mouseleave', () => {
                hideBotSpeak();
            });
        });

        // --- Project Hover Reactions ---
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const title = card.querySelector('.project-title').innerText;
                if (title.includes('Mini Games')) {
                    botSpeak('Built this entire games hub from scratch! 🎮', 4000, true);
                } else if (title.includes('Attendance')) {
                    botSpeak('This one uses OpenCV to detect faces 👀', 4000, true);
                } else if (title.includes('Water Overflow')) {
                    botSpeak('Real hardware system using Arduino 💧', 4000, true);
                } else if (title.includes('Chatbot')) {
                    botSpeak('A helpful digital assistant for students 🤖', 4000, true);
                } else if (title.includes('Virtual Mouse')) {
                    botSpeak('Control your mouse with just hand gestures! ✋', 4000, true);
                }
            });
            card.addEventListener('mouseleave', () => {
                hideBotSpeak();
            });
        });
    }
});
