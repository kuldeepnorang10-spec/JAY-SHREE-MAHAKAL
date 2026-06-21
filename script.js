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
  gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
  gsap.ticker.lagSmoothing(0, 0);

  gsap.to(".hero-bg", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  gsap.utils.toArray('.reveal').forEach(elem => {
    gsap.fromTo(elem, 
      { autoAlpha: 0, y: 40 }, 
      { 
        scrollTrigger: { trigger: elem, start: "top 85%" }, 
        autoAlpha: 1, 
        y: 0, 
        duration: 1, 
        ease: "power3.out" 
      }
    );
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
  entries.forEach(e => { if(e.isIntersecting) { animCount(e.target); statObs.unobserve(e.target); } });
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
  document.getElementById('step'+step)?.classList.add('active');
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
    'Mahakaleshwar Jyotirlinga','Mahakal Mahalok','Kal Bhairav Mandir',
    'Harsiddhi Mata Shaktipeeth','Ram Ghat (Kshipra Aarti)','Sandipani Ashram',
    'Mangalnath Temple','Chintaman Ganesh Temple','Jantar Mantar (Vedh Shala)'
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

// ─── 14. COUNTDOWN TIMER (FLASH SALE) ───
let timer = 2*3600 + 45*60 + 30;
setInterval(() => {
  if(timer <= 0) return;
  timer--;
  const h = String(Math.floor(timer/3600)).padStart(2,'0');
  const m = String(Math.floor((timer%3600)/60)).padStart(2,'0');
  const s = String(timer%60).padStart(2,'0');
  const el = document.getElementById('countdownTimer');
  if(el) el.innerText = `${h}:${m}:${s}`;
}, 1000);

// ─── 15. SURVIVAL KIT (5-ITEM CHECKLIST) ───
let survivalState = {
  parking: false, dress: false, locker: false, scam: false, prasad: false
};
const totalItems = 5;

function updateSurvivalScore() {
  const checked = Object.values(survivalState).filter(v => v === true).length;
  const percent = Math.round((checked / totalItems) * 100);
  const scoreEl = document.getElementById('scoreText');
  if(scoreEl) scoreEl.innerText = percent + '%';
  const ring = document.getElementById('survivalProgressRing');
  if(ring) ring.style.strokeDasharray = `${percent}, 100`;

  const cta = document.getElementById('survivalCta');
  if(cta) {
    if(percent === 100) cta.style.display = 'block';
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
  if(!allChecked) {
    alert('🙏 कृपया पहले सभी 5 चेकलिस्ट पूरी करें ताकि आप पूरी तरह तैयार रहें।');
    return;
  }
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('f-req').value = '🔥 Survival Combo: Parking + Locker + Dress + Scam Shield + Prasad (₹299)';
  alert('🎯 बढ़िया चुनाव! फॉर्म सबमिट करते ही हम आपकी पार्किंग, लॉकर, और ड्रेस की व्यवस्था कर देंगे। Mahakal आपका भला करें!');
}

// पेज लोड पर survival state restore करें
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
    } catch(e) {}
  }
  updateSurvivalScore();

  // Emergency Bar show after 2 seconds
  setTimeout(() => {
    document.getElementById('emergencyBar').classList.add('visible');
  }, 2000);
});

// ─── 16. PDF PLANNER (FREE GUIDE) ───
function openPdfPlanner() {
  document.getElementById('pdfModal').style.display = 'flex';
}
document.getElementById('pdfModal').addEventListener('click', function(e) {
  if (e.target === this) this.style.display = 'none';
});

// ─── 17. QUICK ADD TO CART (MINI PRASAD) ───
function quickAddToCart(item, price) {
  if(confirm(`"${item}" को आपकी यात्रा सूची में जोड़ें? (₹${price})`)){
    alert('✅ जुड़ गया! अभी चेकआउट करने के लिए नीचे "Book Darshan" पर क्लिक करें।');
    localStorage.setItem('cart_item', item);
    localStorage.setItem('cart_price', price);
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('f-req').value = `Quick Order: ${item} (₹${price})`;
  }
}

// ─── 18. LOGIN / REGISTER (AUTH) MODAL ───
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
