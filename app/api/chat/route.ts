import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getPublicConfig } from "@/lib/getPublicConfig";
import { getAccommodations } from "@/lib/getAccommodations";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

function buildSystemPrompt(
  config: Awaited<ReturnType<typeof getPublicConfig>>,
  accommodations: Awaited<ReturnType<typeof getAccommodations>>
): string {
  const practicalText = config.practicalItems
    .map((p) => `• ${p.title}: ${p.description}`)
    .join("\n");

  const accommodationText = accommodations
    .map((a) => {
      let desc = `• ${a.name} (${a.type})`;
      if (a.distance) desc += ` - A ${a.distance} de la finca`;
      if (a.hasBlock) desc += ` [ RECOMIENDAN ESTE ESPECIALMENTE - Tienen reserva de bloque ]`;
      if (a.notes) desc += `. Nota: ${a.notes}`;
      if (a.link) desc += `. Enlace: ${a.link}`;
      return desc;
    })
    .join("\n");

  let faqText = "";
  try {
    const faqs = JSON.parse(config.faqItems || "[]");
    if (Array.isArray(faqs)) {
      faqText = faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
    }
  } catch (e) {
    console.error("Error parsing FAQs for AI", e);
  }

  const now = new Date();
  const weddingDateParts = config.ceremonyDateISO.split("-");
  const weddingDate = new Date(
    parseInt(weddingDateParts[0]),
    parseInt(weddingDateParts[1]) - 1,
    parseInt(weddingDateParts[2])
  );
  const diffTime = weddingDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let countdownMsg = "";
  if (diffDays > 0) countdownMsg = `Faltan ${diffDays} días para el gran día.`;
  else if (diffDays === 0) countdownMsg = "¡Hoy es el gran día!";
  else countdownMsg = "La boda ya se ha celebrado.";

  return `Eres el asistente de boda de ${config.brandName}. Responde siempre en español, de forma cálida y cercana, pero breve y profesional. No uses demasiados emojis. ${countdownMsg}

=== DATOS CLAVE ===
Boda: ${config.eventDate} (Lugar: ${config.locationName}).
Preboda: ${config.prebodaPlace} (Viernes anterior). Dirección: ${config.prebodaAddress}. Es un brindis informal y toma de contacto. ¡Habrá sorpresas!

=== ALOJAMIENTO RECOMENDADO ===
Alba y Guille recomiendan especialmente los que tienen reserva de bloque. Aquí tienes la lista completa de opciones que ellos han seleccionado:
${accommodationText || "Los novios añadirán recomendaciones pronto."}

=== VIAJES Y CÓMO LLEGAR ===
- Desde Ponferrada: Estamos al lado, ¡no tienes excusa! Habrá bus para volver.
- Desde Asturias/Galicia: La mejor opción es coche por la A-6.
- Desde Madrid/Albacete: Lo más cómodo es el AVE hasta León y luego bus/coche, o coche directo por la A-6 (unas 3.5 - 4 horas).
- Desde Mallorca/Barcelona: Vuelo a Santiago, Coruña o Asturias y luego coche de alquiler, o vuelo a Madrid + AVE/Coche.

=== LO QUE NO SABEMOS (SORPRESAS) ===
- Si preguntan por el MENÚ, el DJ, el CRONOGRAMA detallado o detalles específicos no listados aquí: Responde que esos detalles son una SORPRESA que los novios tienen guardada con mucho cariño.

=== DETALLES IMPORTANTES ===
- Dress Code: Elegante (evitar blanco/marfil). Los hombres no necesitan frac, basta con traje.
- Niños: La boda está planteada como un evento orientado a adultos, pero los niños son bienvenidos si es necesario por motivos personales. Si preguntan, diles que pueden venir y que lo indiquen en el formulario de confirmación. NO lo menciones de forma proactiva si no preguntan.
- Confirmación: Antes del 15 de agosto de 2026 en la sección "Confirmar asistencia" de la web.
- Regalos: Vuestra presencia es lo más importante. Datos bancarios en la sección "Regalos" de la web.

=== PREGUNTAS FRECUENTES (CONOCIMIENTO INTERNO) ===
${faqText}

=== OTROS DETALLES ===
${practicalText}

=== INSTRUCCIONES DE PERSONALIDAD ===
${config.aiPersonalityInstruction || "Sé conciso, amable y servicial. Responde siempre en español."}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Chatbot no configurado" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { message: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Petición inválida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { message, history = [] } = body;

  if (!message || typeof message !== "string" || message.trim().length > 500) {
    return new Response(JSON.stringify({ error: "Mensaje inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const [config, accommodations] = await Promise.all([
      getPublicConfig(),
      getAccommodations(),
    ]);
    const systemPrompt = buildSystemPrompt(config, accommodations);

    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
    let response: Response | null = null;
    let lastError = null;

    for (const modelId of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelId}:streamGenerateContent?alt=sse&key=${apiKey}`;
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `INSTRUCCIONES DE SISTEMA (Actúa según lo siguiente):\n${systemPrompt}` }]
              },
              {
                role: "model",
                parts: [{ text: "Entendido. Soy el asistente de Alba & Guille y responderé siguiendo vuestras instrucciones." }]
              },
              ...history.map(h => ({
                role: h.role === "model" ? "model" : "user",
                parts: [{ text: h.parts[0].text }]
              })),
              { role: "user", parts: [{ text: message.trim() }] }
            ],
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.7,
            }
          })
        });

        if (response.ok) break;
        
        const errText = await response.text();
        console.warn(`Model ${modelId} failed: ${errText}`);
        lastError = new Error(`Gemini API error (${modelId}): ${errText}`);
        response = null;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (!response || !response.ok) {
        throw lastError || new Error("No se pudo conectar con ningún modelo de Gemini.");
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response?.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const content = line.slice(6).trim();
                  if (content === "[DONE]") continue;
                  
                  const data = JSON.parse(content);
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {}
              }
            }
          }
          controller.close();
        } catch (e: any) {
          console.error("Stream reader error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(process.cwd(), 'scratch', 'api-error.log');
    const errorDetail = `[${new Date().toISOString()}] Chat error: ${error.stack || error.message || error}\n`;
    try {
      if (!fs.existsSync(path.join(process.cwd(), 'scratch'))) fs.mkdirSync(path.join(process.cwd(), 'scratch'));
      fs.appendFileSync(logPath, errorDetail);
    } catch (e) {}

    console.error("Chat error detail:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error del asistente.",
        details: error.message || String(error)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
