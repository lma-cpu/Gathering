import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { eq } from "drizzle-orm";
import { db } from "./src/db/index.js";
import { hangoutSessions, friendResponses, finalItineraries } from "./src/db/schema.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CREATE SESSION
  app.post("/api/sessions", async (req, res) => {
    try {
      const { creatorName, city, title, dateRange } = req.body;
      const [session] = await db.insert(hangoutSessions).values({
        creatorName,
        city,
        title,
        dateRange,
        status: 'collecting'
      }).returning();
      res.json(session);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // GET SESSION
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [session] = await db.select().from(hangoutSessions).where(eq(hangoutSessions.id, id));
      if (!session) return res.status(404).json({ error: "Not found" });
      
      const responses = await db.select().from(friendResponses).where(eq(friendResponses.sessionId, id));
      const [result] = await db.select().from(finalItineraries).where(eq(finalItineraries.sessionId, id));
      res.json({ session, responses, result });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to load session" });
    }
  });

  // POST RESPONSE
  app.post("/api/sessions/:id/responses", async (req, res) => {
    try {
      const { id } = req.params;
      const { friendName, availableSlots, chosenVibes } = req.body;
      const [response] = await db.insert(friendResponses).values({
        sessionId: id,
        friendName,
        availableSlots,
        chosenVibes
      }).returning();
      res.json(response);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  // SYNTHESIZE
  app.post("/api/sessions/:id/synthesize", async (req, res) => {
    try {
      const { id } = req.params;
      
      const [session] = await db.select().from(hangoutSessions).where(eq(hangoutSessions.id, id));
      if (!session) return res.status(404).json({ error: "Session not found" });

      const responses = await db.select().from(friendResponses).where(eq(friendResponses.sessionId, id));

      // 1. Fetch Weather
      let weatherForecast = "Sunny, 75Â°F (Fallback data)";
      if (OPENWEATHER_API_KEY) {
        try {
          const wRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(session.city)}&appid=${OPENWEATHER_API_KEY}&units=imperial`);
          if (wRes.ok) {
            const data = await wRes.json();
            weatherForecast = data.list?.[0]?.weather?.[0]?.description + `, ` + data.list?.[0]?.main?.temp + `Â°F`;
          }
        } catch (we) {
          console.error("Weather fetch failed", we);
        }
      }

      // 2. Format Context for Gemini
      const aiPrompt = `
      You are an expert event coordinator in ${session.city}.
      The event title is: ${session.title || 'Untitled Hangout'}.
      The date range requested: ${session.dateRange || 'None'}.
      
      Responses from friends:
      ${responses.map(r => `- ${r.friendName}: Vibe preferences: ${r.chosenVibes.join(', ')}. Available slots: ${r.availableSlots.join(', ')}`).join('\n')}
      
      Weather in ${session.city}: ${weatherForecast}

      Your task: Pick the absolute best date, time, and specific real-world venue in ${session.city} that satisfies the most people based on the vibes and availability.
      
      Output exactly a JSON object conforming to this schema (no markdown blocks, just raw JSON):
      {
        "selectedDate": "Short readable date (e.g. Saturday, Oct 24)",
        "selectedTime": "Time info (e.g. 7:00 PM)",
        "venueName": "Real venue name",
        "venueAddress": "Approximate address or neighborhood",
        "aiReasoning": "1 short paragraph rationale"
      }`;

      // 3. Call Gemini
      const aiRes = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: aiPrompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = aiRes.text || "{}";
      const parsed = JSON.parse(responseText.trim());

      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${parsed.venueName} ${parsed.venueAddress} ${session.city}`)}`;

      // 4. Save to final_itineraries
      const [itinerary] = await db.insert(finalItineraries).values({
        sessionId: id,
        selectedDate: parsed.selectedDate || "TBD",
        selectedTime: parsed.selectedTime || "TBD",
        venueName: parsed.venueName || "TBD",
        venueAddress: parsed.venueAddress || "TBD",
        googleMapsUrl: mapUrl,
        weatherCondition: weatherForecast,
        aiReasoning: parsed.aiReasoning || "Organized via GatherMin."
      }).returning();

      // 5. Flip status
      await db.update(hangoutSessions).set({ status: 'finalized' }).where(eq(hangoutSessions.id, id));

      res.json({ itinerary, status: 'finalized' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to synthesize" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
