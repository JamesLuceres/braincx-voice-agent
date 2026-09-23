# BrainCX — Enterprise Voice AI Operator

Production-grade web voice AI solution for **BrainCX** (`braincx.com`), designed to qualify inbound enterprise inquiries, present high-consequence operational benchmarks, and seamlessly schedule discovery meetings on a live Google Calendar with automated transactional confirmation dispatch.

---

## 🎯 Architecture Overview

```
┌─────────────────┐       Voice Stream (WebRTC)      ┌────────────────────────┐
│  Web Visitor    │ ◄──────────────────────────────► │  Voice Engine (Vapi)   │
│  (Mic & Speaker)│                                  │  - Soniox STT RT v5    │
└─────────────────┘                                  │  - GPT-5.6 Terra       │
                                                     │  - Elliot (Vapi v2)    │
                                                     └──────────┬─────────────┘
                                                                │ Tool Calls (HTTP POST)
                                                                ▼
                                                     ┌────────────────────────┐
                                                     │ Serverless Webhook     │
                                                     │ (Google Apps Script)   │
                                                     └──────────┬─────────────┘
                                            ┌───────────────────┴───────────────────┐
                                            ▼                                       ▼
                                 [ Live Google Calendar ]                 [ Transactional Email ]
                                 - Availability Lookup                    - Instant Branded HTML
                                 - 30-min Event Creation                    Confirmation Dispatch
```

---

## 🚀 Key Technical Features

- **Sub-Second Voice Orchestration:** Low-latency WebRTC speech streaming with real-time turn-taking and active Voice Activity Detection (VAD) interruption (0.2s voice threshold, 0.8s backoff) allowing natural dialogue flow.
- **Strict Domain Grounding:** Zero conversational hallucinations. Bounded strictly to verified BrainCX operational facts, approved performance figures, and capacity augmentation positioning.
- **Deterministic Calendar Integration:** Two-way integration with Google Calendar. Handles availability querying across working hours and writes confirmed meetings directly with Google Meet integration.
- **Transactional Confirmation Messaging:** Automated server-side HTML email dispatch providing verified meeting details, calendar attachments, and agenda notes immediately upon booking.
- **Defensive Date Resolution:** Dynamic server-side temporal parsing that converts relative spoken phrases (*"this Friday"*, *"tomorrow afternoon"*) into absolute ISO timestamps anchored to live atomic clocks.

---

## 📁 Repository Structure

```
├── prompt/
│   ├── braincx_system_prompt.txt     # Production system prompt
│   └── braincx_system_prompt.md      # Documented prompt with conversational rules
├── tools/
│   └── tools_schema.json             # Function calling contracts for calendar tools
├── backend/
│   ├── google_calendar_webhook.js    # Live Google Calendar webhook (Version 4.0)
│   ├── DEPLOY_CALENDAR_WEBHOOK.md    # Serverless deployment documentation
│   └── mock_calendar_server.py       # Offline local simulation server
├── widget/
│   ├── index.html                    # Embeddable web calling interface
│   └── README.md                     # Platform configuration guide
├── tests/
│   ├── test_calendar_logic.py        # Automated unit tests
│   └── test_live_google_webhook.py   # Live endpoint verification script
├── vapi_assistant_config.json        # Full assistant specification
├── index.html                        # Root landing page (GitHub Pages ready)
├── LICENSE                           # MIT License
└── README.md
```

---

## 🧪 Testing & Verification

### Running Automated Unit Tests
```bash
python -m unittest tests/test_calendar_logic.py
```

### Verifying Live Calendar Endpoint
```bash
python tests/test_live_google_webhook.py
```

---

## 🌐 Live Web Demo
The interactive web calling interface is deployed and accessible at:  
👉 **[https://jamesluceres.github.io/braincx-voice-agent/](https://jamesluceres.github.io/braincx-voice-agent/)**

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
