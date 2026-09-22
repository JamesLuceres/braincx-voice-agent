"""
Mock / Standalone Webhook Server for Calendar Availability & Bookings.
Useful for local verification, automated testing, and ngrok forwarding.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime, timedelta

# In-memory calendar store for local simulation
STORED_EVENTS = []

class CalendarWebhookHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            data = json.loads(body)
        except Exception as e:
            self._set_headers(400)
            self.wfile.write(json.dumps({"status": "error", "message": f"Invalid JSON: {str(e)}"}).encode())
            return

        # Support Vapi tool call structure
        if "message" in data and "functionCall" in data["message"]:
            function_name = data["message"]["functionCall"].get("name")
            params = data["message"]["functionCall"].get("parameters", {})
            call_id = data["message"]["functionCall"].get("id", "call_1")
            is_vapi = True
        else:
            function_name = data.get("function") or data.get("action")
            params = data.get("parameters") or data
            is_vapi = False

        if function_name == "check_calendar_availability":
            date_str = params.get("date", "2026-09-24")
            tz = params.get("timezone", "America/New_York")
            
            # Generate slots
            candidate_slots = [
                {"iso": f"{date_str}T10:00:00Z", "formatted": "10:00 AM", "date": date_str, "timezone": tz},
                {"iso": f"{date_str}T14:30:00Z", "formatted": "2:30 PM", "date": date_str, "timezone": tz},
                {"iso": f"{date_str}T16:00:00Z", "formatted": "4:00 PM", "date": date_str, "timezone": tz}
            ]
            
            # Filter out booked slots
            available = [s for s in candidate_slots if s["iso"] not in [e["datetime"] for e in STORED_EVENTS]]
            
            res_data = {
                "status": "success",
                "date": date_str,
                "timezone": tz,
                "available_slots": available[:3],
                "total_slots_open": len(available)
            }

        elif function_name == "create_calendar_booking":
            name = params.get("name")
            email = params.get("email")
            dt = params.get("datetime")
            tz = params.get("timezone", "America/New_York")
            notes = params.get("visitor_notes", "")

            if not name or not email or not dt:
                res_data = {
                    "status": "error",
                    "message": "Missing required fields: name, email, or datetime."
                }
            else:
                booking = {
                    "booking_id": f"evt_{len(STORED_EVENTS) + 1}",
                    "name": name,
                    "email": email,
                    "datetime": dt,
                    "timezone": tz,
                    "notes": notes,
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
                STORED_EVENTS.append(booking)
                res_data = {
                    "status": "confirmed",
                    "booking_id": booking["booking_id"],
                    "event_title": f"BrainCX Discovery Meeting - {name}",
                    "datetime": dt,
                    "timezone": tz,
                    "attendee_name": name,
                    "attendee_email": email,
                    "confirmation_email_sent": True,
                    "message": "Meeting confirmed and confirmation email dispatched."
                }
        else:
            res_data = {
                "status": "error",
                "message": f"Unknown function: {function_name}"
            }

        if is_vapi:
            output = {
                "results": [
                    {
                        "toolCallId": call_id,
                        "result": json.dumps(res_data)
                    }
                ]
            }
        else:
            output = res_data

        self._set_headers(200)
        self.wfile.write(json.dumps(output).encode())

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, CalendarWebhookHandler)
    print(f"Calendar mock/webhook server running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
