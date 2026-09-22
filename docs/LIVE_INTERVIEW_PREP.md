# BrainCX 20-Minute Live Session Preparation & Cheat Sheet

**Assessment Note (Page 2):**
> *"Shortlisted candidates join a 20 minute live session where we change one requirement and ask you to revise the agent with us. No presentation needed."*

Here is your quick-revision cheat sheet for the most common live requirement changes they might throw at you.

---

## Likely Live Requirement Changes & 30-Second Fixes

### 1. "Change the meeting duration from 30 minutes to 15 minutes (or 45 minutes)"
- **Where to change:** In [`backend/google_calendar_webhook.js`](file:///c:/Users/Vall%20James/Documents/antigravity/hopeful-noether/backend/google_calendar_webhook.js), find `handleCreateBooking`:
  ```javascript
  // Change 30 to 15 (or 45)
  var endTime = new Date(startTime.getTime() + 15 * 60 * 1000);
  ```
- **In Vapi Tool Description:** Change "30-minute discovery meeting" to "15-minute discovery meeting".

---

### 2. "Only allow afternoon slots (or restrict booking hours to 1 PM – 4 PM)"
- **Where to change:** In `handleCheckAvailability` in [`google_calendar_webhook.js`](file:///c:/Users/Vall%20James/Documents/antigravity/hopeful-noether/backend/google_calendar_webhook.js):
  ```javascript
  // Change candidateHours from [9, 10, 11, 13, 14, 15, 16] to:
  var candidateHours = [13, 14, 15, 16]; // 1pm to 4pm
  ```

---

### 3. "Collect the caller's Company Name or Phone Number before booking"
- **Where to change in Vapi Tool (`create_calendar_booking`):**
  - Add a property `company_name` (Type: `String`, Required: `Yes`, Description: `Caller company or organization name`).
- **Where to change in Google Apps Script:**
  ```javascript
  var company = params.company_name || "Enterprise Lead";
  var title = "BrainCX Discovery Meeting - " + name + " (" + company + ")";
  ```

---

### 4. "Add a new vertical (e.g. Financial Services: 25% churn reduction)"
- **Where to change:** In your **System Prompt** under `Verticals & Case Results`, add:
  ```text
  - Financial Services: 25% churn reduction across regional banking networks.
  ```

---

### 5. "Change the voice or speed"
- In Vapi: Go to **Assistant** > **Voice** > select a different Cartesia voice or adjust the speed slider (e.g., from `1.0` to `1.05` for a crisper conversational pace).

---

## 🎯 Mindset for the 20-Minute Live Session
- **Think out loud:** Before clicking or editing, articulate what you are changing:
  *"Great requirement! To update that, we need to adjust the tool schema and the backend handler so the data contract stays synchronized."*
- **Verify immediately:** After editing, make a quick test call to demonstrate that the new requirement took effect.
