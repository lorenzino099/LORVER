/* =====================
   LORVER — app.js
   ===================== */

/* ── TYPEWRITER ──────────────── */
const phrases = [
  "Search projects...",
  "Explore services...",
  "Find my work...",
  "What are you looking for?",
];

let pIdx = 0, cIdx = 0, deleting = false;
const tw = document.getElementById("typewriter");

function type() {
  const phrase = phrases[pIdx];
  if (!deleting) {
    tw.innerHTML = phrase.slice(0, cIdx + 1) + '<span class="cursor"></span>';
    cIdx++;
    if (cIdx === phrase.length) {
      setTimeout(() => { deleting = true; tick(); }, 2000);
      return;
    }
  } else {
    tw.innerHTML = phrase.slice(0, cIdx - 1) + '<span class="cursor"></span>';
    cIdx--;
    if (cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
    }
  }
  setTimeout(tick, deleting ? 40 : 80);
}

function tick() { type(); }
setTimeout(tick, 1200);

/* ── SCROLL REVEAL (CARDS) ───── */
const cards = document.querySelectorAll(".card");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0) * 120;
      setTimeout(() => entry.target.classList.add("visible"), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
cards.forEach(c => observer.observe(c));

/* ── NAV SCROLL EFFECT ────────── */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.style.background = window.scrollY > 40
    ? "rgba(8,8,8,0.85)"
    : "rgba(8,8,8,0.55)";
});

/* ── BOOKING MODAL ───────────── */
const backdrop = document.getElementById("modalBackdrop");
const modal    = document.getElementById("modal");
const closeBtn = document.getElementById("closeModal");

function openModal() {
  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  backdrop.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("openBooking").addEventListener("click", openModal);
document.getElementById("openBooking2").addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });

/* ── STEP MANAGEMENT ─────────── */
const dots = document.querySelectorAll(".step-dot");
let currentStep = 1;

function goToStep(n) {
  document.getElementById(`step${currentStep}`).classList.add("hidden");
  // Mark previous dots
  dots.forEach((d, i) => {
    d.classList.remove("active", "done");
    if (i + 1 < n) d.classList.add("done");
    if (i + 1 === n) d.classList.add("active");
  });
  currentStep = n;
  const next = document.getElementById(`step${n}`) || document.getElementById("stepSuccess");
  next.classList.remove("hidden");
}

/* ── STEP 1: SERVICE ─────────── */
let selectedService = null;
const next1 = document.getElementById("next1");

document.querySelectorAll(".option-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".option-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedService = btn.dataset.value;
    next1.disabled = false;
  });
});

next1.addEventListener("click", () => {
  goToStep(2);
  buildCalendar();
});

/* ── STEP 2: CALENDAR ─────────── */
const calEl    = document.getElementById("calendar");
const slotsEl  = document.getElementById("timeslots");
const next2    = document.getElementById("next2");
let selectedDate = null, selectedSlot = null;

const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const SLOTS = ["09:00","10:00","11:00","14:00","15:00","16:00","17:00"];

function buildCalendar() {
  calEl.innerHTML = "";
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();

  DAYS.forEach(d => {
    const lbl = document.createElement("div");
    lbl.className = "cal-day-label";
    lbl.textContent = d;
    calEl.appendChild(lbl);
  });

  for (let i = 0; i < first; i++) {
    const blank = document.createElement("div");
    calEl.appendChild(blank);
  }

  for (let d = 1; d <= total; d++) {
    const day = document.createElement("div");
    day.className = "cal-day";
    day.textContent = d;
    const isPast = new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (isPast) {
      day.classList.add("disabled");
    } else {
      day.addEventListener("click", () => {
        document.querySelectorAll(".cal-day").forEach(x => x.classList.remove("selected"));
        day.classList.add("selected");
        selectedDate = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        buildSlots();
        checkStep2();
      });
    }
    calEl.appendChild(day);
  }
}

function buildSlots() {
  slotsEl.innerHTML = "";
  selectedSlot = null;
  SLOTS.forEach(t => {
    const s = document.createElement("div");
    s.className = "timeslot";
    s.textContent = t;
    s.addEventListener("click", () => {
      document.querySelectorAll(".timeslot").forEach(x => x.classList.remove("selected"));
      s.classList.add("selected");
      selectedSlot = t;
      checkStep2();
    });
    slotsEl.appendChild(s);
  });
}

function checkStep2() {
  next2.disabled = !(selectedDate && selectedSlot);
}

next2.addEventListener("click", () => goToStep(3));

/* ── STEP 3: CONFIRM ─────────── */
document.getElementById("submitBooking").addEventListener("click", () => {
  const name  = document.getElementById("bookName").value.trim();
  const email = document.getElementById("bookEmail").value.trim();
  if (!name || !email) {
    document.getElementById("bookName").style.borderColor  = name  ? "" : "#ff5566";
    document.getElementById("bookEmail").style.borderColor = email ? "" : "#ff5566";
    return;
  }
  // In production, send to your backend here
  console.log({ service: selectedService, date: selectedDate, slot: selectedSlot, name, email });
  goToStep("Success");
  dots.forEach(d => { d.classList.remove("active"); d.classList.add("done"); });
});

/* ── KEYBOARD CLOSE ──────────── */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});
