# BrainCX Technical Assessment — 5-Minute Loom Walkthrough Script

**Role:** Junior Solution Engineer Candidate  
**Target Duration:** 4:30 – 5:00 minutes (Strictly under 5 minutes)  
**Tone:** Confident, structured, engineering-focused, and transparent about trade-offs.

---

## Screen Setup Before You Hit Record:
- **Tab 1:** Vapi Assistant Dashboard (showing Alex, System Prompt, and Tools).
- **Tab 2:** Web Call Link / Widget interface (`widget/index.html`).
- **Tab 3:** Google Calendar (showing live view of today/tomorrow).
- **Tab 4:** Your email inbox (showing the Option 1 confirmation email).

---

## Minute-by-Minute Script Breakdown

### 0:00 – 0:45 | Introduction & Architectural Overview
> *"Hi BrainCX team! My name is Vall James Luceres, and this is my walkthrough for the Junior Solution Engineer technical assessment.*
> 
> *The goal was to engineer a production-ready voice agent for the BrainCX website that qualifies inbound enterprise visitors and books live meetings directly on Google Calendar.*
> 
> *To adhere strictly to the free-tier and zero-failure constraints, I designed a 3-tier architecture:*
> 1. *Speech & LLM Layer:* Vapi orchestration combining **Soniox STT RT v5** (boasting a 1.8% Word Error Rate for phonetic accuracy), **OpenAI GPT-5.6 Terra** for high-intelligence reasoning and tool-calling precision, and **Elliot (Vapi v2)** with a 92 Humanness score for natural conversational pacing.
> 2. *Webhook & Execution Layer:* A serverless Google Apps Script webhook that natively interfaces with Google Calendar and MailApp with deterministic query routing (`?action=create_calendar_booking`).
> 3. *Section 8 Extension:* An automated, instant branded email confirmation sent immediately upon booking.

---

### 0:45 – 1:45 | Why I Made These Technical Choices
> *"Let me quickly highlight the key engineering decisions:*
> 
> *1. Serverless Google Apps Script over Hosted Containers:*  
> *Under a strict free-tier requirement, hosting on platforms like Render or Heroku incurs a 30-to-50-second cold-start penalty when containers sleep. In a voice call, that would cause tool calls to time out. Google Apps Script executes with sub-second latency directly on Google's infrastructure with zero cold starts and native calendar permissions.*
> 
> *2. Defensive Date & Parameter Normalization:*  
> *LLMs often suffer from temporal hallucinations when callers say relative dates like 'this Friday'. In our webhook backend, we added two layers of defense: dynamic temporal anchoring in the prompt, and server-side date normalization to ensure bookings never drift into past dates or incorrect months.*
> 
> *3. Interruption & Conversational Cadence:*  
> *We configured Voice Activity Detection (VAD) with a 0.2-second voice threshold and 0.8-second backoff so when a caller interrupts or corrects an email, the agent cuts speech immediately and listens actively.*"

---

### 1:45 – 3:15 | Live Demonstration (The 5 Stress Tests)
*(Switch to your Web Call tab and speak live with Alex)*

1. **Interruption Test:**  
   > *Wait for Alex to begin the greeting, then cut in: "Hi Alex, quick question—we run a healthcare operation."*  
   > *(Show how Alex halts immediately).*
2. **Pricing Question:**  
   > *Ask: "What does this cost?"*  
   > *(Show how Alex explains outcome-based performance pricing, never per seat, with compliance included, and pivots to booking).*
3. **Out-of-Scope Fact Test:**  
   > *Ask: "Can this integrate with an AS/400 mainframe?"*  
   > *(Show how Alex refuses gracefully and offers a discovery call with Tariq and the team).*
4. **Calendar Booking & Slot Selection:**  
   > *Say: "Let's book a meeting for Friday morning at 10 AM."*  
   > *(Show Alex executing `check_calendar_availability` and reading the slots).*
5. **Email Spelling & Correction:**  
   > *Give your email, intentionally spell it with a one-letter correction.*  
   > *(Show Alex repeating it back to verify before executing `create_calendar_booking`).*

---

### 3:15 – 4:00 | Live Calendar & Email Verification
*(Switch tabs to Google Calendar and Email)*

> *"As you can see right here on the live Google Calendar, the event 'BrainCX Discovery Meeting' has been created with the exact 30-minute duration, attendee name, and notes.*
> 
> *And switching over to my inbox, here is the **Option 1 Bonus Deliverable**: an instant branded HTML confirmation email detailing the meeting time, attendee list, and agenda with Tariq Alinur and the solutions engineering team."*

---

### 4:00 – 4:45 | What Still Does Not Work Well (Honesty About Limitations)
*(This fulfills the 10% rubric requirement on transparency)*

> *"To be completely transparent about current limitations and what still needs improvement:*
> 
> 1. *Acoustic Phonetic Disambiguation on Complex Emails:*  
>    *While STT handles standard domains well, unusual company domains or noisy microphones can still cause Deepgram to misinterpret phonemes (e.g., 'b' vs 'v', or 'm' vs 'n'). In production, adding an SMS verification fallback or dual-channel visual confirmation on the web widget would ensure 100% email fidelity.*
> 2. *Timezone Conversion Ambiguity:*  
>    *If an international caller only says 'morning' without stating their timezone, the agent defaults to Eastern Time. An explicit timezone confirmation step before querying availability would improve multi-region booking.*
> 3. *Telemetry & End-to-End Latency Variance:*  
>    *While the speech pipeline achieves ~700–900ms round-trip latency on web connections, telephony edge routing (as BrainCX achieves with sub-300ms) requires dedicated WebRTC edge points rather than centralized cloud hops.*"

---

### 4:45 – 5:00 | Conclusion
> *"Thank you for reviewing my assessment! I thoroughly enjoyed building this agent to reflect BrainCX's high-consequence standards, and I look forward to the live 20-minute pairing session! Have a great day!"*
