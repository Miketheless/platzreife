const SCRIPT_BASE = "PASTE_YOUR_SCRIPT_URL_HERE"; // .../exec

const slotsEl = document.getElementById("slots");
const slotSel = document.getElementById("slot_id");
const monthEl = document.getElementById("month");
const msgEl = document.getElementById("msg");
const participantsEl = document.getElementById("participants");
const countEl = document.getElementById("count");

let allSlots = [];

function fmtSlot(s) {
  return `${s.date} ${s.start}–${s.end} • frei: ${s.free}/${s.capacity}`;
}

function renderSlots() {
  const m = monthEl.value; // "2026-02"
  const filtered = m ? allSlots.filter(s => s.date.startsWith(m)) : allSlots;

  slotsEl.innerHTML = "";
  slotSel.innerHTML = "";

  filtered.forEach(s => {
    const div = document.createElement("div");
    div.className = "slot";
    div.textContent = fmtSlot(s);
    slotsEl.appendChild(div);

    if (s.free > 0) {
      const opt = document.createElement("option");
      opt.value = s.slot_id;
      opt.textContent = fmtSlot(s);
      slotSel.appendChild(opt);
    }
  });
}

function renderParticipants(n) {
  participantsEl.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const wrap = document.createElement("div");
    wrap.className = "pbox";
    wrap.innerHTML = `
      <h4>Teilnehmer ${i+1}</h4>
      <div class="grid">
        <label>Vorname <input data-k="first_name" required></label>
        <label>Nachname <input data-k="last_name" required></label>
        <label>Straße <input data-k="street" required></label>
        <label>Hausnr <input data-k="house_no" required></label>
        <label>PLZ <input data-k="zip" required></label>
        <label>Ort <input data-k="city" required></label>
      </div>
    `;
    participantsEl.appendChild(wrap);
  }
}

async function loadSlots() {
  const res = await fetch(`${SCRIPT_BASE}?action=slots`);
  const data = await res.json();
  allSlots = data.slots || [];
  renderSlots();
}

monthEl.addEventListener("change", renderSlots);

countEl.addEventListener("input", () => {
  const n = Math.max(1, Math.min(8, Number(countEl.value || 1)));
  countEl.value = n;
  renderParticipants(n);
});

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  msgEl.textContent = "Sende Buchung…";

  const n = Number(countEl.value);
  const pBoxes = [...participantsEl.querySelectorAll(".pbox")];

  const participants = pBoxes.map(box => {
    const get = (k) => box.querySelector(`[data-k="${k}"]`).value.trim();
    return {
      first_name: get("first_name"),
      last_name: get("last_name"),
      street: get("street"),
      house_no: get("house_no"),
      zip: get("zip"),
      city: get("city")
    };
  });

  const payload = {
    slot_id: slotSel.value,
    contact_email: document.getElementById("contact_email").value.trim(),
    participants,
    agbAccepted: document.getElementById("agb").checked,
    privacyAccepted: document.getElementById("privacy").checked
  };

  const res = await fetch(`${SCRIPT_BASE}?action=book`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  msgEl.textContent = data.ok
    ? `✅ Gebucht! Buchungs-ID: ${data.booking_id}`
    : `❌ ${data.message || "Fehler"}`;

  if (data.ok) await loadSlots();
});

renderParticipants(1);
loadSlots();
