const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const sgMail = require("@sendgrid/mail");
require("dotenv").config(); // if using .env file

// Set your API key securely
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const cron = require("node-cron");

// Replace with your user's email
const userEmail = "23co44@aitdgoa.edu.in"; // authenticated user

cron.schedule("0 9 * * *", async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toLocaleDateString("en-CA");

    const docRef = db.collection("calendarDetails").doc(targetDate);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data.events && data.events.trim() !== "") {
        const msg = {
          to: userEmail,
          from: "academiccalendar@noreply.com",
          subject: `Reminder: Event on ${targetDate}`,
          text: `Hi! Just a reminder: ${data.events} is scheduled for tomorrow (${targetDate}).`,
          html: `<p>Hi! 👋<br><strong>Reminder:</strong> ${data.events} is scheduled for <strong>tomorrow (${targetDate})</strong>.</p>`,
        };

        await sgMail.send(msg);
        console.log(`✅ Email sent to ${userEmail} for event on ${targetDate}`);
      } else {
        console.log(`ℹ️ No events found for ${targetDate}`);
      }
    } else {
      console.log(`📭 No document found for ${targetDate}`);
    }
  } catch (error) {
    console.error("❌ Error sending reminder email:", error.message);
  }
});


if (!admin.apps.length) {
  try {
    const serviceAccount = require("./serviceAccountKey.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (initError) {
    console.error("Failed to initialize Firebase Admin:", initError);
    process.exit(1);
  }
}

const db = admin.firestore();

function parseDateString(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }
  return date;
}

/**
 * Saves details for a range of dates given the starting date, recurrence frequency,
 * category and details.
 * For weekly updates, updates for the next 52 weeks.
 * For monthly updates, updates for the next 12 months.
 * For yearly updates, updates for the next 5 years.
 *
 * @param {string} startDateStr - The starting date (in "YYYY-MM-DD" format)
 * @param {string} frequency - "once", "weekly", "monthly", or "yearly"
 * @param {string} category - The category: "calendar" or "events"
 * @param {string} details - The details text
 */
async function saveRecurringDetails(startDateStr, frequency, category, details) {
  let datesToUpdate = [];
  const startDate = parseDateString(startDateStr);

  if (frequency === "once") {
    datesToUpdate.push(startDate);
  } else if (frequency === "weekly") {
    // Update for the next 52 weeks
    for (let i = 0; i < 52; i++) {
      let newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + i * 7);
      datesToUpdate.push(newDate);
    }
  } else if (frequency === "monthly") {
    // Update for the next 12 months
    for (let i = 0; i < 12; i++) {
      let newDate = new Date(startDate);
      newDate.setMonth(startDate.getMonth() + i);
      datesToUpdate.push(newDate);
    }
  } else if (frequency === "yearly") {
    // Update for the next 5 years
    for (let i = 0; i < 5; i++) {
      let newDate = new Date(startDate);
      newDate.setFullYear(startDate.getFullYear() + i);
      datesToUpdate.push(newDate);
    }
  } else {
    throw new Error("Invalid frequency value.");
  }

  for (let d of datesToUpdate) {
    const formattedDate = d.toLocaleDateString("en-CA");
    const docRef = db.collection("calendarDetails").doc(formattedDate);
    let updateData = {};
    if (category === "calendar") {
      updateData.calendar = details;
    } else if (category === "events") {
      updateData.events = details;
    }
    console.log(
      `Updating date ${formattedDate} for category ${category} with details: ${details}`
    );
    await docRef.set(updateData, { merge: true });
  }
}

app.get("/get-details/:date", async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) {
      console.error("No date parameter provided.");
      return res.status(400).json({ error: "Missing date parameter." });
    }

    console.log(`Fetching details for date: ${date}`);
    const docRef = db.collection("calendarDetails").doc(date);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn(
        `No document found for date: ${date}. Returning empty details.`
      );
      return res.status(200).json({ date, calendar: "", events: "" });
    }

    const data = docSnap.data();
    console.log(`Fetched data for ${date}:`, data);
    res.status(200).json({
      date,
      calendar: data.calendar || "",
      events: data.events || "",
    });
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/add-details", async (req, res) => {
  try {
    const { date, category, details, frequency } = req.body;
    if (!date || !category || details === undefined) {
      console.error("Invalid request payload:", req.body);
      return res.status(400).json({
        error: "Request must include date, category, and details.",
      });
    }

    if (category !== "calendar" && category !== "events") {
      console.error("Invalid category provided:", category);
      return res.status(400).json({
        error: "Invalid category. Must be 'calendar' or 'events'.",
      });
    }
    const freq = frequency || "once";

    await saveRecurringDetails(date, freq, category, details);

    res.status(200).json({
      message: `Details updated for ${date} (and related recurring dates) in category ${category} with frequency ${freq}.`,
    });
  } catch (error) {
    console.error("Error updating details:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/upcoming-events", async (req, res) => {
  try {
    const currentDateStr = new Date().toLocaleDateString("en-CA");
    const currentDate = new Date(currentDateStr);

    function parseDate(dateStr) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr);
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const parts = dateStr.split("-");
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }
      return new Date(dateStr);
    }

    const snapshot = await db.collection("calendarDetails").get();
    let upcomingEvents = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.events && data.events.trim() !== "") {
        const eventDate = parseDate(doc.id);
        if (eventDate >= currentDate) {
          upcomingEvents.push({ date: doc.id, events: data.events });
        }
      }
    });

    upcomingEvents.sort((a, b) => parseDate(a.date) - parseDate(b.date));

    res.status(200).json(upcomingEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
