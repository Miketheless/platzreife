# 🏌️ Platzerlaubnis Online-Buchungssystem (v4.5)

**Golfclub Metzenhof – Platzerlaubniskurs Buchungsplattform**

Ein vollständiges Online-Buchungssystem für Platzerlaubnis-Kurse mit statischem Frontend (HTML/CSS/JS), Google Apps Script Backend und n8n Webhook-Integration für E-Mail-Versand.

**Live-URL:** https://platzreife.metzenhof.at/

**Letzte Aktualisierung:** 20.01.2026

---

## 📋 Inhaltsverzeichnis

1. [Projektübersicht](#-projektübersicht)
2. [Systemarchitektur](#-systemarchitektur)
3. [Dateistruktur](#-dateistruktur)
4. [Google Sheets Tabellenstruktur](#-google-sheets-tabellenstruktur)
5. [Installation & Einrichtung](#-installation--einrichtung)
6. [Wartung & Diagnose](#-wartung--diagnose)
7. [Admin-Bereich](#-admin-bereich)
8. [API-Dokumentation](#-api-dokumentation)
9. [n8n Webhook-Integration](#-n8n-webhook-integration)
10. [Fehlerbehebung](#-fehlerbehebung)
11. [Anpassungen](#-anpassungen)

---

## 🎯 Projektübersicht

### Funktionen:

| Bereich | Funktion | Status |
|---------|----------|--------|
| **Buchung** | Terminauswahl mit Verfügbarkeitsanzeige | ✅ |
| **Buchung** | Einzelbuchung mit Kontaktdaten | ✅ |
| **Buchung** | Gutscheincode-Eingabe | ✅ |
| **Buchung** | Rechtliche Checkboxen (AGB, DSGVO, etc.) | ✅ |
| **Buchung** | Automatische Slot-Verwaltung | ✅ |
| **E-Mail** | Bestätigung via n8n/Outlook | ✅ |
| **Storno** | Stornierung per eindeutigem Link | ✅ |
| **Admin** | Übersicht aller Buchungen | ✅ |
| **Admin** | Checkboxen (Rechnung, Erschienen) | ✅ |
| **Admin** | Bezahldatum-Auswahl | ✅ |
| **Admin** | Quick-Book (Teilnehmer hinzufügen) | ✅ |
| **Admin** | Monatskalender-Ansicht | ✅ |
| **Admin** | CSV-Export | ✅ |
| **Wartung** | Datendiagnose-Funktion | ✅ |
| **Wartung** | Automatische Slot-Neuberechnung | ✅ |

### Preisstruktur:
- **Kurs (GmbH):** 99 €
- **Mitgliedschaft (Verein):** 45 €
- **Gesamt:** 144 €

---

## 🏗 Systemarchitektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BENUTZER (Browser)                             │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (GitHub Pages)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ index.html  │  │ buchen.html │  │ admin.html  │  │  cancel.html    │ │
│  │ (Termine)   │  │ (Formular)  │  │ (Verwaltung)│  │  (Stornierung)  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘ │
│                          │                                               │
│  ┌───────────────────────┴───────────────────────┐                      │
│  │              app.js / admin.js                │                      │
│  │              (JavaScript-Logik)               │                      │
│  └───────────────────────┬───────────────────────┘                      │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │ HTTPS API-Aufrufe
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              BACKEND (Google Apps Script)                                │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        backend.gs                                  │  │
│  │  • doGet() / doPost() - API-Endpunkte                             │  │
│  │  • handleBook() - Buchung verarbeiten                             │  │
│  │  • handleCancel() - Stornierung                                   │  │
│  │  • handleAdminBookings() - Admin-Daten                            │  │
│  │  • diagnoseData() - Datenprüfung                                  │  │
│  │  • recalculateBookedCounts() - Neuberechnung                      │  │
│  │  • resetAndSeedSlots2026() - Termine neu setzen                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                              ▼
┌───────────────────────┐      ┌───────────────────────┐
│   GOOGLE SHEETS       │      │   n8n WEBHOOK         │
│   (Datenbank)         │      │   (E-Mail-Versand)    │
│                       │      │                       │
│  • Slots              │      │  Empfängt Buchungs-   │
│  • Bookings           │      │  daten und sendet     │
│  • Participants       │      │  Outlook-E-Mails      │
│  • Settings           │      │                       │
└───────────────────────┘      └───────────────────────┘
```

---

## 📁 Dateistruktur

```
platzreife/
│
├── 📄 FRONTEND-SEITEN
│   ├── index.html           # Startseite mit Terminübersicht
│   ├── buchen.html          # Buchungsformular
│   ├── admin.html           # Admin-Bereich (passwortgeschützt)
│   ├── cancel.html          # Stornierungsseite
│   ├── agb.html             # AGB für Platzerlaubniskurs
│   └── privacy.html         # Datenschutzerklärung
│
├── 📜 JAVASCRIPT
│   ├── app.js               # Frontend-Logik (Buchung, Termine)
│   └── admin.js             # Admin-Logik (Tabelle, Kalender)
│
├── 🎨 STYLING
│   └── styles.css           # Komplettes CSS (3000+ Zeilen)
│
├── ⚙️ BACKEND
│   └── backend.gs           # Google Apps Script (Backend-Code)
│
├── 🖼 ASSETS
│   ├── Gemma Golfn Logo*.svg
│   ├── metzenhof_logo*.svg
│   └── *.pdf                # Statuten, Mitgliedschaftsbedingungen
│
└── 📖 DOKUMENTATION
    └── README.md            # Diese Datei
```

### Datei-Details:

| Datei | Zeilen | Beschreibung |
|-------|--------|--------------|
| `backend.gs` | ~1740 | Komplettes Backend mit API, E-Mail, Wartungsfunktionen |
| `app.js` | ~1090 | Terminanzeige, Buchungsformular, n8n-Webhook |
| `admin.js` | ~780 | Admin-Tabelle, Kalender, Quick-Book |
| `styles.css` | ~3100 | Vollständiges Metzenhof-Design |

---

## 📊 Google Sheets Tabellenstruktur

### Tab: `Slots` (Termine)

| Spalte | Name | Typ | Beschreibung |
|--------|------|-----|--------------|
| A | `slot_id` | Text | Eindeutige ID (= Datum YYYY-MM-DD) |
| B | `date` | Text | Kursdatum (YYYY-MM-DD) |
| C | `start` | Text | Startzeit (09:00) |
| D | `end` | Text | Endzeit (15:00) |
| E | `capacity` | Zahl | Max. Teilnehmer (z.B. 9) |
| F | `booked` | Zahl | Bereits gebucht (wird automatisch aktualisiert) |
| G | `status` | Text | OPEN oder FULL |

**Beispiel:**
```
slot_id      | date       | start | end   | capacity | booked | status
2026-02-28   | 2026-02-28 | 09:00 | 15:00 | 9        | 3      | OPEN
2026-03-07   | 2026-03-07 | 09:00 | 15:00 | 9        | 9      | FULL
```

---

### Tab: `Bookings` (Buchungen)

| Spalte | Name | Typ | Beschreibung |
|--------|------|-----|--------------|
| A | `booking_id` | Text | Eindeutige Buchungs-ID (PL-XXXXXX) |
| B | `timestamp` | DateTime | Buchungszeitpunkt |
| C | `slot_id` | Text | Referenz zum Termin |
| D | `contact_email` | Text | E-Mail der Kontaktperson |
| E | `contact_phone` | Text | Telefonnummer |
| F | `participants_count` | Zahl | Anzahl Teilnehmer |
| G | `status` | Text | CONFIRMED oder CANCELLED |
| H | `cancel_token` | Text | Token für Stornierungslink |
| I | `cancelled_at` | DateTime | Stornierungszeitpunkt (falls storniert) |
| J | `invoice_sent` | Boolean | ☑️ Rechnung gesendet |
| K | `appeared` | Boolean | ☑️ Teilnehmer erschienen |
| L | `membership_form` | Boolean | ☑️ Mitgliedschaftsformular (optional) |
| M | `dsgvo_form` | Boolean | ☑️ DSGVO-Formular (optional) |
| N | `paid_date` | Date | Bezahldatum |
| O | `voucher_code` | Text | Verwendeter Gutscheincode |

**Beispiel:**
```
booking_id | timestamp            | slot_id    | contact_email      | status    | voucher_code
PL-H5HG6Z  | 2026-01-19T10:30:00 | 2026-02-28 | max@example.at     | CONFIRMED | GOLF2026
PL-K9JM2X  | 2026-01-18T14:15:00 | 2026-03-07 | anna@example.at    | CANCELLED |
```

---

### Tab: `Participants` (Teilnehmer)

| Spalte | Name | Typ | Beschreibung |
|--------|------|-----|--------------|
| A | `booking_id` | Text | Referenz zur Buchung |
| B | `idx` | Zahl | Teilnehmer-Index (1, 2, 3...) |
| C | `first_name` | Text | Vorname |
| D | `last_name` | Text | Nachname |
| E | `street` | Text | Straße |
| F | `house_no` | Text | Hausnummer |
| G | `zip` | Text | Postleitzahl |
| H | `city` | Text | Ort |

---

### Tab: `Settings` (Einstellungen)

| key | value | Beschreibung |
|-----|-------|--------------|
| `ADMIN_EMAIL` | info@metzenhof.at | E-Mail für Admin-Benachrichtigungen |
| `MAIL_FROM_NAME` | Golfclub Metzenhof | Absendername für E-Mails |
| `ADMIN_KEY` | DeinGeheimesPasswort | Passwort für Admin-Bereich |
| `PUBLIC_BASE_URL` | https://platzreife.metzenhof.at | Basis-URL für Links in E-Mails |

---

## 🚀 Installation & Einrichtung

### Voraussetzungen:
- Google Account (für Sheets + Apps Script)
- GitHub Account (für Pages Hosting)
- Optional: n8n Instance (für E-Mail via Outlook)

### Kurzanleitung:

1. **Google Sheet erstellen** mit 4 Tabs (Slots, Bookings, Participants, Settings)
2. **Apps Script** öffnen (Erweiterungen → Apps Script)
3. **backend.gs** Code einfügen
4. **SPREADSHEET_ID** eintragen (aus Sheet-URL)
5. **initSheets()** ausführen (erstellt Header)
6. **resetAndSeedSlots2026()** ausführen (erstellt Termine)
7. **Als Web-App bereitstellen** (Bereitstellen → Neue Bereitstellung)
8. **API-URL** in `app.js` und `admin.js` eintragen
9. **Auf GitHub hochladen** und Pages aktivieren

---

## 🔧 Wartung & Diagnose

### Wichtige Wartungsfunktionen im Backend:

Im Google Apps Script Editor ausführen:

#### 1. `diagnoseData()` – Datenprüfung (ÄNDERT NICHTS)

Überprüft alle Tabellen auf Unstimmigkeiten:

```
═══════════════════════════════════════════════════════════
🔍 DATENDIAGNOSE - Überprüfung aller Tabellen
═══════════════════════════════════════════════════════════

📋 1. BUCHUNGEN-TABELLE
   ✓ Bestätigte Buchungen: 5
   ✕ Stornierte Buchungen: 1
   👥 Gesamte Teilnehmer (bestätigt): 5
   🎟️ Buchungen mit Gutschein: 1

📅 2. SLOTS-TABELLE (Vergleich mit Buchungen)
   Termin          | Kapazität | Gebucht (Sheets) | Gebucht (tatsächlich) | Prüfung
   2026-02-28      |     9     |        1         |          1            | ✓ OK
   2026-03-07      |     9     |        9         |          9            | ✓ OK

📊 ZUSAMMENFASSUNG
   ✅ ALLES IN ORDNUNG! Keine Unstimmigkeiten gefunden.
```

**Wann ausführen:**
- Nach manuellen Änderungen in Google Sheets
- Wenn Frontend/Backend nicht übereinstimmen
- Regelmäßig zur Kontrolle

---

#### 2. `recalculateBookedCounts()` – Slot-Zähler korrigieren

Zählt alle Buchungen neu und korrigiert:
- `booked`-Spalte in Slots
- `status` (OPEN/FULL) basierend auf Kapazität

**Wann ausführen:**
- Nach Diagnose mit Fehlern
- Nach manuellen Änderungen an Buchungen
- Falls Termine falsch als "voll" angezeigt werden

---

#### 3. `resetAndSeedSlots2026()` – Termine komplett neu setzen

⚠️ **ACHTUNG:** Löscht ALLE bestehenden Termine und erstellt neue!

**Wann ausführen:**
- Bei Saisonwechsel
- Bei komplett neuer Terminplanung
- NICHT während laufender Saison mit bestehenden Buchungen!

**Aktuelle Termine (Stand: Januar 2026):**
```javascript
{ date: "2026-02-28", capacity: 9 },
{ date: "2026-03-07", capacity: 9 },
{ date: "2026-03-14", capacity: 9 },
// ... weitere Termine
{ date: "2026-08-22", capacity: 22 },  // Großtermin!
{ date: "2026-10-03", capacity: 18 },
{ date: "2026-10-17", capacity: 18 },
```

---

#### 4. `initSheets()` – Tabellen initialisieren

Erstellt Header-Zeilen falls Tab leer ist.

**Wann ausführen:**
- Bei Ersteinrichtung
- Nach Erstellen neuer Tabs

---

## 👨‍💼 Admin-Bereich

### Zugang:
- URL: `https://platzreife.metzenhof.at/admin.html`
- Passwort: Wert von `ADMIN_KEY` in Settings-Tab

### Funktionen:

#### Kalender-Ansicht
- Monatsübersicht aller Termine
- Farbcodierung: 🟢 Verfügbar, 🟠 Fast voll, 🔴 Voll
- Klick auf Termin öffnet Quick-Book Modal

#### Buchungstabelle
- Alle Buchungen mit Teilnehmerdaten
- Sortierbar nach jeder Spalte
- **Checkboxen:**
  - ☑️ Rechnung gesendet
  - ☑️ Erschienen
- **Bezahldatum:** Datumspicker
- **Gutscheincode:** Wird angezeigt falls vorhanden
- **Stornieren/Wiederherstellen:** Buttons in letzter Spalte

#### Quick-Book (Schnellbuchung)
- Nur Vorname + Nachname erforderlich
- Alle anderen Felder optional
- Direkt aus Kalender-Ansicht

#### CSV-Export
- Alle Buchungsdaten als CSV-Datei
- Für Excel/Buchhaltung

---

## 📡 API-Dokumentation

### Basis-URL:
```
https://script.google.com/macros/s/AKfycbz.../exec
```

### Endpunkte:

| Aktion | Methode | Parameter | Beschreibung |
|--------|---------|-----------|--------------|
| `slots` | GET | – | Alle Termine mit Verfügbarkeit |
| `book` | GET | `data` (Base64-JSON) | Neue Buchung erstellen |
| `cancel` | GET | `token` | Buchung stornieren |
| `admin_bookings` | GET | `admin_key` | Alle Buchungen (Admin) |
| `admin_export_csv` | GET | `admin_key` | CSV-Download (Admin) |
| `admin_update` | GET | `admin_key`, `booking_id`, `field`, `value` | Feld aktualisieren |
| `admin_cancel` | GET | `admin_key`, `booking_id` | Buchung stornieren (Admin) |
| `admin_restore` | GET | `admin_key`, `booking_id` | Stornierung rückgängig |
| `admin_add_booking` | GET | `admin_key`, `data` (Base64) | Schnellbuchung (Admin) |

### Buchungs-Payload:

```json
{
  "slot_id": "2026-02-28",
  "contact_email": "max@example.at",
  "contact_phone": "+43 664 1234567",
  "participants_count": 1,
  "voucher_code": "GOLF2026",
  "participants": [
    {
      "first_name": "Max",
      "last_name": "Mustermann",
      "birthdate": "1990-05-15",
      "street": "Musterstraße",
      "house_no": "1",
      "zip": "4020",
      "city": "Linz",
      "country": "AT"
    }
  ],
  "terms_accepted": {
    "agb_kurs": true,
    "privacy_accepted": true,
    "membership_statutes": true,
    "partner_awareness": true,
    "cancellation_notice": true,
    "fagg_consent": true,
    "newsletter": false,
    "accepted_at": "2026-01-19T10:30:00.000Z"
  }
}
```

---

## 🔗 n8n Webhook-Integration

### Konfiguration in `app.js`:

```javascript
N8N_WEBHOOK_URL: "https://n8n.example.com/webhook/platzreife/booking",
N8N_WEBHOOK_TIMEOUT: 8000,
N8N_WEBHOOK_RETRY_DELAY: 2000,
```

### Webhook-Payload:

Der Webhook erhält nach jeder erfolgreichen Buchung:

```json
{
  "booking_id": "PL-H5HG6Z",
  "created_at": "2026-01-19T10:30:00.000Z",
  "slot": {
    "slot_id": "2026-02-28",
    "date_display": "28.02.2026",
    "date_long": "Samstag, 28.02.2026",
    "time_range": "09:00–15:00"
  },
  "participants": {
    "count": 1,
    "contact_person": {
      "first_name": "Max",
      "last_name": "Mustermann",
      "email": "max@example.at",
      "phone": "+43 664 1234567",
      "address": { ... },
      "birthdate": "1990-05-15"
    }
  },
  "voucher_code": "GOLF2026",
  "pricing": {
    "total": 144,
    "per_person": 144,
    "currency": "EUR"
  },
  "legal_acceptance": { ... }
}
```

---

## 🔧 Fehlerbehebung

### Problem: Termine werden nicht angezeigt

**Ursache:** Slots-Tabelle leer oder nicht initialisiert

**Lösung:**
1. Apps Script öffnen
2. `resetAndSeedSlots2026()` ausführen
3. Slots-Tab prüfen

---

### Problem: "booked"-Zähler stimmt nicht

**Ursache:** Manuelle Änderungen oder abgebrochene Buchung

**Lösung:**
1. `diagnoseData()` ausführen → Bericht lesen
2. `recalculateBookedCounts()` ausführen → Korrigiert automatisch

---

### Problem: Termin als "voll" obwohl Plätze frei

**Ursache:** Status wurde nicht aktualisiert

**Lösung:**
1. `recalculateBookedCounts()` ausführen
2. Prüft automatisch Kapazität vs. Buchungen

---

### Problem: Admin-Login funktioniert nicht

**Ursache:** Falscher ADMIN_KEY

**Lösung:**
1. Settings-Tab öffnen
2. `ADMIN_KEY` prüfen (Groß-/Kleinschreibung!)
3. Neuen Key setzen falls nötig

---

### Problem: Änderungen im Backend nicht aktiv

**Ursache:** Alte Bereitstellung aktiv

**Lösung:**
1. Apps Script → Bereitstellen → Bereitstellungen verwalten
2. **Neue Bereitstellung** erstellen
3. Neue URL in `app.js` und `admin.js` eintragen
4. Auf GitHub committen
5. 1-2 Minuten warten (Cache)

---

### Problem: E-Mails kommen nicht an

**Ursache A:** n8n Webhook nicht erreichbar
- Webhook-URL prüfen
- n8n-Server Status prüfen

**Ursache B:** Gmail-Berechtigungen fehlen
- Apps Script ausführen
- Berechtigungen erneut erteilen

**Ursache C:** Spam-Filter
- Spam-Ordner prüfen

---

### Problem: CORS-Fehler im Browser

**Ursache:** Web-App nicht korrekt veröffentlicht

**Lösung:**
1. Apps Script → Bereitstellen → Web-App
2. Zugriff: **"Jeder"** (nicht "Jeder mit Google-Konto")
3. Neue Bereitstellung erstellen

---

## 🎨 Anpassungen

### Termine ändern

In `backend.gs` die Funktion `resetAndSeedSlots2026()` bearbeiten:

```javascript
const slotsData = [
  { date: "2026-02-28", capacity: 9 },
  { date: "2026-03-07", capacity: 9 },
  // Neue Termine hier hinzufügen
  { date: "2026-11-14", capacity: 12 },  // Beispiel
];
```

Dann `resetAndSeedSlots2026()` ausführen.

---

### Einzelnen Termin hinzufügen

Direkt in Google Sheets → Slots-Tab:
1. Neue Zeile einfügen
2. Alle Spalten ausfüllen (slot_id, date, start, end, capacity, booked=0, status=OPEN)

---

### Kapazität ändern

In Google Sheets → Slots-Tab:
1. Zeile des Termins finden
2. Spalte `capacity` ändern
3. `recalculateBookedCounts()` ausführen (aktualisiert Status)

---

### Farben ändern

In `styles.css` die CSS-Variablen bearbeiten:

```css
:root {
  --color-primary: #4a8c7b;        /* Hauptfarbe (Teal-Grün) */
  --color-primary-dark: #3d7569;   /* Dunklere Variante */
  --color-primary-light: #6ba898;  /* Hellere Variante */
  --color-accent: #8b5e3c;         /* Akzentfarbe (Holz-Braun) */
}
```

---

### Preise ändern

In `app.js` die CONFIG bearbeiten:

```javascript
PRICING: {
  COURSE_GMBH: 99,
  MEMBERSHIP_VEREIN: 45,
  TOTAL: 144,
  CURRENCY: "EUR"
},
```

Und in `buchen.html` die Anzeige entsprechend anpassen.

---

## 📞 Support

Bei Fragen oder Problemen:

- **E-Mail:** info@metzenhof.at
- **Telefon:** +43 7225 7389
- **Website:** [www.metzenhof.at](https://www.metzenhof.at)

---

## 📝 Changelog

### v4.5 (20.01.2026)
- 📝 **Umbenennung:** "Platzreife" → "Platzerlaubnis" im gesamten Frontend
- 🌐 **Domain-Migration:** Alle Links auf `https://platzreife.metzenhof.at` umgestellt
- 🔍 Canonical URLs in allen HTML-Seiten hinzugefügt
- 🤖 Admin-/Stornierungsseiten mit `noindex, nofollow` für SEO
- 📚 README vollständig überarbeitet und dokumentiert

### v4.3 (19.01.2026)
- ✨ Gutscheincode-Feld hinzugefügt
- ✨ Admin: Bezahldatum-Spalte mit Datepicker
- ✨ Admin: Verbesserte Checkbox-Darstellung
- ✨ Diagnose-Funktion `diagnoseData()`
- 🐛 Admin: Spaltenüberschriften jetzt horizontal lesbar
- 🗑 Admin: Spalten Mitglied/DSGVO entfernt

### v4.2 (18.01.2026)
- ✨ Zwei-Seiten-System (index.html + buchen.html)
- ✨ n8n Webhook-Integration für E-Mail
- ✨ Quick-Book Modal im Admin

### v4.1 (17.01.2026)
- ✨ Admin-Kalenderansicht
- ✨ Stornierung wiederherstellen

### v4.0 (16.01.2026)
- 🔄 Komplette Überarbeitung des Frontends
- ✨ Metzenhof Corporate Design
- ✨ Rechtliche Checkboxen (FAGG-konform)

---

## 📄 Lizenz

Dieses Projekt wurde für den Golfclub Metzenhof entwickelt.

© 2026 Golfclub Metzenhof – „mitanaund genießen"
