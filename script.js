// ─── 1. LENIS SMOOTH SCROLL ───
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// ─── 2. GSAP + SCROLLTRIGGER ───
document.addEventListener("DOMContentLoaded", function() {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0, 0);

    gsap.to(".hero-bg", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.utils.toArray('.reveal').forEach(elem => {
        gsap.fromTo(elem, { autoAlpha: 0, y: 40 }, {
            scrollTrigger: { trigger: elem, start: "top 85%" },
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });
});

// ─── 3. MOBILE NAV ───
function toggleMobNav(open) {
    const nav = document.getElementById('mobNav');
    nav.style.display = 'flex';
    setTimeout(() => { open ? nav.classList.add('open') : nav.classList.remove('open'); }, 10);
    document.body.style.overflow = open ? 'hidden' : '';
}

// ─── 4. PACKAGE FILTER ───
document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        document.querySelectorAll('.pkg-card').forEach(card => {
            card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'flex' : 'none';
            card.style.flexDirection = 'column';
        });
    });
});

// ─── 5. FAQ ACCORDION ───
document.querySelectorAll('.accord-hdr').forEach(hdr => {
    hdr.addEventListener('click', () => {
        const item = hdr.parentElement;
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.accord-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
    });
});

// ─── 6. TESTIMONIALS SLIDER ───
const track = document.getElementById('testTrack');
const dotsContainer = document.getElementById('sliderDots');
const cards = track.querySelectorAll('.test-card');
let totalCards = cards.length;
let currentSlide = 0;
let perView = window.innerWidth > 768 ? 3 : 1;

for (let i = 0; i < totalCards; i++) {
    const d = document.createElement('button');
    d.className = 'sdot' + (i === 0 ? ' active' : '');
    d.onclick = () => goToSlide(i);
    dotsContainer.appendChild(d);
}

function goToSlide(n) {
    const maxSlide = totalCards - perView;
    currentSlide = Math.max(0, Math.min(n, maxSlide));
    const cardW = cards[0].offsetWidth + 32;
    track.style.transform = `translateX(-${currentSlide * cardW}px)`;
    dotsContainer.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

let autoSlide = setInterval(() => goToSlide(currentSlide + 1 > totalCards - perView ? 0 : currentSlide + 1), 5000);
window.addEventListener('resize', () => {
    perView = window.innerWidth > 768 ? 3 : 1;
    goToSlide(0);
});

// ─── 7. STATS COUNTER ───
function animCount(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const isFloat = target % 1 !== 0;
    const duration = 1800;
    const step = target / (duration / 16);
    let cur = 0;
    const tick = () => {
        cur = Math.min(cur + step, target);
        const display = isFloat ? cur.toFixed(1) : Math.round(cur).toLocaleString('en-IN');
        el.textContent = display + suffix;
        if (cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}
const statObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animCount(e.target);
            statObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => statObs.observe(el));

// ─── 8. MULTI-STEP FORM ───
let curStep = 1;

function nextStep(step) {
    if (step > curStep) {
        const nameEl = document.getElementById('f-name');
        const phoneEl = document.getElementById('f-phone');
        if (curStep === 1 && (!nameEl.value.trim() || !phoneEl.value.trim())) {
            alert('Name and Phone number are required. 🙏');
            return;
        }
    }
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step)?.classList.add('active');
    document.querySelectorAll('.sprog').forEach((p, i) => p.classList.toggle('done', i < step));
    curStep = step;
}

async function submitQuote() {
    const data = {
        name: document.getElementById('f-name')?.value,
        phone: document.getElementById('f-phone')?.value,
        email: document.getElementById('f-email')?.value,
        destination: document.getElementById('f-dest')?.value,
        travel_date: document.getElementById('f-date')?.value,
        duration: document.getElementById('f-dur')?.value,
        adults: document.getElementById('f-adults')?.value,
        children: document.getElementById('f-children')?.value,
        requirements: document.getElementById('f-req')?.value
    };

    const orderId = 'LEAD-' + Date.now().toString().slice(-6);

    try {
        const res = await fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        document.getElementById('orderId').textContent = result.leadId || orderId;
    } catch {
        document.getElementById('orderId').textContent = orderId;
    }

    document.getElementById('quoteForm').style.display = 'none';
    document.getElementById('formSuccess').classList.add('show');

    setTimeout(() => {
        const msg = `Jai Mahakal! 🙏 I am planning a Ujjain Yatra.\n\nName: ${data.name}\nPhone: ${data.phone}\nDestination: ${data.destination || 'Discuss'}\nDate: ${data.travel_date || 'Flexible'}\nAdults: ${data.adults || 2}`;
        window.open(`https://wa.me/6263735651?text=${encodeURIComponent(msg)}`, '_blank');
    }, 2000);
}

// ─── 9. PRASAD MODAL ───
function openPrasadModal() {
    document.getElementById('prasadModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closePrasadModal() {
    document.getElementById('prasadModal').classList.remove('open');
    document.body.style.overflow = '';
}
document.getElementById('prasadModal').addEventListener('click', e => {
    if (e.target === document.getElementById('prasadModal')) closePrasadModal();
});

function selectPrasad(el) {
    document.querySelectorAll('.pt-opt').forEach(o => o.classList.remove('active'));
    el.classList.add('active');
}

async function submitPrasadOrder() {
    const name = document.getElementById('pm-name').value.trim();
    const phone = document.getElementById('pm-phone').value.trim();
    const addr = document.getElementById('pm-addr').value.trim();
    const pin = document.getElementById('pm-pin').value.trim();

    if (!name || !phone || !addr || !pin) {
        alert('Name, Phone, Address, and Pincode are mandatory. 🙏');
        return;
    }

    const prasadType = document.querySelector('.pt-opt.active .pt-name')?.textContent || 'Mahakal Laddu';
    const orderId = 'PRD-' + Date.now().toString().slice(-6);

    try {
        const res = await fetch('/api/prasad/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, address: addr, pincode: pin, prasad_type: prasadType })
        });
        const result = await res.json();
        document.getElementById('pOrderId').textContent = result.orderId || orderId;
    } catch {
        document.getElementById('pOrderId').textContent = orderId;
    }

    document.querySelector('.prasad-type-grid').style.display = 'none';
    document.querySelectorAll('#prasadModal .f-group, #prasadModal .f-row').forEach(el => el.style.display = 'none');
    document.querySelector('#prasadModal .modal-sub').style.display = 'none';
    document.querySelector('#prasadModal button[onclick="submitPrasadOrder()"]').style.display = 'none';
    document.getElementById('prasadOrderSuccess').style.display = 'block';
}

// ─── 10. ITINERARY BUILDER ───
let yatraItems = [];
document.querySelectorAll('.btn-yatra').forEach((btn, i) => {
    const placeNames = [
        'Mahakaleshwar Jyotirlinga', 'Mahakal Mahalok', 'Kal Bhairav Mandir',
        'Harsiddhi Mata Shaktipeeth', 'Ram Ghat (Kshipra Aarti)', 'Sandipani Ashram',
        'Mangalnath Temple', 'Chintaman Ganesh Temple', 'Jantar Mantar (Vedh Shala)'
    ];
    btn.addEventListener('click', () => {
        const place = placeNames[i] || 'Temple';
        if (!yatraItems.includes(place)) {
            yatraItems.push(place);
            btn.textContent = '✓ Added!';
            btn.classList.add('added');
        }
        const summary = document.getElementById('yatra-summary');
        const list = document.getElementById('yatra-list');
        if (yatraItems.length > 0) {
            summary.style.display = 'block';
            summary.classList.add('visible');
            list.textContent = yatraItems.join(' → ');
        }
    });
});

function addToItinerary(place) {
    if (!yatraItems.includes(place)) {
        yatraItems.push(place);
        const summary = document.getElementById('yatra-summary');
        const list = document.getElementById('yatra-list');
        if (yatraItems.length > 0) {
            summary.style.display = 'block';
            summary.classList.add('visible');
            list.textContent = yatraItems.join(' → ');
        }
        // Also update map if possible
        updateMapPath();
    }
    // Find and update button text if exists
    document.querySelectorAll('.btn-yatra, .btn-yatra-sm').forEach(btn => {
        if (btn.textContent.includes('Add') && btn.closest('.place-body, .bento-overlay')) {
            const parentPlace = btn.closest('.place-body, .bento-overlay');
            if (parentPlace) {
                const heading = parentPlace.querySelector('h3')?.textContent || parentPlace.querySelector('.place-quote')?.textContent || '';
                if (heading && place.includes(heading.substring(0, 10))) {
                    btn.textContent = '✓ Added!';
                    btn.classList.add('added');
                }
            }
        }
    });
}

// ─── 11. STICKY TRUST BAR ───
window.addEventListener('scroll', () => {
    const bar = document.getElementById('stickyTrust');
    if (window.scrollY > 500) bar?.classList.add('show');
    else bar?.classList.remove('show');
}, { passive: true });

// ─── 12. PUJA MODAL REDIRECT ───
function openQuoteModal(type) {
    document.getElementById('f-dest').value = type;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    nextStep(1);
}

// ─── 13. WEATHER SIMULATION ───
const temps = ['32°C · Partly Cloudy', '33°C · Sunny', '34°C · Partly Cloudy', '31°C · Overcast'];
document.getElementById('weather-val').textContent = temps[new Date().getHours() % temps.length];

// ─── 14. COUNTDOWN TIMER ───
let timer = 2 * 3600 + 45 * 60 + 30;
setInterval(() => {
    if (timer <= 0) return;
    timer--;
    const h = String(Math.floor(timer / 3600)).padStart(2, '0');
    const m = String(Math.floor((timer % 3600) / 60)).padStart(2, '0');
    const s = String(timer % 60).padStart(2, '0');
    const el = document.getElementById('countdownTimer');
    if (el) el.innerText = `${h}:${m}:${s}`;
}, 1000);

// ─── 15. SURVIVAL KIT ───
let survivalState = {
    parking: false,
    dress: false,
    locker: false,
    scam: false,
    prasad: false
};
const totalItems = 5;

function updateSurvivalScore() {
    const checked = Object.values(survivalState).filter(v => v === true).length;
    const percent = Math.round((checked / totalItems) * 100);
    const scoreEl = document.getElementById('scoreText');
    if (scoreEl) scoreEl.innerText = percent + '%';
    const ring = document.getElementById('survivalProgressRing');
    if (ring) ring.style.strokeDasharray = `${percent}, 100`;

    const cta = document.getElementById('survivalCta');
    if (cta) {
        if (percent === 100) cta.style.display = 'block';
        else cta.style.display = 'none';
    }
}

function toggleSurvival(element, key) {
    const isChecked = !survivalState[key];
    survivalState[key] = isChecked;

    const icon = element.querySelector('.check-icon');
    if (isChecked) {
        element.style.borderColor = '#C9A227';
        element.style.background = '#1E1A0A';
        icon.innerText = '✅';
        icon.style.color = '#22c55e';
    } else {
        element.style.borderColor = '#2A2A2A';
        element.style.background = '#151515';
        icon.innerText = '☐';
        icon.style.color = '#333';
    }

    if (key === 'scam' && isChecked) {
        document.getElementById('scamAlert').style.display = 'flex';
    }

    updateSurvivalScore();
    localStorage.setItem('ujjain_survival', JSON.stringify(survivalState));
}

function bookAllSurvivalServices() {
    const allChecked = Object.values(survivalState).every(v => v === true);
    if (!allChecked) {
        alert('🙏 कृपया पहले सभी 5 चेकलिस्ट पूरी करें ताकि आप पूरी तरह तैयार रहें।');
        return;
    }
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('f-req').value = '🔥 Survival Combo: Parking + Locker + Dress + Scam Shield + Prasad (₹299)';
    alert('🎯 बढ़िया चुनाव! फॉर्म सबमिट करते ही हम आपकी पार्किंग, लॉकर, और ड्रेस की व्यवस्था कर देंगे। Mahakal आपका भला करें!');
}

document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('ujjain_survival');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            document.querySelectorAll('.survival-item').forEach(el => {
                const onClickAttr = el.getAttribute('onclick');
                if (onClickAttr) {
                    const match = onClickAttr.match(/toggleSurvival\(this, '(\w+)'\)/);
                    if (match) {
                        const key = match[1];
                        if (parsed[key] === true) {
                            toggleSurvival(el, key);
                        }
                    }
                }
            });
        } catch (e) {}
    }
    updateSurvivalScore();

    setTimeout(() => {
        document.getElementById('emergencyBar').classList.add('visible');
    }, 2000);
});

// ─── 16. PDF PLANNER ───
function openPdfPlanner() {
    document.getElementById('pdfModal').style.display = 'flex';
}
document.getElementById('pdfModal').addEventListener('click', function(e) {
    if (e.target === this) this.style.display = 'none';
});

// ─── 17. QUICK ADD TO CART ───
function quickAddToCart(item, price) {
    if (confirm(`"${item}" को आपकी यात्रा सूची में जोड़ें? (₹${price})`)) {
        alert('✅ जुड़ गया! अभी चेकआउट करने के लिए नीचे "Book Darshan" पर क्लिक करें।');
        localStorage.setItem('cart_item', item);
        localStorage.setItem('cart_price', price);
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('f-req').value = `Quick Order: ${item} (₹${price})`;
    }
}

// ─── 18. LOGIN / REGISTER ───
function openAuthModal(mode) {
    document.getElementById('authModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    const toggle = document.getElementById('authToggle');
    if (mode === 'signin') toggle.checked = true;
    if (mode === 'signup') toggle.checked = false;
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('open');
    document.body.style.overflow = '';
}
document.getElementById('authModal').addEventListener('click', e => {
    if (e.target === document.getElementById('authModal')) closeAuthModal();
});

function handleAuthRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    if (!name || !phone) return;
    alert(`🙏 Jai Mahakal ${name}! Your Yatra registration is received. Our team will contact you on ${phone} shortly.`);
    closeAuthModal();
    e.target.reset();
}

function handleAuthLogin(e) {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value.trim();
    if (!phone) return;
    alert(`🔍 Checking booking status for ${phone}... Our team will share your itinerary on WhatsApp shortly.`);
    closeAuthModal();
    e.target.reset();
}

// ─── 19. AMBIENT SOUND TOGGLE ───
let isSoundOn = false;
let audioContext = null;
let soundBuffer = null;

async function toggleSound() {
    const toggle = document.getElementById('soundToggle');
    const icon = toggle.querySelector('.sound-icon');

    if (!isSoundOn) {
        try {
            // Initialize WebAudio API
            audioContext = new(window.AudioContext || window.webkitAudioContext)();

            // Fetch and decode audio (replace with your own sound file)
            const response = await fetch('assets/audio/ambient.mp3');
            const arrayBuffer = await response.arrayBuffer();
            soundBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Play loop
            playAmbientSound();

            isSoundOn = true;
            icon.textContent = '🔊';
            toggle.style.background = 'var(--saffron)';
            toggle.style.color = '#fff';
        } catch (e) {
            console.warn('Audio not available, using oscillator fallback');
            // Fallback: simple oscillator
            playFallbackSound();
            isSoundOn = true;
            icon.textContent = '🔊';
            toggle.style.background = 'var(--saffron)';
            toggle.style.color = '#fff';
        }
    } else {
        // Stop sound
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        isSoundOn = false;
        icon.textContent = '🔇';
        toggle.style.background = '';
        toggle.style.color = '';
    }
}

function playAmbientSound() {
    if (!audioContext || !soundBuffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = soundBuffer;
    source.loop = true;
    source.connect(audioContext.destination);
    source.start(0);
    // Store source to stop later if needed
    audioContext._source = source;
}

function playFallbackSound() {
    // Simple oscillator for demo
    const ctx = new(window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3600); // 1 hour
    audioContext = ctx;
    audioContext._osc = osc;
}

// Toggle sound on button click
document.getElementById('soundToggle').addEventListener('click', toggleSound);

// ─── 20. MAGNETIC CURSOR ───
document.querySelectorAll('.btn-magnetic, .glass-card-wrap, .bento-card').forEach(el => {
    el.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 8;
        this.style.transform = `translate(${x / strength * 0.3}px, ${y / strength * 0.3}px)`;
    });
    el.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0)';
        this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
});

// ─── 21. MAP ITINERARY BUILDER ───
let mapDestinations = [];
const destCoords = {
    mahakal: { x: 200, y: 180, name: 'Mahakaleshwar' },
    bhairav: { x: 320, y: 140, name: 'Kal Bhairav' },
    harsiddhi: { x: 280, y: 260, name: 'Harsiddhi' },
    shipra: { x: 160, y: 300, name: 'Shipra Ghat' },
    ashram: { x: 400, y: 220, name: 'Sandipani' },
    mangal: { x: 480, y: 300, name: 'Mangalnath' },
    omkareshwar: { x: 600, y: 180, name: 'Omkareshwar' },
    mandu: { x: 680, y: 320, name: 'Mandu' }
};

document.querySelectorAll('.map-dot').forEach(dot => {
    dot.addEventListener('click', function() {
        const dest = this.dataset.dest;
        if (!mapDestinations.includes(dest)) {
            mapDestinations.push(dest);
            updateMapPath();
            updateMapList();
            // Also add to itinerary
            const name = destCoords[dest]?.name || dest;
            addToItinerary(name);
        }
    });
});

function updateMapPath() {
    const path = document.getElementById('mapPath');
    const pathGlow = document.getElementById('mapPathGlow');
    if (mapDestinations.length < 2) {
        path.setAttribute('d', '');
        pathGlow.setAttribute('d', '');
        return;
    }
    let d = '';
    mapDestinations.forEach((dest, i) => {
        const coord = destCoords[dest];
        if (!coord) return;
        if (i === 0) {
            d += `M ${coord.x} ${coord.y}`;
        } else {
            d += ` L ${coord.x} ${coord.y}`;
        }
    });
    path.setAttribute('d', d);
    pathGlow.setAttribute('d', d);
}

function updateMapList() {
    const list = document.getElementById('mapPathList');
    if (mapDestinations.length === 0) {
        list.innerHTML = '<li style="color:var(--text);font-weight:500;">👆 Click on map dots above</li>';
        return;
    }
    let html = '';
    mapDestinations.forEach((dest, i) => {
        const name = destCoords[dest]?.name || dest;
        html += `<li>${i+1}. ${name}</li>`;
    });
    list.innerHTML = html;
}

function resetMapPath() {
    mapDestinations = [];
    updateMapPath();
    updateMapList();
    document.getElementById('mapStepInfo').textContent = 'Path reset. Click destinations to build your yatra.';
}

function animateMapPath() {
    if (mapDestinations.length < 2) {
        alert('Please select at least 2 destinations to animate the path.');
        return;
    }
    const path = document.getElementById('mapPath');
    const length = path.getTotalLength ? path.getTotalLength() : 1000;
    gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut'
    });
    document.getElementById('mapStepInfo').textContent = '✨ Path animated!';
}

function exportMapItinerary() {
    if (mapDestinations.length === 0) {
        alert('Please select at least one destination on the map.');
        return;
    }
    const names = mapDestinations.map(d => destCoords[d]?.name || d).join(' → ');
    document.getElementById('f-req').value = `Map Itinerary: ${names}`;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    alert(`📋 Your itinerary (${names}) has been added to the contact form. Just submit to get a personalized quote!`);
}

// ─── 22. HAPTIC FEEDBACK (Mobile) ───
function triggerHaptic() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

document.querySelectorAll('.btn, .btn-yatra, .btn-puja, .auth-btn, .btn-submit').forEach(btn => {
    btn.addEventListener('click', triggerHaptic);
});

// ─── 23. CLICK SOUND (Micro-interaction) ───
let clickAudio = null;

function playClickSound() {
    try {
        if (!clickAudio) {
            clickAudio = new Audio('assets/audio/click-tick.mp3');
            clickAudio.volume = 0.15;
        }
        if (clickAudio.paused) {
            clickAudio.currentTime = 0;
            clickAudio.play().catch(e => {});
        } else {
            // Clone for overlapping clicks
            const clone = clickAudio.cloneNode();
            clone.volume = 0.15;
            clone.play().catch(e => {});
        }
    } catch (e) {}
}

document.addEventListener('click', function(e) {
    if (e.target.closest('.btn, .btn-yatra, .btn-puja, .auth-btn, .btn-submit, .btn-next, .btn-back, .ftab, .accord-hdr, .map-dot, .bento-card, .glass-card-wrap, .float-btn, .sound-toggle')) {
        playClickSound();
    }
});

// ─── 24. CANVAS EXPLODING CLICK (Premium effect) ───
document.querySelectorAll('.btn-submit, .auth-btn, .btn-saffron').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Only on primary actions
        if (this.classList.contains('btn-submit') || this.classList.contains('auth-btn')) {
            createParticleExplosion(e.clientX, e.clientY);
        }
    });
});

function createParticleExplosion(x, y) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#C45B1A', '#FFD700', '#FFFFFF', '#8B1A1A', '#E07B3A'];

    for (let i = 0; i < 60; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = 2 + Math.random() * 6;
        particles.push({
            x: x || window.innerWidth / 2,
            y: y || window.innerHeight / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            radius: 3 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1,
            decay: 0.008 + Math.random() * 0.015
        });
    }

    let frame = 0;

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.life -= p.decay;
            if (p.life <= 0) return;
            alive = true;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        if (alive) {
            requestAnimationFrame(animateParticles);
        } else {
            document.body.removeChild(canvas);
        }
    }
    animateParticles();
}