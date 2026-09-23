/**
 * BrainCX Technical Assessment - Live Google Calendar Webhook & Confirmation Engine
 * Version 3.0: Intelligent Relative Date Parsing ("friday", "tomorrow", etc.) + Universal Vapi Support
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

    // 2. Auto-detection fallback
    if (!functionName || functionName === "") {
      if (parameters.email || parameters.name || (parameters.datetime && parameters.email)) {
        functionName = "create_calendar_booking";
      } else {
        functionName = "check_calendar_availability";
      }
    }

    var result;
    if (functionName === "check_calendar_availability") {
      result = handleCheckAvailability(parameters);
    } else if (functionName === "create_calendar_booking") {
      result = handleCreateBooking(parameters);
    } else {
      result = handleCheckAvailability(parameters);
    }

    var responsePayload = {
      results: [
        {
          toolCallId: toolCallId,
          result: JSON.stringify(result)
        }
      ],
      status: result.status,
      current_date: result.current_date,
      target_date: result.date,
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
 * Intelligently resolves any date input:
 * - "today", "tomorrow", "friday", "next monday", or ISO "YYYY-MM-DD"
 */
function resolveDynamicDate(rawDate) {
  var today = new Date();
  var input = (rawDate || "").toString().toLowerCase().trim();

  var daysMap = {
    "sunday": 0, "sun": 0,
    "monday": 1, "mon": 1,
    "tuesday": 2, "tue": 2,
    "wednesday": 3, "wed": 3,
    "thursday": 4, "thu": 4,
    "friday": 5, "fri": 5,
    "saturday": 6, "sat": 6
  };

  if (!input || input === "today") {
    return today.toISOString().split('T')[0];
  }

  if (input === "tomorrow") {
    var tomorrow = new Date(today.getTime() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  }

  // Check if day of week mentioned (e.g. "friday" or "this friday")
  for (var dayName in daysMap) {
    if (input.indexOf(dayName) !== -1) {
      var targetDay = daysMap[dayName];
      var currentDay = today.getDay();
      var diff = (targetDay - currentDay + 7) % 7;
      if (diff === 0) diff = 7; // Next occurrence
      var nextDate = new Date(today.getTime() + diff * 86400000);
      return nextDate.toISOString().split('T')[0];
    }
  }

  // If already standard YYYY-MM-DD
  if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
    var parts = input.split("-");
    var parsed = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    today.setHours(0,0,0,0);
    if (parsed < today) {
      // If past date, snap to upcoming Friday
      var daysToFriday = (5 - today.getDay() + 7) % 7;
      if (daysToFriday === 0) daysToFriday = 7;
      var upcomingFriday = new Date(today.getTime() + daysToFriday * 86400000);
      return upcomingFriday.toISOString().split('T')[0];
    }
    return input;
  }

  // Default to upcoming Friday
  var d = (5 - today.getDay() + 7) % 7;
  if (d === 0) d = 7;
  var fallback = new Date(today.getTime() + d * 86400000);
  return fallback.toISOString().split('T')[0];
}

function handleCheckAvailability(params) {
  var dateStr = resolveDynamicDate(params.date);
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

  var todayFormatted = Utilities.formatDate(new Date(), userTimezone, "EEEE, MMMM d, yyyy");
  var targetFormatted = Utilities.formatDate(dayStart, userTimezone, "EEEE, MMMM d, yyyy");

  return {
    status: "success",
    current_date: todayFormatted,
    date: dateStr,
    date_display: targetFormatted,
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

  var startTime;
  if (datetimeStr && !isNaN(Date.parse(datetimeStr))) {
    startTime = new Date(datetimeStr);
  } else {
    // If relative date or missing, book upcoming Friday 10 AM
    var resolvedDate = resolveDynamicDate(params.date || "friday");
    var p = resolvedDate.split("-");
    startTime = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10), 10, 0, 0);
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
