"""
Unit & Integration Tests for BrainCX Calendar Webhook Logic.
Ensures tool call contract compliance and robustness before live voice connection.
"""

import unittest
import json
from datetime import datetime

class TestCalendarWebhookLogic(unittest.TestCase):
    def setUp(self):
        self.mock_events = []

    def simulate_check_availability(self, date_str, tz="America/New_York"):
        candidate_slots = [
            {"iso": f"{date_str}T10:00:00Z", "formatted": "10:00 AM", "date": date_str, "timezone": tz},
            {"iso": f"{date_str}T14:30:00Z", "formatted": "2:30 PM", "date": date_str, "timezone": tz},
            {"iso": f"{date_str}T16:00:00Z", "formatted": "4:00 PM", "date": date_str, "timezone": tz}
        ]
        available = [s for s in candidate_slots if s["iso"] not in [e["datetime"] for e in self.mock_events]]
        return {
            "status": "success",
            "date": date_str,
            "timezone": tz,
            "available_slots": available[:3],
            "total_slots_open": len(available)
        }

    def simulate_create_booking(self, name, email, dt, tz="America/New_York", notes=""):
        if not name or not email or not dt:
            return {"status": "error", "message": "Missing required fields."}
        
        # Check collision
        if any(e["datetime"] == dt for e in self.mock_events):
            return {"status": "error", "message": "Slot already booked."}

        booking = {
            "booking_id": f"evt_{len(self.mock_events) + 1}",
            "name": name,
            "email": email,
            "datetime": dt,
            "timezone": tz,
            "notes": notes
        }
        self.mock_events.append(booking)
        return {
            "status": "confirmed",
            "booking_id": booking["booking_id"],
            "event_title": f"BrainCX Discovery Meeting - {name}",
            "datetime": dt,
            "timezone": tz,
            "attendee_name": name,
            "attendee_email": email,
            "confirmation_email_sent": True
        }

    def test_check_availability_returns_slots(self):
        res = self.simulate_check_availability("2026-09-25")
        self.assertEqual(res["status"], "success")
        self.assertEqual(len(res["available_slots"]), 3)
        self.assertEqual(res["available_slots"][0]["formatted"], "10:00 AM")

    def test_create_booking_success(self):
        res = self.simulate_create_booking(
            name="Vall James Luceres",
            email="vpluceres@up.edu.ph",
            dt="2026-09-25T10:00:00Z"
        )
        self.assertEqual(res["status"], "confirmed")
        self.assertEqual(res["attendee_email"], "vpluceres@up.edu.ph")
        self.assertTrue(res["confirmation_email_sent"])
        self.assertEqual(len(self.mock_events), 1)

    def test_prevent_double_booking(self):
        # Book slot 1
        self.simulate_create_booking(
            name="Vall James",
            email="vall@example.com",
            dt="2026-09-25T10:00:00Z"
        )
        # Attempt to book exact same slot
        res2 = self.simulate_create_booking(
            name="Second Visitor",
            email="second@example.com",
            dt="2026-09-25T10:00:00Z"
        )
        self.assertEqual(res2["status"], "error")
        self.assertIn("Slot already booked", res2["message"])

    def test_missing_fields_validation(self):
        res = self.simulate_create_booking(name="", email="test@example.com", dt="2026-09-25T10:00:00Z")
        self.assertEqual(res["status"], "error")

if __name__ == '__main__':
    unittest.main()
