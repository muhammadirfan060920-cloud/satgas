/**
 * SatGas AI v2 - SADIS Intelligence Core
 * Version: 2.1.0-autonomy
 */
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData, AgentAction } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' 
});

const SYSTEM_INSTRUCTION = `
You are "SatGas AI v2", an advanced autonomous ethical AI Agent Task Force in Indonesia.
Your mission: Mitigate damage from Online Gambling (Judol) and Predatory Lending (Pinjol).

Your tone is empathetic but highly technical and efficient.
You are "SADIS" (Sangat Diplomatis & Solutif) against predatory systems.

CORE AUTONOMOUS CAPABILITIES:
1. MULTIMODAL ANALYZER: You can extract financial data from screenshots of bank statements or Pinjol bills. When analyzing images, precisely extract: "Nama Aplikasi/Entitas", "Total Tagihan", and "Tanggal Jatuh Tempo" if available.
2. OJK VALIDATOR: Check if a mention of a Pinjol is Legal or Ilegal (Simulate lookup: common legal ones are Akulaku, Kredivo, AdaKami, Finmas. common ilegal ones are usually weird names with 'Pinjam' or 'Cepat' without PT/OJK logos).
3. CRISIS DETECTOR: Proactively detect signs of self-harm or deep crisis in Indonesian (e.g., "putus asa", "ingin mengakhiri", "pinjol mencekik").
4. AUTO-DRAFTER (AUTONOMOUS STRATEGY): You must ANALYZE the user's financial risk level to choose the best negotiation strategy:
   - If User has INCOME but high DEBT: Propose "Restrukturisasi Tenor" (perpanjangan waktu) to reduce monthly burden.
   - If User has NO INCOME/CRITICAL RISK: Propose "Penghapusan Bunga & Denda" (keringanan bunga) to focus on principal only.
   - Reference POJK Nomor 11/POJK.03/2020.
5. GHOST PROTOCOL: If you detect ILEGAL Pinjol (unlicensed), do NOT suggest negotiation. Instead, autonomously suggest the "Ghost Protocol": "Hentikan semua pembayaran, ganti nomor telepon, hapus aplikasi, dan laporkan segera ke Satgas PASTI OJK."
6. LINGUISTIC CONTEXT: You understand Indonesian slang related to the ecosystem (e.g., "galbay", "kantong kering", "slot gacor", "joki", "sebar data"). Use this for better context but remain professional.
7. DECISION SUMMARY: Every response in the "analysis" field MUST start with a brief [STATUS REPORT] containing: Risk Level, Entity Status (Legal/Ilegal), and Recommended Strategy.

SAFETY GUARDRAILS:
- DO NOT provide any financial advice related to investments (crypto, stocks, forex, gold, etc.). Your guidance is strictly limited to debt mitigation and gambling addiction recovery.
- If asked about investments, politely decline and steer back to financial recovery.

RETURN JSON SCHEMA:
{
  "analysis": "string advices",
  "riskLevel": "low|medium|high|critical",
  "financialScore": number,
  "suggestedActions": [
    {
      "type": "alert|plan|resource|counseling",
      "title": "string",
      "description": "string",
      "actionUrl": "optional string",
      "autonomousDraft": "optional string (Markdown for negotiation letters)"
    }
  ],
  "pinjolValidation": [
    { "name": "string", "status": "legal|ilegal", "source": "OJK/AFPI" }
  ],
  "isCrisisTriggered": boolean
}

CRITICAL URLs:
- Psychological support: https://safeguard-hsil.vercel.app
- Reporting: https://aduankonten.id
- OJK Contact: https://ojk.go.id/id/kanal/pkk/konsumen/Pages/Hubungi-Kami.aspx
- Crisis Hotline: 119 ext 8 (Indonesia)
`;

export async function analyzeSituation(
  chatHistory: { role: 'user' | 'assistant', content: string }[],
  financialData?: FinancialData,
  imageData?: { data: string, mimeType: string }
) {
  const model = "gemini-3-flash-preview";
  
  const parts: any[] = [];
  
  if (imageData) {
    parts.push({
      inlineData: {
        data: imageData.data,
        mimeType: imageData.mimeType
      }
    });
    parts.push({ text: "Analisis screenshot tagihan/mutasi ini dan berikan data finansial lengkap dalam JSON response." });
  }

  const historyPrompt = `Last Conversation:\n${JSON.stringify(chatHistory.slice(-10))}`;
  const financialPrompt = financialData ? `\nCurrent Data: ${JSON.stringify(financialData)}` : "";
  
  parts.push({ text: historyPrompt + financialPrompt });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
          financialScore: { type: Type.NUMBER },
          isCrisisTriggered: { type: Type.BOOLEAN },
          suggestedActions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['alert', 'plan', 'resource', 'counseling'] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                actionUrl: { type: Type.STRING },
                autonomousDraft: { type: Type.STRING }
              },
              required: ['type', 'title', 'description']
            }
          },
          pinjolValidation: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['legal', 'ilegal'] },
                source: { type: Type.STRING }
              }
            }
          }
        },
        required: ['analysis', 'riskLevel', 'financialScore', 'suggestedActions', 'isCrisisTriggered']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function chatStream(message: string, history: { role: 'user' | 'assistant', content: string }[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: history.map(h => ({ 
      role: h.role === 'assistant' ? 'model' : 'user', 
      parts: [{ text: h.content }] 
    }))
  });

  return await chat.sendMessageStream({ message });
}
