// Navigation scroll effect with ambient effect for complete website
const navbar = document.querySelector('.navbar');
const fullscreenSection = document.querySelector('.fullscreen-video-section');
const slideshowSection = document.querySelector('.slideshow-section');
const terminalSection = document.querySelector('.terminal-section');
const footerSection = document.querySelector('.footer');
let lastScroll = 0;

function updateNavbarStyle() {
    const currentScroll = window.pageYOffset;
    const navbarHeight = 80;

    const videoTop    = fullscreenSection ? fullscreenSection.offsetTop : 0;
    const videoBottom = fullscreenSection ? videoTop + fullscreenSection.offsetHeight : 0;

    const slideshowTop    = slideshowSection ? slideshowSection.offsetTop : 0;
    const slideshowBottom = slideshowSection ? slideshowTop + slideshowSection.offsetHeight : 0;

    const terminalTop    = terminalSection ? terminalSection.offsetTop : 0;
    const terminalBottom = terminalSection ? terminalTop + terminalSection.offsetHeight : 0;

    const footerTop = footerSection ? footerSection.offsetTop : 0;

    navbar.classList.remove('over-video', 'over-slideshow', 'over-content', 'over-terminal', 'over-footer', 'scrolled');

    if (currentScroll + navbarHeight < videoBottom - 50) {
        navbar.classList.add('over-video');
    } else if (currentScroll + navbarHeight < slideshowBottom - 50) {
        navbar.classList.add('over-slideshow');
    } else if (currentScroll + navbarHeight >= terminalTop && currentScroll + navbarHeight < terminalBottom) {
        navbar.classList.add('over-terminal');
        navbar.classList.add('scrolled');
    } else if (currentScroll + navbarHeight >= footerTop) {
        navbar.classList.add('over-footer');
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.add('over-content');
        if (currentScroll > 100) navbar.classList.add('scrolled');
    }
}

window.addEventListener('scroll', () => {
    updateNavbarStyle();
    lastScroll = window.pageYOffset;
});

// Initial check
updateNavbarStyle();

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Vollbild Video reactive scroll effect
const fullscreenVideo = document.querySelector('.fullscreen-video');

function handleFullscreenVideoScroll() {
    if (!fullscreenVideo || !fullscreenSection) return;
    
    const scrollPosition = window.pageYOffset;
    const sectionHeight = fullscreenSection.offsetHeight;
    const scrollProgress = Math.min(scrollPosition / sectionHeight, 1);
    
    // Parallax effect - video moves slower than scroll
    const parallaxOffset = scrollProgress * 100;
    fullscreenVideo.style.transform = `translateY(${parallaxOffset * 0.5}px) scale(${1.1 - scrollProgress * 0.1})`;
    
    // Add reactive class when scrolling
    if (scrollPosition > 50) {
        fullscreenVideo.classList.add('reactive');
    } else {
        fullscreenVideo.classList.remove('reactive');
    }
    
    // Dim to black as user scrolls (instead of fading out)
    const dimOpacity = Math.min(scrollProgress * 1.8, 1);
    fullscreenSection.style.setProperty('--scroll-dim', dimOpacity);
}

// Automatische Slideshow (5 Bilder, keine Buttons)
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const defaultInterval = 3500; // 3.5 Sekunden pro Slide
const slideDurations = [3000]; // Slide 0: 3 Sekunden

function getSlideDuration(index) {
    return slideDurations[index] ?? defaultInterval;
}

function resetSlideshow() {
    slides.forEach(s => s.classList.remove('active'));
    currentSlide = 0;
    slides[0].classList.add('active');
}

function initSlideshow() {
    if (slides.length === 0) return;

    slides[0].classList.add('active');

    let activeTimer = null;
    let slideshowActive = false;

    function startSlideshowTimer() {
        if (slideshowActive) return;
        slideshowActive = true;

        function nextSlide() {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % totalSlides;
            slides[currentSlide].classList.add('active');
            activeTimer = setTimeout(nextSlide, getSlideDuration(currentSlide));
        }

        activeTimer = setTimeout(nextSlide, getSlideDuration(0));
    }

    function stopSlideshowTimer() {
        if (activeTimer) clearTimeout(activeTimer);
        activeTimer = null;
        slideshowActive = false;
    }

    const quoteSection = document.querySelector('.about-quote');
    if (quoteSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const quoteBottom = quoteSection.getBoundingClientRect().bottom;
                if (!entry.isIntersecting && quoteBottom < 0) {
                    // Quote überscrollt → Slideshow starten
                    startSlideshowTimer();
                } else if (entry.isIntersecting || quoteBottom >= 0) {
                    // Zurück nach oben gescrollt → Slideshow stoppen & reset
                    stopSlideshowTimer();
                    resetSlideshow();
                }
            });
        }, { threshold: 0 });
        observer.observe(quoteSection);
    } else {
        startSlideshowTimer();
    }
}

// Intersection Observer für Feature Items - Minimal
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe feature items
document.querySelectorAll('.feature-item').forEach((el) => {
    observer.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll event listeners
let ticking = false;

function onScroll() {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            handleFullscreenVideoScroll();
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

// Initialize on load
window.addEventListener('load', () => {
    handleFullscreenVideoScroll();
    initSlideshow();
    initStars();
    initTerminal();

    if (fullscreenVideo) {
        fullscreenVideo.currentTime = 0;
    }
});

// Terminal Animation
function initTerminal() {
    const terminalWindow = document.getElementById('terminalWindow');
    const terminalBody = document.getElementById('terminalBody');
    if (!terminalWindow || !terminalBody) return;

    const sequence = [
        { type: 'dim',     text: '# d-it-solution / core / ai_optimizer.py', pause: 200 },
        { type: 'output',  text: '' },
        { type: 'info',    text: 'import asyncio', delay: 18 },
        { type: 'info',    text: 'import numpy as np', delay: 18 },
        { type: 'info',    text: 'from d_it.infra import ClusterClient, MetricsAPI', delay: 18 },
        { type: 'output',  text: '' },
        { type: 'warning', text: 'class InfraOptimizer:', delay: 22, pause: 120 },
        { type: 'output',  text: '    def __init__(self, threshold=0.82):', delay: 18 },
        { type: 'output',  text: '        self.threshold = threshold', delay: 18 },
        { type: 'output',  text: '        self.client   = ClusterClient()', delay: 18 },
        { type: 'output',  text: '        self.metrics  = MetricsAPI()', delay: 18, pause: 150 },
        { type: 'output',  text: '' },
        { type: 'output',  text: '    async def analyze(self, nodes: list) -> dict:', delay: 18, pause: 80 },
        { type: 'output',  text: '        data = await self.metrics.fetch_all(nodes)', delay: 18 },
        { type: 'output',  text: '        load = np.array([n.cpu for n in data])', delay: 18 },
        { type: 'output',  text: '' },
        { type: 'output',  text: '        overloaded = [', delay: 18 },
        { type: 'output',  text: '            n for n, l in zip(nodes, load)', delay: 18 },
        { type: 'output',  text: '            if l > self.threshold', delay: 18 },
        { type: 'output',  text: '        ]', delay: 18, pause: 120 },
        { type: 'output',  text: '' },
        { type: 'output',  text: '        await asyncio.gather(*[', delay: 18 },
        { type: 'output',  text: '            self.client.scale(n, factor=1.5)', delay: 18 },
        { type: 'output',  text: '            for n in overloaded', delay: 18 },
        { type: 'output',  text: '        ])', delay: 18, pause: 150 },
        { type: 'output',  text: '' },
        { type: 'output',  text: '        return { "scaled": len(overloaded), "total": len(nodes) }', delay: 18, pause: 200 },
        { type: 'output',  text: '' },
        { type: 'prompt',  text: 'python -m pytest tests/ -q', delay: 22, pause: 300 },
        { type: 'dim',     text: '..............................', delay: 6, pause: 400 },
        { type: 'success', text: '30 passed in 1.42s', pause: 800 },
        { type: 'output',  text: '' },
        { type: 'prompt',  text: 'git commit -m "feat: adaptive scaling threshold"', delay: 22, pause: 200 },
        { type: 'success', text: '[main d94e017] feat: adaptive scaling threshold', pause: 600 },
    ];

    const colorMap = {
        prompt:  ['<span class="t-prompt">❯ </span><span class="t-cmd">', '</span>'],
        output:  ['<span class="t-cmd">', '</span>'],
        success: ['<span class="t-success">', '</span>'],
        warning: ['<span class="t-warning">', '</span>'],
        error:   ['<span class="t-error">', '</span>'],
        info:    ['<span class="t-info">', '</span>'],
        dim:     ['<span class="t-dim">', '</span>'],
    };

    let started = false;
    let isVisible = false;
    let pendingResume = null;

    // Track visibility for pause/resume
    const visibilityObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && pendingResume) {
            const fn = pendingResume;
            pendingResume = null;
            fn();
        }
    }, { threshold: 0.2 });
    visibilityObserver.observe(terminalWindow);

    function waitIfHidden(fn) {
        if (isVisible) {
            fn();
        } else {
            pendingResume = fn;
        }
    }

    function runTerminal() {
        terminalBody.innerHTML = '';
        let i = 0;

        function runNext() {
            if (i >= sequence.length) {
                setTimeout(runTerminal, 1500);
                return;
            }

            const step = sequence[i++];
            const [open, close] = colorMap[step.type] || ['', ''];
            const pauseAfter = step.pause || 0;

            const line = document.createElement('div');
            terminalBody.appendChild(line);

            const fullText = step.text;
            const charDelay = step.delay || 8;

            if (!fullText) {
                waitIfHidden(() => setTimeout(runNext, 60 + pauseAfter));
            } else {
                let charIndex = 0;
                line.innerHTML = '<span class="t-cursor">▋</span>';

                function typeChar() {
                    if (charIndex < fullText.length) {
                        line.innerHTML = open + fullText.slice(0, ++charIndex) + close + '<span class="t-cursor">▋</span>';
                        terminalBody.scrollTop = terminalBody.scrollHeight;
                        waitIfHidden(() => setTimeout(typeChar, charDelay + Math.random() * 15));
                    } else {
                        line.innerHTML = open + fullText + close;
                        terminalBody.scrollTop = terminalBody.scrollHeight;
                        const afterDelay = step.type === 'prompt' ? 150 : 40;
                        waitIfHidden(() => setTimeout(runNext, afterDelay + pauseAfter));
                    }
                }
                typeChar();
            }
        }

        runNext();
    }

    // Start when terminal scrolls into view first time
    const startObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !started) {
            started = true;
            setTimeout(runTerminal, 400);
            startObserver.disconnect();
        }
    }, { threshold: 0.3 });
    startObserver.observe(terminalWindow);
}

// Stars Canvas
function initStars() {
    const canvas = document.getElementById('starsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawStars();
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const count = 180;

        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            // Stars concentrated in lower 60% of the section
            const y = canvas.height - Math.pow(Math.random(), 1.8) * canvas.height * 0.85;

            const size = Math.random() * 1.4 + 0.3;

            // Fade based on vertical position — brighter at bottom, invisible at top
            const verticalFade = y / canvas.height;
            const opacity = verticalFade * verticalFade * (Math.random() * 0.5 + 0.15);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        }
    }

    resize();
    window.addEventListener('resize', resize);
}

// Add scroll-based opacity to video content
function handleVideoContentFade() {
    const videoContent = document.querySelector('.video-content');
    if (!videoContent || !fullscreenSection) return;
    
    const scrollPosition = window.pageYOffset;
    const sectionHeight = fullscreenSection.offsetHeight;
    const fadeStart = sectionHeight * 0.3;
    
    if (scrollPosition < fadeStart) {
        const opacity = 1 - (scrollPosition / fadeStart);
        videoContent.style.opacity = Math.max(0, opacity);
    } else {
        videoContent.style.opacity = 0;
    }
}

window.addEventListener('scroll', handleVideoContentFade, { passive: true });

// Modal Pop-ups
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.querySelector('.modal-close');
const modalLinks = document.querySelectorAll('[data-modal]');

function openModal(modalType) {
    // Hide all modal contents
    document.querySelectorAll('.modal-text').forEach(content => {
        content.style.display = 'none';
    });
    // Welches Modal gerade sichtbar ist (für CSS: nur Kontakt bekommt dunklen Stil)
    modalOverlay.classList.remove('showing-kontakt', 'showing-impressum', 'showing-datenschutz', 'showing-agb');
    modalOverlay.classList.add('showing-' + modalType);

    // Show selected modal content
    const targetContent = document.getElementById(`${modalType}-content`);
    if (targetContent) {
        targetContent.style.display = 'block';
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    modalOverlay.classList.remove('active', 'showing-kontakt', 'showing-impressum', 'showing-datenschutz', 'showing-agb');
    document.body.style.overflow = '';
}

// Input sanitization (XSS prevention)
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<[^>]*>/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .substring(0, 500)
        .trim();
}

// Contact form validation
function validateContactForm() {
    const name = document.getElementById('cf-name');
    const email = document.getElementById('cf-email');
    const subject = document.getElementById('cf-subject');
    const message = document.getElementById('cf-message');
    const fields = [
        { el: name, label: 'Name' },
        { el: email, label: 'E-Mail' },
        { el: subject, label: 'Betreff' },
        { el: message, label: 'Nachricht' }
    ];
    for (const f of fields) {
        if (!f.el || !f.el.value.trim()) {
            alert('Bitte fülle alle Pflichtfelder aus.');
            f.el?.focus();
            return false;
        }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        alert('Bitte gib eine gültige E-Mail-Adresse ein.');
        email.focus();
        return false;
    }
    return true;
}

// Contact form submit
async function handleContactForm(e) {
    e.preventDefault();
    if (!validateContactForm()) return;

    const btn = e.target.querySelector('.form-submit');
    const originalText = btn.textContent;
    btn.textContent = 'Wird gesendet...';
    btn.disabled = true;

    const data = {
        name: sanitizeInput(document.getElementById('cf-name').value),
        company: sanitizeInput(document.getElementById('cf-company').value),
        email: sanitizeInput(document.getElementById('cf-email').value),
        subject: sanitizeInput(document.getElementById('cf-subject').value),
        message: sanitizeInput(document.getElementById('cf-message').value),
        _subject: 'D IT Solution: Kontaktanfrage',
        _captcha: 'false'
    };

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: data.name, company: data.company, email: data.email, subject: data.subject, message: data.message })
        });

        const result = await res.json().catch(() => ({}));

        if (res.ok && result.success) {
            btn.textContent = 'Nachricht gesendet ✓';
            setTimeout(() => closeModal(), 1800);
        } else {
            throw new Error(result.message || 'Versand fehlgeschlagen');
        }
    } catch (err) {
        btn.textContent = originalText;
        btn.disabled = false;
        const msg = err.message || '';
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
            alert('Server nicht erreichbar. Bitte die Seite über die richtige Adresse aufrufen (lokal: Server mit npm start starten, dann http://localhost:3001 – live: deine Railway-URL).');
        } else {
            alert('Fehler: ' + msg);
        }
    }
}

// Attach contact form handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// Open modal on link click
modalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const modalType = link.getAttribute('data-modal');
        openModal(modalType);
    });
});

// Close modal
if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

// Close modal on overlay click
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});
