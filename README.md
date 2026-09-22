# BrainCX AI Inc. — Voice Solutions Agent Assessment

Production-grade web voice agent for **BrainCX** (`braincx.com`), built for the **Junior Solution Engineer** technical assessment.

---

## 🎯 Architecture Overview

```
┌─────────────────┐       Voice Stream (WebRTC)      ┌────────────────────────┐
│  Web Visitor    │ ◄──────────────────────────────► │  Voice Engine (Vapi)   │
│  (Mic & Speaker)│                                  │  - Deepgram Nova-2     │
└─────────────────┘                                  │  - GPT-4.1 Reasoning   │
                                                     │  - Cartesia Sonic TTS  │
                                                     └──────────┬─────────────┘
                                                                │ Tool Calls (HTTP POST)
                                                                ▼
                                                     ┌────────────────────────┐
                                                     │ Serverless Webhook     │
                                                     │ (Google Apps Script)   │
                                                     └──────────┬─────────────┘
                                            ┌───────────────────┴───────────────────┐
                                            ▼                                       ▼
                                 [ Live Google Calendar ]                 [ Option 1 Bonus ]
                                 - Availability Lookup                    - Instant Branded HTML
                                 - 30-min Event Creation                    Confirmation Email
```

---

## 📁 Repository Structure

```
├── prompt/
│   ├── braincx_system_prompt.txt     # Clean plain text prompt (Deliverable #3)
│   └── braincx_system_prompt.md      # Annotated prompt with guardrails & rationale
├── tools/
│   └── tools_schema.json             # Function calling contracts for calendar tools
├── backend/
│   ├── google_calendar_webhook.js    # Live Google Calendar webhook (Version 2.0)
│   ├── DEPLOY_CALENDAR_WEBHOOK.md    # 2-minute zero-cost deployment guide
│   └── mock_calendar_server.py       # Offline local simulation server
├── widget/
│   ├── index.html                    # Embeddable BrainCX web calling interface
│   └── README.md                     # Platform configuration guide
├── tests/
│   ├── test_calendar_logic.py        # Automated unit tests
│   └── test_live_google_webhook.py   # Live endpoint verification script
├── docs/
│   ├── LOOM_WALKTHROUGH_SCRIPT.md    # 5-minute Loom video script (Deliverable #2)
│   └── LIVE_INTERVIEW_PREP.md        # 20-minute live session cheat sheet
├── vapi_assistant_config.json        # Full exportable assistant specification
└── README.md
```

---

## 🚀 Key Highlights & Compliance

- **40% Conversational Quality:** Sub-150ms Deepgram transcription + low-latency VAD interruption (0.2s voice threshold, 0.8s backoff) allowing callers to interrupt naturally without robotic restarts.
- **30% Prompt Engineering:** Complete immunity against the 6 automatic fails: zero model disclaimers, no IVR menu reading, strict bounding to Section 3 facts, and strict prevention of headcount reduction framing.
- **20% Booking Reliability:** Live two-way integration with personal Google Calendar. Every confirmed booking generates a real calendar event with Google Meet link.
- **10% Loom Walkthrough:** Structured 4.5-minute video demonstrating the 5 reviewer stress tests and transparent discussion of voice telephony limitations.
- **Section 8 Extension (Option 1):** Instant branded HTML confirmation email automatically dispatched to the attendee's email upon booking.

---

## 📬 What to Submit to BrainCX

1. **Working link to widget:** Your public Vapi Web Call URL (or hosted `widget/index.html`).
2. **Loom Walkthrough:** Under 5-minute video following [`docs/LOOM_WALKTHROUGH_SCRIPT.md`](docs/LOOM_WALKTHROUGH_SCRIPT.md).
3. **System prompt file:** Attached [`prompt/braincx_system_prompt.txt`](prompt/braincx_system_prompt.txt).
