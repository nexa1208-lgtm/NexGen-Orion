import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Heuristic fallback analyzer for emergency safety & offline resilience
const heuristicAnalyzeReport = (report: any) => {
  const text = `${report.title || ''} ${report.description || ''}`.toLowerCase();
  const indicators: string[] = [];
  let score = 5;

  if (text.includes('test') || text.includes('prank') || text.includes('fake') || text.includes('joke')) {
    score += 65;
    indicators.push('Spam keyword match detected in incident description');
  }
  if ((report.title || '').length < 6 && (report.description || '').length < 15) {
    score += 25;
    indicators.push('Extremely brief description lacking casualty or condition specifics');
  }
  if (report.peopleAffected > 50 && !text.includes('collapse') && !text.includes('train') && !text.includes('bus') && !text.includes('flood')) {
    score += 30;
    indicators.push('Disproportionately high casualty claim inconsistent with single incident scope');
  }
  if (!report.location || report.location.length < 5) {
    score += 20;
    indicators.push('Underspecified landmark or intersection');
  }

  score = Math.min(score, 95);

  let classification = 'Normal';
  let recommendation = 'Dispatch nearest available unit standard priority.';
  if (score >= 60) {
    classification = 'Escalated to Police';
    recommendation = 'Flagged for police dispatch desk verification; confirm caller identity while unit pre-stages.';
  } else if (score >= 35) {
    classification = 'Suspicious';
    recommendation = 'Request 911/112 operator callback to verify visible hazards before full team commitment.';
  } else if (score >= 15) {
    classification = 'Needs Verification';
    recommendation = 'Dispatch primary responder; dispatcher to verify contact number.';
  }

  return {
    incidentId: report.id || 'INC-TEMP',
    suspiciousRiskScore: score,
    riskClassification: classification,
    suspiciousIndicators: indicators.length > 0 ? indicators : ['Clean submission, clear landmark provided'],
    duplicateReportMatch: false,
    informationConsistency: score > 40 ? 'Moderate - conflicting details detected' : 'High - consistent situational reporting',
    verificationRecommendation: recommendation,
    explanation: indicators.length > 0
      ? `Analysis flagged: ${indicators.join(', ')}.`
      : 'Report shows coherent description, credible casualty count, and valid landmark coordinates.',
    isAiGenerated: false
  };
};

// API Endpoint for AI-Powered Suspicious Emergency Report Detection
app.post('/api/gemini/analyze-suspicious', async (req, res) => {
  try {
    const report = req.body;
    if (!report) {
      return res.status(400).json({ error: 'Missing report payload' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback to local heuristic analyzer
      const result = heuristicAnalyzeReport(report);
      return res.json(result);
    }

    const prompt = `Analyze this emergency incident report submitted to an emergency response command center for potential spam, prank, false alarm, inconsistency, or malicious reporting:
Incident ID: ${report.id || 'N/A'}
Title: ${report.title}
Category: ${report.category}
Description: ${report.description}
Location: ${report.location}
People Affected: ${report.peopleAffected}
Coordinates: ${JSON.stringify(report.coordinates || {})}
Caller Identity: ${report.citizenName || 'Verified Citizen'}

CRITICAL EMERGENCY SAFETY RULE: Never reject genuine emergencies. Suspicious flags ensure human review while keeping life-saving response active.

Provide an objective risk assessment:
- suspiciousRiskScore: 0 to 100
- riskClassification: "Normal" | "Needs Verification" | "Suspicious" | "Escalated to Police"
- suspiciousIndicators: array of specific red flags (e.g., prank terms, conflicting facts, extreme implausible casualty claims) or note none.
- duplicateReportMatch: boolean (true if identical nearby incident likely exists)
- informationConsistency: description of detail coherence
- verificationRecommendation: actionable guidance for dispatchers
- explanation: concise technical justification`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              incidentId: { type: Type.STRING },
              suspiciousRiskScore: { type: Type.NUMBER },
              riskClassification: {
                type: Type.STRING,
                description: 'One of: Normal, Needs Verification, Suspicious, Escalated to Police'
              },
              suspiciousIndicators: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              duplicateReportMatch: { type: Type.BOOLEAN },
              informationConsistency: { type: Type.STRING },
              verificationRecommendation: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: [
              'incidentId',
              'suspiciousRiskScore',
              'riskClassification',
              'suspiciousIndicators',
              'duplicateReportMatch',
              'informationConsistency',
              'verificationRecommendation',
              'explanation'
            ]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(text);
      return res.json({
        ...parsed,
        incidentId: report.id || parsed.incidentId || 'INC-2026',
        isAiGenerated: true
      });
    } catch (genError: any) {
      console.warn('Gemini generateContent error, falling back to heuristics:', genError.message);
      const fallback = heuristicAnalyzeReport(report);
      return res.json(fallback);
    }
  } catch (err: any) {
    console.error('API Error in /api/gemini/analyze-suspicious:', err);
    return res.status(500).json({ error: 'Internal server error analyzing report' });
  }
});

// Mount Vite in dev mode or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`RESQNET Command Server running on port ${PORT}`);
  });
}

startServer();
