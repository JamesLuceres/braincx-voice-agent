# Google Calendar & Confirmation Webhook Deployment Guide

This guide details how our live Google Calendar webhook is deployed using **Google Apps Script** (100% Free Tier, zero credit card, zero maintenance).

---

## Why Google Apps Script?
1. **Free Tier & Zero Cold Starts:** Runs directly inside Google's enterprise infrastructure. Never sleeps (unlike Render or Heroku free tiers).
2. **Native Permissions:** Directly reads/writes to your personal Google Calendar without needing GCP service accounts or OAuth token refreshes.
3. **Built-in Option 1 Confirmation Email:** Uses Google's `MailApp.sendEmail` to immediately send the branded confirmation email directly from your Google account.

---

## Step-by-Step Deployment (Takes 2 Minutes)

1. Open your browser and go to [script.google.com](https://script.google.com/) (logged into your personal Google account).
2. Click **New Project** and name it `BrainCX-Calendar-Webhook`.
3. Select all text in the default `Code.gs` file and replace it with the code from [`backend/google_calendar_webhook.js`](file:///c:/Users/Vall%20James/Documents/antigravity/hopeful-noether/backend/google_calendar_webhook.js).
4. Click the **Save** icon (disk icon).
5. In the top-right corner, click **Deploy** > **New deployment**.
6. Click the gear icon next to "Select type" and choose **Web app**.
7. Set the fields:
   - **Description:** `BrainCX Live Voice Agent Webhook`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone` *(Crucial: This allows Vapi to make POST requests without authentication headers)*.
8. Click **Deploy**.
9. Google will ask you to **Authorize access**:
   - Click *Review permissions* -> Choose your Google account -> Click *Advanced* -> Click *Go to BrainCX-Calendar-Webhook (unsafe)* -> Click *Allow*.
10. Copy the **Web App URL** (it will look like `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## How to Test the Live Webhook with cURL or Postman

### Test 1: Check Availability
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "function": "check_calendar_availability",
    "parameters": {
      "date": "2026-09-24",
      "timezone": "America/New_York"
    }
  }'
```

### Test 2: Create Booking & Verify Calendar + Email
```bash
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "function": "create_calendar_booking",
    "parameters": {
      "name": "Alex Mercer",
      "email": "your_personal_test_email@gmail.com",
      "datetime": "2026-09-24T14:00:00Z",
      "timezone": "America/New_York",
      "visitor_notes": "Exploring capacity scaling for 50-agent contact center in healthcare."
    }
  }'
```

**Expected Result:**
1. Event `"BrainCX Discovery Meeting - Alex Mercer"` immediately appears on your Google Calendar.
2. A formatted, branded confirmation email lands in the attendee's inbox.
