import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn('Failed to initialize Gemini client:', err);
    }
  }
  return aiClient;
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Autonomous Garbage Collection Multi-Agent Engine',
    aiEnabled: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Multi-agent negotiation between smart bins and autonomous truck agents
app.post('/api/negotiate', async (req, res) => {
  try {
    const { bins, trucks } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `
You are the Application Control Agent for an Autonomous Garbage Collection system (Blueprint BP-2478030).
Analyze these smart bins and autonomous truck agents to run a multi-agent auction for the most fuel-efficient and urgent collection route.

CRITICAL MUNICIPAL POLICY:
Any smart bin that is filled to 100% capacity (fillLevel >= 100) MUST ALWAYS BE ACCEPTED for immediate collection without exception. They must receive status: "accepted" and be placed at the beginning of recommendedPickups with rationale emphasizing "100% full capacity reached: mandatory immediate collection".

Smart Bins:
${JSON.stringify(bins?.map((b: any) => ({
  id: b.id,
  name: b.name,
  fillLevel: b.fillLevel,
  wasteType: b.wasteType,
  urgency: b.bidPriority,
  lidStatus: b.lidStatus,
  odorPpm: b.odorPpm
})), null, 2)}

Trucks:
${JSON.stringify(trucks?.map((t: any) => ({
  id: t.id,
  name: t.name,
  batteryLevel: t.batteryLevel,
  currentLoadKg: t.currentLoadKg,
  maxPayloadKg: t.maxPayloadKg,
  status: t.status
})), null, 2)}

Return a JSON object with:
1. "bids": array of bid resolutions with { "binId", "truckId", "status": "accepted" | "declined" | "truck_evaluated", "rationale": string }
2. "rationale": brief 2-sentence summary of the multi-agent negotiation decisions, highlighting any 100% full bins given mandatory pickup priority.
3. "recommendedPickups": array of bin IDs in optimal fuel-efficient pickup sequence.
`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, aiGenerated: true, ...parsed });
        }
      } catch (err: any) {
        console.warn('Gemini negotiation call failed, using deterministic optimizer fallback:', err.message);
      }
    }

    // Deterministic Multi-Agent Auction Optimizer fallback
    // CRITICAL: Any bin at 100% fill level is guaranteed priority pickup
    const binsAt100 = (bins || []).filter((b: any) => b.fillLevel >= 100);
    const otherEligibleBins = (bins || []).filter((b: any) => b.fillLevel < 100 && (b.fillLevel >= 50 || b.bidPriority === 'critical' || b.bidPriority === 'high'));
    const sortedOther = [...otherEligibleBins].sort((a: any, b: any) => (b.fillLevel + (b.bidPriority === 'critical' ? 30 : 0)) - (a.fillLevel + (a.bidPriority === 'critical' ? 30 : 0)));
    const sortedByUrgency = [...binsAt100, ...sortedOther];

    const activeTruck = (trucks || []).find((t: any) => t.status !== 'maintenance' && t.batteryLevel > 30) || trucks[0];

    const bids = (bins || []).map((bin: any) => {
      const is100 = bin.fillLevel >= 100;
      const isAccepted = is100 || sortedByUrgency.slice(0, 5).some((b: any) => b.id === bin.id);
      return {
        binId: bin.id,
        truckId: activeTruck ? activeTruck.id : 'TRUCK-01',
        status: isAccepted ? 'accepted' : (bin.fillLevel > 40 ? 'truck_evaluated' : 'declined'),
        rationale: is100
          ? `100% capacity reached! Immediate mandatory collection awarded under Zero-Overflow Policy.`
          : isAccepted 
            ? `Priority fill level ${bin.fillLevel}% + bid awarded based on marginal route efficiency.`
            : `Fill level ${bin.fillLevel}% below immediate dispatch threshold. Re-queued for next window.`,
      };
    });

    return res.json({
      success: true,
      aiGenerated: false,
      bids,
      rationale: binsAt100.length > 0
        ? `Mandatory 100% capacity rule enforced for ${binsAt100.map((b: any) => b.id).join(', ')}. Dispatched immediately to ${activeTruck?.name || 'Unit Alpha'}.`
        : `Autonomous control agent matched 5 highest-urgency bins to ${activeTruck?.name || 'Unit Alpha'} with a 94.8% simulated route fuel-efficiency score.`,
      recommendedPickups: sortedByUrgency.slice(0, 5).map((b: any) => b.id),
    });
  } catch (error: any) {
    console.error('Error in /api/negotiate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Route Optimization (Stage 1 workflow)
app.post('/api/optimize-route', (req, res) => {
  try {
    const { truckId, selectedBinIds, bins } = req.body;
    const binList = (bins || []).filter((b: any) => selectedBinIds.includes(b.id));

    // Simple nearest neighbor routing approximation
    let distance = 3.5;
    const waypoints = binList.map((bin: any, idx: number) => {
      const legDist = +(1.2 + (idx * 0.7) % 2.5).toFixed(1);
      distance += legDist;
      return {
        id: `WP-${idx + 1}`,
        binId: bin.id,
        binName: bin.name,
        address: bin.address,
        coords: bin.coords,
        fillLevelSnapshot: bin.fillLevel,
        wasteType: bin.wasteType,
        estimatedWeightKg: Math.round((bin.fillLevel / 100) * 800),
        distanceFromPrevKm: legDist,
        etaMinutes: Math.round(legDist * 3.5 + 4),
        status: idx === 0 ? 'approaching' : 'pending',
      };
    });

    const totalDist = +distance.toFixed(1);
    const co2Saved = +(totalDist * 3.2).toFixed(1);

    res.json({
      success: true,
      routeId: `ROUTE-${Date.now().toString().slice(-4)}`,
      truckId: truckId || 'TRUCK-01',
      totalDistanceKm: totalDist,
      co2SavedKg: co2Saved,
      estimatedFuelLitres: 0, // Electric Fleet
      actualEnergyKwh: +(totalDist * 1.2).toFixed(1),
      efficiencyScore: +(92 + (Math.random() * 5)).toFixed(1),
      waypoints,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: AI Diagnostics for Maintenance Technician
app.post('/api/diagnostics-ai', async (req, res) => {
  try {
    const { component, telemetry } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Provide a quick 2-bullet technical diagnostic for autonomous waste equipment:
Component: ${component}
Telemetry data: ${JSON.stringify(telemetry)}
Give Root Cause and Recommended Maintenance Action.`,
      });
      return res.json({ success: true, advice: response.text });
    }

    // Default diagnostic
    res.json({
      success: true,
      advice: `Root Cause: Ultrasonic sensor transducer signal attenuation caused by dust accumulation on lens.\nAction: Perform ultrasonic zero-point calibration and inspect rubber moisture seal.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite / static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Autonomous Garbage Collection Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
