# BrainCX Web Voice Call Widget & Platform Setup Guide

This guide walks you through connecting our live Google Calendar webhook to **Vapi** (Free Tier: $10 trial credit, ~100+ minutes of web calls) and launching the web widget.

---

## Part 1: Setting up Vapi (Takes 3 Minutes)

1. Go to [vapi.ai](https://vapi.ai) and sign up for a free account.
2. In the left navigation, click **Assistants** > **Create Assistant** (choose "Blank Template").
3. Configure the assistant fields:
   - **Name:** `BrainCX Solutions Representative - Alex`
   - **First Message:** 
     `Hi there! Thanks for reaching out to BrainCX. I'm Alex. We help high-consequence organizations redesign, build, and run customer conversations powered by AI. Are you looking to scale capacity for your contact center, or exploring voice AI for a specific project?`
   - **System Prompt:** Copy and paste the entire content of [`prompt/braincx_system_prompt.txt`](file:///c:/Users/Vall%20James/Documents/antigravity/hopeful-noether/prompt/braincx_system_prompt.txt).
   - **Model:** `gpt-4o-mini` (or `gpt-4o`), Temperature: `0.3`.
   - **Transcriber:** Deepgram, Model: `nova-2`, Language: `en`.
   - **Voice:** Cartesia (`sonic-english`, e.g. "Katie" or "Barbershop Man") or ElevenLabs.

---

## Part 2: Adding the Live Google Calendar Tools

In the Assistant settings, scroll to **Tools / Functions** and click **Add Tool / Create Custom Tool**:

### Tool 1: `check_calendar_availability`
- **Name:** `check_calendar_availability`
- **Description:** `Checks the live Google Calendar for available 30-minute meeting slots with Tariq and the BrainCX solutions team for a given date.`
- **Server URL:** Your live Google Apps Script URL:
  `https://script.google.com/macros/s/AKfycbxrN0gaJHtPn8_9Qvyf9vFwf52i6nmVCzj8FnT1O2dvjGHVUO5B0NWHbj0y9oaDK2zK/exec`
- **Parameters (JSON Schema):**
  ```json
  {
    "type": "object",
    "properties": {
      "date": {
        "type": "string",
        "description": "Date in YYYY-MM-DD format (e.g. 2026-09-25)."
      },
      "timezone": {
        "type": "string",
        "description": "Caller timezone, e.g. America/New_York."
      },
      "time_preference": {
        "type": "string",
        "enum": ["morning", "afternoon", "any"]
      }
    },
    "required": ["date"]
  }
  ```

### Tool 2: `create_calendar_booking`
- **Name:** `create_calendar_booking`
- **Description:** `Creates a confirmed 30-minute discovery meeting on Google Calendar and sends confirmation email with meeting details.`
- **Server URL:** Your live Google Apps Script URL:
  `https://script.google.com/macros/s/AKfycbxrN0gaJHtPn8_9Qvyf9vFwf52i6nmVCzj8FnT1O2dvjGHVUO5B0NWHbj0y9oaDK2zK/exec`
- **Parameters (JSON Schema):**
  ```json
  {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "Full name of the caller."
      },
      "email": {
        "type": "string",
        "description": "Verified email address to receive the calendar invite."
      },
      "datetime": {
        "type": "string",
        "description": "ISO 8601 datetime string, e.g. 2026-09-25T14:00:00Z."
      },
      "timezone": {
        "type": "string",
        "description": "Caller timezone, e.g. America/New_York."
      },
      "visitor_notes": {
        "type": "string",
        "description": "Brief notes on the visitor's industry and operations."
      }
    },
    "required": ["name", "email", "datetime"]
  }
  ```

---

## Part 3: Interruption & Pacing Settings (Conversational Quality)

In the assistant's **Voice / Advanced** settings:
- **Stop Speaking Plan (Interruption):**
  - Voice Threshold: `0.2s`
  - Backoff Seconds: `0.8s`
  - Word threshold: `1 word`
  *(This ensures that the instant the reviewer speaks, the agent stops talking and actively listens).*

---

## Part 4: Testing & Web Widget Delivery

You have two instant ways to test and share:

### Option A: Direct Web Call Link (Vapi Hosted)
- In the top right of your Vapi assistant page, click **Share** or **Test Call**.
- Copy the public **Web Call URL**. You can paste this directly into your browser or send it to reviewers!

### Option B: Our Branded BrainCX Web Page (`widget/index.html`)
- Open [`widget/index.html`](file:///c:/Users/Vall%20James/Documents/antigravity/hopeful-noether/widget/index.html) in any web browser.
- Paste your Vapi **Public Key** (found in Vapi *Account / API Keys*) and **Assistant ID**.
- Click **Start Web Voice Call** and speak into your microphone!
