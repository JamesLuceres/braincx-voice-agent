/**
 * BrainCX Technical Assessment - Live Google Calendar Webhook & Confirmation Engine
 * Version 2.0: Universal Vapi format handling + Smart Date Validation
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var request = JSON.parse(rawData);
    
    var functionName = "";
    var parameters = {};
    var toolCallId = "call_1";

    // 1. Extract from Vapi toolCalls / functionCall / REST payloads
    if (request.message) {
      if (request.message.toolCalls && request.message.toolCalls.length > 0) {
        var tc = request.message.toolCalls[0];
        toolCallId = tc.id || "call_1";
        if (tc.function) {
          functionName = tc.function.name || "";
          parameters = typeof tc.function.arguments === "string" 
            ? JSON.parse(tc.function.arguments) 
            : (tc.function.arguments || {});
        }
      } else if (request.message.functionCall) {
        functionName = request.message.functionCall.name || "";
        parameters = request.message.functionCall.parameters || {};
        toolCallId = request.message.functionCall.id || "call_1";
      }
    } else if (request.toolCall) {
      functionName = request.toolCall.function ? request.toolCall.function.name : "";
      parameters = request.toolCall.function ? request.toolCall.function.arguments : {};
      toolCallId = request.toolCall.id || "call_1";
    }

    if (!functionName) functionName = request.function || request.name || request.action || "";
    if (Object.keys(parameters).length === 0) {
      parameters = request.parameters || request;
    }

    // 2. Auto-detection fallback based on payload fields
    if (!functionName || functionName === "") {
      if (parameters.email || parameters.name || parameters.datetime) {
        functionName = "create_calendar_booking";
      } else if (parameters.date) {
        functionName = "check_calendar_availability";
      }
    }

    var result;
    if (functionName === "check_calendar_availability" || parameters.date) {
      result = handleCheckAvailability(parameters);
    } else if (functionName === "create_calendar_booking" || parameters.email) {
      result = handleCreateBooking(parameters);
    } else {
      result = {
        status: "error",
        message: "Unable to identify function: " + functionName
      };
    }

    var responsePayload = {
      results: [
        {
          toolCallId: toolCallId,
          result: JSON.stringify(result)
        }
      ],
      status: result.status,
      available_slots: result.available_slots,
      booking_id: result.booking_id,
      message: result.message
    };

    return ContentService
      .createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Validates and normalizes date so it is never in the past.
 */
function normalizeTargetDate(dateStr) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!dateStr) {
    // Default to tomorrow
    var tomorrow = new Date(today.getTime() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  }

  var parts = dateStr.split("-");
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) - 1;
  var day = parseInt(parts[2], 10);

  var target = new Date(year, month, day);

  // If the target is in the past (e.g. caller or LLM said June 2026 when it's September 2026),
  // snap forward to the upcoming Friday or tomorrow
  if (target < today) {
    // Return this upcoming Friday
    var dayOfWeek = today.getDay(); // 0 is Sun, 2 is Tue, 5 is Fri
    var daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0) daysUntilFriday = 7;
    var upcomingFriday = new Date(today.getTime() + daysUntilFriday * 86400000);
    return upcomingFriday.toISOString().split('T')[0];
  }

  return dateStr;
}

function handleCheckAvailability(params) {
  var dateStr = normalizeTargetDate(params.date);
  var userTimezone = params.timezone || "America/New_York";
  var timePref = params.time_preference || "any";

  var calendar = CalendarApp.getDefaultCalendar();
  
  var parts = dateStr.split("-");
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) - 1;
  var day = parseInt(parts[2], 10);

  var dayStart = new Date(year, month, day, 9, 0, 0);
  var dayEnd = new Date(year, month, day, 17, 0, 0);

  var events = calendar.getEvents(dayStart, dayEnd);
  var candidateHours = [9, 10, 11, 13, 14, 15, 16];
  var availableSlots = [];

  candidateHours.forEach(function(hour) {
    if (timePref === "morning" && hour >= 12) return;
    if (timePref === "afternoon" && hour < 12) return;

    var slotStart = new Date(year, month, day, hour, 0, 0);
    var slotEnd = new Date(year, month, day, hour, 30, 0);

    var isConflict = events.some(function(event) {
      return (slotStart < event.getEndTime() && slotEnd > event.getStartTime());
    });

    if (!isConflict) {
      var period = hour >= 12 ? "PM" : "AM";
      var displayHour = hour > 12 ? (hour - 12) : hour;
      var formattedTime = displayHour + ":00 " + period;
      
      availableSlots.push({
        iso: slotStart.toISOString(),
        formatted: formattedTime,
        date: dateStr,
        timezone: userTimezone
      });
    }
  });

  return {
    status: "success",
    date: dateStr,
    timezone: userTimezone,
    available_slots: availableSlots.slice(0, 3),
    total_slots_open: availableSlots.length
  };
}

function handleCreateBooking(params) {
  var name = params.name || "BrainCX Visitor";
  var email = params.email;
  var datetimeStr = params.datetime;
  var userTimezone = params.timezone || "America/New_York";
  var notes = params.visitor_notes || "Discussion on BrainCX AI CX operations and capacity scaling.";

  if (!email) {
    return { status: "error", message: "Missing email address for booking." };
  }

  // Ensure datetime is in upcoming 2026, not past
  var startTime = datetimeStr ? new Date(datetimeStr) : new Date(Date.now() + 86400000);
  if (startTime < new Date()) {
    // If in past, schedule for upcoming Friday at 10 AM
    var today = new Date();
    var dayOfWeek = today.getDay();
    var daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0) daysUntilFriday = 7;
    startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilFriday, 10, 0, 0);
  }

  var endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  var calendar = CalendarApp.getDefaultCalendar();

  var title = "BrainCX Discovery Meeting - " + name;
  var description = "Meeting with: " + name + " (" + email + ")\n" +
                    "Host: Tariq Alinur & BrainCX Solutions Engineering\n" +
                    "Notes: " + notes + "\n" +
                    "Booked via: BrainCX Live Voice Web Assistant\n" +
                    "Verticals: High-Consequence Customer Conversations";

  var event = calendar.createEvent(title, startTime, endTime, {
    description: description,
    guests: email,
    sendInvites: true
  });

  var emailSent = false;
  try {
    var subject = "Confirmed: BrainCX Discovery Call with Tariq Alinur & Solutions Team";
    var htmlBody = "" +
      "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 8px;'>" +
        "<div style='background-color: #0F172A; padding: 16px; border-radius: 6px; text-align: center;'>" +
          "<h2 style='color: #FFFFFF; margin: 0;'>BrainCX</h2>" +
          "<p style='color: #94A3B8; margin: 4px 0 0 0; font-size: 14px;'>The AI CX Operator for High-Consequence Verticals</p>" +
        "</div>" +
        "<div style='padding: 20px 0;'>" +
          "<p>Hi <strong>" + name + "</strong>,</p>" +
          "<p>Your discovery meeting with the BrainCX team has been confirmed on our calendar!</p>" +
          "<div style='background-color: #F8FAFC; padding: 16px; border-left: 4px solid #2563EB; margin: 16px 0;'>" +
            "<p style='margin: 0 0 8px 0;'><strong>📅 Date & Time:</strong> " + startTime.toUTCString() + " (" + userTimezone + ")</p>" +
            "<p style='margin: 0 0 8px 0;'><strong>⏱️ Duration:</strong> 30 Minutes</p>" +
            "<p style='margin: 0;'><strong>👥 Attendees:</strong> " + name + " & Tariq Alinur / Solutions Team</p>" +
          "</div>" +
          "<p><strong>What we'll cover:</strong></p>" +
          "<ul>" +
            "<li>Your current contact center volume and key friction points.</li>" +
            "<li>How our agent cloning approach gives your existing staff more capacity without replacing them.</li>" +
            "<li>Outcome-based commercial structure and 4–6 week deployment timeline.</li>" +
          "</ul>" +
          "<p style='font-size: 13px; color: #64748B;'>A calendar invitation has also been sent directly to your email. Need to reschedule? Simply reply to this email.</p>" +
        "</div>" +
        "<hr style='border: none; border-top: 1px solid #E2E8F0;' />" +
        "<p style='font-size: 11px; color: #94A3B8; text-align: center;'>BrainCX Inc. • West Palm Beach, Florida • braincx.com</p>" +
      "</div>";

    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
    emailSent = true;
  } catch (mailError) {
    Logger.log("Email dispatch warning: " + mailError.toString());
  }

  return {
    status: "confirmed",
    booking_id: event.getId(),
    event_title: title,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    attendee_name: name,
    attendee_email: email,
    confirmation_email_sent: emailSent,
    message: "Meeting successfully booked on Google Calendar and confirmation dispatched."
  };
}
