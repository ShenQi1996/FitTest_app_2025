// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const crypto = require("crypto");

// Initialize the Admin SDK so we can write to Firestore
admin.initializeApp();

/**
 * testCalendlyAuth
 * A quick endpoint to verify your Calendly PAT is working.
 */
exports.testCalendlyAuth = functions
  .runWith({ platform: "gcfv1" })
  .https.onRequest(async (req, res) => {
    try {
      const token = functions.config().calendly.token;
      const resp = await fetch("https://api.calendly.com/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error(`Calendly API returned ${resp.status}`);
      const data = await resp.json();
      res.status(200).json(data);
    } catch (err) {
      console.error("testCalendlyAuth error:", err);
      res.status(500).send({ error: err.message });
    }
  });

/**
 * calendlyWebhook
 * Receives booking (invitee.created) and cancellation (invitee.canceled)
 * events from Calendly and writes them into Firestore.
 */
exports.calendlyWebhook = functions
  .runWith({ platform: "gcfv1" })
  .https.onRequest(async (req, res) => {
    try {
      // 1) Verify the signature
      const signingSecret = functions.config().calendly.signing_secret;
      const signature = req.headers["calendly-webhook-signature"];
      const bodyString = JSON.stringify(req.body);
      const expectedHmac = crypto
        .createHmac("sha256", signingSecret)
        .update(bodyString)
        .digest("hex");
      if (signature !== expectedHmac) {
        console.error("Invalid signature", signature, expectedHmac);
        return res.status(401).send("Unauthorized");
      }

      // 2) Unpack the event payload
      const { event, payload } = req.body;
      const invitee = payload.invitee;

      // 3) Prepare the Firestore document
      const doc = {
        email: invitee.email,
        name: invitee.name,
        eventUri: payload.event,
        startTime: invitee.event_start_time,
        endTime: invitee.event_end_time,
        status: event === "invitee.canceled" ? "canceled" : "booked",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // 4) Write it
      await admin.firestore().collection("appointments").add(doc);
      console.log("Saved appointment:", doc);

      // 5) Respond OK
      res.status(200).send("OK");
    } catch (err) {
      console.error("calendlyWebhook error:", err);
      res.status(500).send({ error: err.message });
    }
  });

/**
 * syncCalendlyEvents
 * Runs every 5 minutes, fetches your scheduled events,
 * and upserts them into Firestore under "appointments".
 */
exports.syncCalendlyEvents = functions
  .runWith({ platform: "gcfv1" })
  .pubsub.schedule("every 5 minutes")
  .onRun(async () => {
    try {
      const token = functions.config().calendly.token;
      const headers = { Authorization: `Bearer ${token}` };
      const db = admin.firestore();
      const batch = db.batch();

      // 1) Get your user URI
      const userRes = await fetch("https://api.calendly.com/users/me", {
        headers,
      });
      if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
      const { resource: user } = await userRes.json();

      // 2) Get scheduled events for that user
      const encodedUser = encodeURIComponent(user.uri);
      const eventsUrl =
        `https://api.calendly.com/scheduled_events` + `?user=${encodedUser}`;
      console.log("🔍 Fetching events from:", eventsUrl);

      const evRes = await fetch(eventsUrl, { headers });
      if (!evRes.ok) {
        const body = await evRes.text().catch(() => "");
        throw new Error(`Events fetch failed ${evRes.status}: ${body}`);
      }
      const evJson = await evRes.json();
      const events = evJson.collection || [];
      console.log(`🔍 Retrieved ${events.length} events`);

      // 3) For each event, fetch its invitees and queue up the write
      await Promise.all(
        events.map(async evt => {
          const eventId = evt.uri.split("/").pop();
          let email = null,
            name = null;

          // Fetch invitees list
          try {
            const invRes = await fetch(`${evt.uri}/invitees`, { headers });
            if (invRes.ok) {
              const invJson = await invRes.json();
              const invs = invJson.collection || [];
              // ✔️ grab the invitee directly—no `.resource`
              const firstInv = invs[0];
              email = firstInv?.email ?? null;
              name = firstInv?.name ?? null;
            } else {
              console.warn(
                `Invitees fetch failed for ${evt.uri}: ${invRes.status}`
              );
            }
          } catch (e) {
            console.warn(`Invitees fetch error for ${evt.uri}:`, e);
          }

          // Queue up the Firestore upsert
          const ref = db.collection("appointments").doc(eventId);
          batch.set(
            ref,
            {
              email,
              name,
              eventUri: evt.uri,
              startTime: evt.start_time,
              endTime: evt.end_time,
              status: evt.status,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        })
      );

      // 4) Commit all at once
      await batch.commit();
      console.log(
        `✅ Synced ${events.length} appointments with invitee details.`
      );
    } catch (err) {
      console.error("❌ syncCalendlyEvents error:", err.message);
    }
  });
