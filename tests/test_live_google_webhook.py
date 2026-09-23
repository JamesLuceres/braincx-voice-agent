"""
Live verification script for Google Apps Script Webhook.
Tests both check_calendar_availability and create_calendar_booking against the live endpoint.
"""

import urllib.request
import json
import ssl

WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxrN0gaJHtPn8_9Qvyf9vFwf52i6nmVCzj8FnT1O2dvjGHVUO5B0NWHbj0y9oaDK2zK/exec"

def test_check_availability():
    print("\n--- 1. Testing Live check_calendar_availability ---")
    payload = {
        "function": "check_calendar_availability",
        "parameters": {
            "date": "2026-09-25",
            "timezone": "America/New_York"
        }
    }
    
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    # Handle redirects if any (Google Apps Script redirects 302 to script.googleusercontent.com)
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Response from Google Calendar:")
        print(json.dumps(result, indent=2))
        return result

def test_create_booking():
    print("\n--- 2. Testing Live create_calendar_booking ---")
    payload = {
        "function": "create_calendar_booking",
        "parameters": {
            "name": "Alex Mercer (Recruiter Test)",
            "email": "vpluceres@up.edu.ph",
            "datetime": "2026-09-25T14:00:00Z",
            "timezone": "America/New_York",
            "visitor_notes": "Live test booking from BrainCX Voice Solutions Operator."
        }
    }
    
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Booking Result:")
        print(json.dumps(result, indent=2))
        return result

if __name__ == "__main__":
    test_check_availability()
    test_create_booking()
