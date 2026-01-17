/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PLATZREIFE BUCHUNGSSYSTEM – NEU PROGRAMMIERT
 * Golfclub Metzenhof – Version 3.1 (17.01.2026) – Erweiterte Datumserkennung
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ══════════════════════════════════════════════════════════════════════════════
// KONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Backend API URL
  API_URL: "https://script.google.com/macros/s/AKfycbzeT3syS3BN25_HR9QJ-qzHETYSTyz_Z61KxvIa8K0nr5b8XzIGr6A-FwyERn_DU3Dl_A/exec",
  
  // Kurs-Einstellungen
  MAX_PARTICIPANTS: 8,
  COURSE_START: "09:00",
  COURSE_END: "15:00",
  
  // Feste Termine 2026
  DATES_2026: [
    "2026-02-25", "2026-02-28", "2026-03-04", "2026-03-07", "2026-03-11",
    "2026-03-14", "2026-03-18", "2026-03-21", "2026-03-25", "2026-03-28",
    "2026-04-01", "2026-04-04", "2026-04-08", "2026-04-11", "2026-04-15",
    "2026-04-18", "2026-04-22", "2026-04-25", "2026-04-29", "2026-05-02",
    "2026-05-06", "2026-05-09", "2026-05-13", "2026-09-16", "2026-10-14",
    "2026-10-17"
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// HILFSFUNKTIONEN
// ══════════════════════════════════════════════════════════════════════════════

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WEEKDAYS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/**
 * Datum parsen - unterstützt viele Formate:
 * - YYYY-MM-DD (Standard)
 * - DD.MM.YYYY (Deutsch)
 * - YYYY-MM-DDTHH:mm:ss (ISO 8601)
 * - JavaScript Date Object
 * - Timestamp (Number)
 */
function parseDate(input) {
  if (!input) return null;
  
  let dateObj;
  
  // Bereits ein Date-Objekt
  if (input instanceof Date) {
    dateObj = input;
  }
  // Timestamp (Zahl)
  else if (typeof input === "number") {
    dateObj = new Date(input);
  }
  // String
  else if (typeof input === "string") {
    const str = input.trim();
    
    // ISO 8601 Format: 2026-02-25T00:00:00.000Z
    if (str.includes("T")) {
      dateObj = new Date(str);
    }
    // YYYY-MM-DD Format
    else if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = str.split("-").map(Number);
      return { year: y, month: m, day: d };
    }
    // DD.MM.YYYY Format
    else if (str.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
      const [d, m, y] = str.split(".").map(Number);
      return { year: y, month: m, day: d };
    }
    // Versuche als Date zu parsen
    else {
      dateObj = new Date(str);
    }
  }
  else {
    return null;
  }
  
  // Aus Date-Objekt extrahieren
  if (dateObj && !isNaN(dateObj.getTime())) {
    return {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate()
    };
  }
  
  return null;
}

/**
 * Datum formatieren: "Mittwoch, 25.02.2026"
 */
function formatDate(str) {
  const p = parseDate(str);
  if (!p) return str;
  
  const date = new Date(p.year, p.month - 1, p.day);
  const wd = WEEKDAYS[date.getDay()];
  return `${wd}, ${String(p.day).padStart(2, "0")}.${String(p.month).padStart(2, "0")}.${p.year}`;
}

/**
 * Prüfen ob Datum heute oder in der Zukunft liegt
 */
function isFuture(str) {
  const p = parseDate(str);
  if (!p) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(p.year, p.month - 1, p.day);
  return date >= today;
}

/**
 * Nachricht anzeigen
 */
function showMessage(text, type = "info") {
  const msgEl = document.getElementById("message");
  if (!msgEl) return;
  
  msgEl.textContent = text;
  msgEl.className = `message ${type}`;
  msgEl.style.display = "block";
  
  if (type !== "error") {
    setTimeout(() => { msgEl.style.display = "none"; }, 5000);
  }
}

/**
 * Zufällige Buchungs-ID generieren
 */
function generateBookingId() {
  return "PLR-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ══════════════════════════════════════════════════════════════════════════════
// SLOTS / TERMINE
// ══════════════════════════════════════════════════════════════════════════════

let allSlots = [];

/**
 * Statische Slots generieren (Fallback)
 */
function generateStaticSlots() {
  return CONFIG.DATES_2026
    .filter(isFuture)
    .map(date => ({
      slot_id: date,
      date: date,
      start: CONFIG.COURSE_START,
      end: CONFIG.COURSE_END,
      capacity: CONFIG.MAX_PARTICIPANTS,
      booked: 0
    }));
}

/**
 * Slots von API laden
 */
async function fetchSlots() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${CONFIG.API_URL}?action=slots`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    if (!response.ok) throw new Error("API Error");
    
    const data = await response.json();
    const slots = data.slots || [];
    
    if (slots.length === 0) {
      console.log("API leer, verwende statische Termine");
      return generateStaticSlots();
    }
    
    return slots;
  } catch (e) {
    console.log("API nicht erreichbar, verwende statische Termine:", e.message);
    return generateStaticSlots();
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDERING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Termine-Grid rendern
 */
function renderTermine() {
  const container = document.getElementById("slots-container");
  if (!container) {
    console.error("slots-container nicht gefunden");
    return;
  }
  
  // Slots normalisieren und filtern
  const slots = allSlots
    .map(s => {
      const dateStr = s.date || s.slot_id || "";
      return {
        date: dateStr,
        capacity: parseInt(s.capacity) || CONFIG.MAX_PARTICIPANTS,
        booked: parseInt(s.booked) || 0,
        start: s.start || CONFIG.COURSE_START,
        end: s.end || CONFIG.COURSE_END
      };
    })
    .filter(s => s.date && isFuture(s.date))
    .sort((a, b) => {
      const pa = parseDate(a.date);
      const pb = parseDate(b.date);
      if (!pa || !pb) return 0;
      return new Date(pa.year, pa.month - 1, pa.day) - new Date(pb.year, pb.month - 1, pb.day);
    });
  
  console.log(`${slots.length} zukünftige Termine`);
  
  if (slots.length === 0) {
    container.innerHTML = '<div class="termine-empty">Aktuell keine Termine verfügbar.</div>';
    return;
  }
  
  // HTML generieren
  container.innerHTML = slots.map(slot => {
    const p = parseDate(slot.date);
    if (!p) return "";
    
    const free = slot.capacity - slot.booked;
    const dateObj = new Date(p.year, p.month - 1, p.day);
    
    let statusClass = "";
    let statusIcon = "✓";
    let statusText = `${free} Plätze frei`;
    
    if (free === 0) {
      statusClass = "full";
      statusIcon = "✕";
      statusText = "Ausgebucht";
    } else if (free <= 2) {
      statusClass = "few";
      statusIcon = "!";
      statusText = `Nur ${free} frei`;
    }
    
    return `
      <div class="termin-card ${statusClass}">
        <div class="termin-weekday">${WEEKDAYS_SHORT[dateObj.getDay()]}</div>
        <div class="termin-day">${p.day}</div>
        <div class="termin-month">${MONTHS_SHORT[p.month - 1]} ${p.year}</div>
        <div class="termin-status">
          <span class="termin-status-icon">${statusIcon}</span>
          ${statusText}
        </div>
      </div>
    `;
  }).join("");
}

/**
 * Dropdown für Terminauswahl rendern
 */
function renderDropdown() {
  const select = document.getElementById("slot_id");
  if (!select) {
    console.error("slot_id nicht gefunden");
    return;
  }
  
  // Nur buchbare Slots
  const bookable = allSlots
    .map(s => {
      const dateStr = s.date || s.slot_id || "";
      return {
        id: s.slot_id || dateStr,
        date: dateStr,
        capacity: parseInt(s.capacity) || CONFIG.MAX_PARTICIPANTS,
        booked: parseInt(s.booked) || 0,
        start: s.start || CONFIG.COURSE_START,
        end: s.end || CONFIG.COURSE_END
      };
    })
    .filter(s => {
      const free = s.capacity - s.booked;
      return s.date && isFuture(s.date) && free > 0;
    })
    .sort((a, b) => {
      const pa = parseDate(a.date);
      const pb = parseDate(b.date);
      if (!pa || !pb) return 0;
      return new Date(pa.year, pa.month - 1, pa.day) - new Date(pb.year, pb.month - 1, pb.day);
    });
  
  console.log(`${bookable.length} buchbare Termine`);
  
  // Dropdown aufbauen
  select.innerHTML = '<option value="">Bitte wählen...</option>';
  
  bookable.forEach(slot => {
    const free = slot.capacity - slot.booked;
    const option = document.createElement("option");
    option.value = slot.id;
    option.textContent = `${formatDate(slot.date)} · ${slot.start}–${slot.end} Uhr · ${free} frei`;
    option.dataset.free = free;
    select.appendChild(option);
  });
}

/**
 * Teilnehmerfelder rendern
 */
function renderParticipants(count) {
  const container = document.getElementById("participants");
  if (!container) return;
  
  container.innerHTML = "";
  
  for (let i = 0; i < count; i++) {
    const isFirst = i === 0;
    const html = `
      <fieldset class="participant-fieldset">
        <legend>Teilnehmer ${i + 1}${isFirst ? " (Kontakt)" : ""}</legend>
        
        <div class="form-row">
          <label>
            Vorname *
            <input type="text" name="p${i}_first" required>
          </label>
          <label>
            Nachname *
            <input type="text" name="p${i}_last" required>
          </label>
        </div>
        
        <div class="form-row">
          <label>
            Straße *
            <input type="text" name="p${i}_street" required>
          </label>
          <label class="small">
            Hausnr. *
            <input type="text" name="p${i}_house" required>
          </label>
        </div>
        
        <div class="form-row">
          <label class="small">
            PLZ *
            <input type="text" name="p${i}_zip" required pattern="[0-9]{4,5}">
          </label>
          <label>
            Ort *
            <input type="text" name="p${i}_city" required>
          </label>
        </div>
        
        ${isFirst ? `
          <div class="form-row">
            <label>
              E-Mail *
              <input type="email" name="contact_email" required>
            </label>
            <label>
              Telefon
              <input type="tel" name="contact_phone">
            </label>
          </div>
        ` : ""}
      </fieldset>
    `;
    container.insertAdjacentHTML("beforeend", html);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BUCHUNG
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Buchung absenden
 */
async function submitBooking(payload) {
  const response = await fetch(`${CONFIG.API_URL}?action=book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await response.json();
}

/**
 * Formular verarbeiten
 */
async function handleSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const btn = form.querySelector('button[type="submit"]');
  
  // Button deaktivieren
  btn.disabled = true;
  btn.textContent = "Wird gesendet...";
  
  try {
    // Daten sammeln
    const slotId = formData.get("slot_id");
    const count = parseInt(formData.get("participants_count")) || 1;
    const email = formData.get("contact_email");
    const phone = formData.get("contact_phone") || "";
    
    // Validierung
    if (!slotId) {
      throw new Error("Bitte wähle einen Termin aus.");
    }
    if (!email) {
      throw new Error("Bitte gib deine E-Mail-Adresse ein.");
    }
    
    // Teilnehmerdaten sammeln
    const participants = [];
    for (let i = 0; i < count; i++) {
      participants.push({
        first_name: formData.get(`p${i}_first`) || "",
        last_name: formData.get(`p${i}_last`) || "",
        street: formData.get(`p${i}_street`) || "",
        house_no: formData.get(`p${i}_house`) || "",
        zip: formData.get(`p${i}_zip`) || "",
        city: formData.get(`p${i}_city`) || ""
      });
    }
    
    // Payload
    const payload = {
      slot_id: slotId,
      contact_email: email,
      contact_phone: phone,
      participants_count: count,
      participants: participants
    };
    
    console.log("Sende Buchung:", payload);
    
    // An API senden
    const result = await submitBooking(payload);
    
    if (result.success) {
      // Erfolg anzeigen
      showSuccess(result.booking_id, slotId, count, email);
    } else {
      throw new Error(result.error || "Buchung fehlgeschlagen.");
    }
    
  } catch (error) {
    showMessage(error.message, "error");
    btn.disabled = false;
    btn.textContent = "Verbindlich buchen";
  }
}

/**
 * Erfolgsanzeige
 */
function showSuccess(bookingId, slotId, count, email) {
  // Formular ausblenden
  const formSection = document.querySelector(".booking-form-section");
  if (formSection) formSection.style.display = "none";
  
  // Erfolg anzeigen
  const successSection = document.getElementById("success-section");
  if (successSection) {
    successSection.style.display = "block";
    
    // Werte eintragen
    const idEl = document.getElementById("success-id");
    const dateEl = document.getElementById("success-date");
    const countEl = document.getElementById("success-count");
    const emailEl = document.getElementById("success-email");
    
    if (idEl) idEl.textContent = bookingId || generateBookingId();
    if (dateEl) dateEl.textContent = formatDate(slotId);
    if (countEl) countEl.textContent = count;
    if (emailEl) emailEl.textContent = email;
  }
  
  // Nach oben scrollen
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ══════════════════════════════════════════════════════════════════════════════
// INITIALISIERUNG
// ══════════════════════════════════════════════════════════════════════════════

async function init() {
  console.log("🏌️ Platzreife App v3.1 gestartet");
  
  // 1. Slots laden
  allSlots = await fetchSlots();
  console.log(`${allSlots.length} Termine von API geladen`);
  
  // Debug: Erstes Slot-Objekt anzeigen
  if (allSlots.length > 0) {
    console.log("Erster Slot (Debug):", JSON.stringify(allSlots[0]));
  }
  
  // 2. Prüfen ob zukünftige Termine vorhanden sind
  const futureCount = allSlots.filter(s => {
    const dateStr = s.date || s.slot_id || "";
    return isFuture(dateStr);
  }).length;
  
  console.log(`${futureCount} zukünftige Termine erkannt`);
  
  // 3. Fallback: Wenn keine zukünftigen Termine, statische verwenden
  if (futureCount === 0) {
    console.warn("⚠️ Keine zukünftigen Termine erkannt! Verwende statische Termine.");
    allSlots = generateStaticSlots();
    console.log(`Fallback: ${allSlots.length} statische Termine geladen`);
  }
  
  // 4. UI rendern
  renderTermine();
  renderDropdown();
  renderParticipants(1);
  
  // 3. Event Listener (nur wenn Elemente existieren)
  const countInput = document.getElementById("participants_count");
  if (countInput) {
    countInput.addEventListener("input", (e) => {
      let val = parseInt(e.target.value) || 1;
      val = Math.max(1, Math.min(CONFIG.MAX_PARTICIPANTS, val));
      
      // Prüfen ob genug Plätze frei sind
      const select = document.getElementById("slot_id");
      if (select && select.value) {
        const option = select.options[select.selectedIndex];
        const free = parseInt(option.dataset.free) || CONFIG.MAX_PARTICIPANTS;
        val = Math.min(val, free);
      }
      
      e.target.value = val;
      renderParticipants(val);
    });
  }
  
  const form = document.getElementById("booking-form");
  if (form) {
    form.addEventListener("submit", handleSubmit);
  }
  
  const newBookingBtn = document.getElementById("new-booking");
  if (newBookingBtn) {
    newBookingBtn.addEventListener("click", () => {
      location.reload();
    });
  }
  
  console.log("✓ App initialisiert");
}

// Start
document.addEventListener("DOMContentLoaded", init);
