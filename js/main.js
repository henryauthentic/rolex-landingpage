document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    gsap.registerPlugin(ScrollTrigger);

    // 2. Custom Cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0, followerX = 0, followerY = 0;

    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        gsap.ticker.add(() => {
            cursorX += (mouseX - cursorX) * 0.5;
            cursorY += (mouseY - cursorY) * 0.5;
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            gsap.set(cursor, { x: cursorX, y: cursorY });
            gsap.set(follower, { x: followerX, y: followerY });
        });

        document.querySelectorAll('button, a, .magnetic').forEach(el => {
            el.addEventListener('mouseenter', () => follower.classList.add('active'));
            el.addEventListener('mouseleave', () => follower.classList.remove('active'));
        });
    }

    // 3. Preloader
    const preloader = document.querySelector('.preloader');
    const splitPreloader = new SplitType('.preloader-text', { types: 'chars' });
    
    window.addEventListener('load', () => {
        window.scrollTo(0, 0);
        const tl = gsap.timeline({ onComplete: initMainAnimations });

        tl.to('.preloader-line', { width: '80%', duration: 1.5, ease: 'power2.inOut' })
          .fromTo(splitPreloader.chars, 
              { opacity: 0, filter: 'blur(10px)', y: 10 },
              { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.05, duration: 0.8, ease: "power2.out" }, "-=0.5"
          )
          .to('.preloader-line', { width: '100%', duration: 0.5, opacity: 0 })
          .to('.preloader-text', { opacity: 0, filter: 'blur(10px)', scale: 1.1, duration: 0.8, ease: "power2.in" })
          .to(preloader, { opacity: 0, duration: 1, onComplete: () => preloader.style.display = 'none' });
    });

    // 4. Sound Toggle
    const soundToggle = document.getElementById('sound-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isMuted = true;

    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        
        if (!isMuted) {
            bgMusic.play().catch(e => console.log("Audio play error:", e));
        } else {
            bgMusic.pause();
        }
        
        soundToggle.classList.toggle('is-active', !isMuted);
        soundToggle.querySelector('.sound-text').textContent = isMuted ? 'SOUND OFF' : 'SOUND ON';
    });

    // 5. Main GSAP Animations
    function initMainAnimations() {
        // --- SECTION 1: HERO ---
        const splitHeroTitle = new SplitType('.hero-title', { types: 'chars' });
        const heroTl = gsap.timeline();

        heroTl.fromTo('.hero-video', { opacity: 0, scale: 1.1, filter: 'brightness(0)' }, { opacity: 1, scale: 1, filter: 'brightness(0.6)', duration: 2.5, ease: "power2.out" })
        .fromTo(splitHeroTitle.chars, { opacity: 0, y: 50, rotationX: -45 }, { opacity: 1, y: 0, rotationX: 0, stagger: 0.03, duration: 1.5, ease: "expo.out" }, "-=1.5")
        .fromTo('.hero-subtitle', { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1 }, "-=1")
        .to('.scroll-indicator-line', { height: '100%', duration: 1.5, ease: 'expo.inOut', repeat: -1, yoyo: true }, "-=1");

        gsap.to('.hero-mask-container', {
            scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true },
            scale: 0.8, opacity: 0, transformOrigin: "center center"
        });

        // --- SECTION 2: EXPLODED VIEW (Dynamic Blur) ---
        const splitText1 = new SplitType('.exploded-text-1', { types: 'words' });
        const splitText2 = new SplitType('.exploded-text-2', { types: 'words' });
        
        gsap.set([splitText1.words, splitText2.words], { opacity: 0, filter: 'blur(10px)', y: 20 });

        const explodedTl = gsap.timeline({
            scrollTrigger: { trigger: "#exploded-view", start: "top top", end: "+=300%", pin: ".exploded-pin", scrub: 1 }
        });

        explodedTl
            // 1. Giữ nguyên video rõ nét lúc mới cuộn đến để người xem chiêm ngưỡng (từ 0 đến 1.5)
            .to('.exploded-video', { scale: 1.05, duration: 1.5 }, 0)
            
            // 2. Bắt đầu làm mờ từ 1.5 đến 2.5
            .to('.exploded-video', { scale: 1.15, filter: "blur(12px) brightness(0.4)", duration: 1 }, 1.5)
            
            // 3. Chữ 1 hiện ra (từ 2 đến 3), giữ nguyên (3 đến 4.5), mờ đi (4.5 đến 5.5)
            .to(splitText1.words, { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.1, duration: 1 }, 2)
            .to(splitText1.words, { opacity: 1, duration: 1.5 }, 3) 
            .to(splitText1.words, { opacity: 0, filter: 'blur(10px)', y: -20, stagger: 0.05, duration: 1 }, 4.5)
            
            // 4. Chữ 2 hiện ra (từ 5.5 đến 6.5), giữ nguyên (6.5 đến 8), mờ đi (8 đến 9)
            .to(splitText2.words, { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.1, duration: 1 }, 5.5)
            .to(splitText2.words, { opacity: 1, duration: 1.5 }, 6.5) 
            .to(splitText2.words, { opacity: 0, filter: 'blur(10px)', y: -20, stagger: 0.05, duration: 1 }, 8)
            
            // 5. Trả lại video trong vắt để xem thêm một lúc trước khi qua section mới (từ 9 đến 10)
            .to('.exploded-video', { filter: "blur(0px) brightness(1)", duration: 1 }, 9)
            .to('.exploded-video', { scale: 1.2, duration: 1 }, 10);

        // --- SECTION 3: INSIDE THE MOVEMENT (EXPANDING REVEAL) ---
        const moveTl = gsap.timeline({
            scrollTrigger: { trigger: "#movement", start: "top top", end: "+=300%", pin: ".movement-pin", scrub: 1 }
        });

        // 1. Phóng to khung video ra toàn màn hình theo chiều dọc
        moveTl.to('.movement-video-mask', {
            height: "100vh",
            filter: "brightness(1)",
            duration: 4,
            ease: "power2.inOut"
        }, 0);

        // 2. Các câu văn lần lượt hiện ra và biến mất
        moveTl.fromTo('.sentence-1', { opacity: 0, y: 50, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, 0.5)
              .to('.sentence-1', { opacity: 0, y: -50, filter: 'blur(10px)', duration: 1 }, 2);

        moveTl.fromTo('.sentence-2', { opacity: 0, y: 50, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 }, 1.5)
              .to('.sentence-2', { opacity: 0, y: -50, filter: 'blur(10px)', duration: 1 }, 3);

        moveTl.fromTo('.sentence-3', 
            { opacity: 0, scale: 0.8, filter: 'blur(10px)', xPercent: -50, yPercent: -50 }, 
            { opacity: 1, scale: 1, filter: 'blur(0px)', xPercent: -50, yPercent: -50, duration: 1.5 }, 2.5);

        // --- SECTION 4: CRAFTSMANSHIP ---
        const craftTl = gsap.timeline({
            scrollTrigger: { trigger: "#craftsmanship", start: "top top", end: "+=200%", pin: ".craftsmanship-pin", scrub: 1 }
        });

        craftTl.to('.massive-text', { scale: 150, duration: 3, ease: "power2.in" })
        .to('.craftsmanship-text-mask-layer', { opacity: 0, duration: 0.5 }, "-=0.5")
        .fromTo('.craftsmanship-overlay-text', { opacity: 0, filter: 'blur(20px)', scale: 0.9 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1 });

        // --- SECTION 5: FINALE ---
        const splitFinale = new SplitType('.finale-title', { types: 'chars' });
        
        gsap.timeline({ scrollTrigger: { trigger: "#finale", start: "top 60%" } })
        .fromTo(splitFinale.chars, { opacity: 0, scale: 2, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", stagger: 0.05, duration: 2, ease: "expo.out" })
        .fromTo('.finale-subtitle', { opacity: 0, y: 20, filter: 'blur(5px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.5, duration: 1 }, "-=1");

        // --- HEADER ANIMATION (Hide on scroll down) ---
        let lastScrollTop = 0;
        const header = document.querySelector('.site-header');
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }
            lastScrollTop = scrollTop;
        });

        // --- FOOTER FADE-TO-BLACK TRANSITION ---
        gsap.to('.finale-fade-overlay', { 
            scrollTrigger: { 
                trigger: ".site-footer", 
                start: "top bottom", 
                end: "top center", 
                scrub: true 
            }, 
            opacity: 1 
        });

        // --- NAVIGATION SMOOTH SCROLL ---
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                lenis.scrollTo(targetId, {
                    duration: 2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            });
        });
        // --- FOOTER WOW ANIMATION ---
        ScrollTrigger.create({
            trigger: ".site-footer",
            start: "top 80%",
            onEnter: () => document.querySelector('.site-footer').classList.add('is-visible'),
            onLeaveBack: () => document.querySelector('.site-footer').classList.remove('is-visible')
        });

        const splitFooterLinks = new SplitType('.footer-links a', { types: 'chars' });
        gsap.from(splitFooterLinks.chars, {
            scrollTrigger: { trigger: ".site-footer", start: "top 70%" },
            y: 20, opacity: 0, stagger: 0.02, duration: 1, ease: "power3.out"
        });

        // Parallax effect on footer content to make it feel like it's sliding up
        gsap.fromTo('.footer-content', 
            { y: 100 }, 
            { scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: 1 }, y: 0 }
        );
    }

    window.addEventListener('resize', () => ScrollTrigger.refresh());
});
