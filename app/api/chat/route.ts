import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getPublicConfig } from "@/lib/getPublicConfig";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

function buildSystemPrompt(config: Awaited<ReturnType<typeof getPublicConfig>>): string {
  const practicalText = config.practicalItems
    .map((p) => `• ${p.title}: ${p.description}`)
    .join("\n");

  const now = new Date();
  const weddingDate = new Date(2026, 8, 12); // Sep 12, 2026
  const diffTime = weddingDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let countdownMsg = "";
  if (diffDays > 0) countdownMsg = `Faltan ${diffDays} días para el gran día.`;
  else if (diffDays === 0) countdownMsg = "¡Hoy es el gran día!";
  else countdownMsg = "La boda ya se ha celebrado.";

  return `Eres el asistente de boda de ${config.brandName}. Responde siempre en español, de forma cálida y cercana, pero breve y profesional. No uses demasiados emojis. ${countdownMsg}

=== DATOS CLAVE ===
Boda: Sábado 12 de septiembre de 2026 (Lugar: ${config.locationName}).
Preboda: Viernes 11 de septiembre (19:30h, Casino Rooftop). Es un brindis informal y toma de contacto. ¡Habrá sorpresas!

=== VIAJES Y CÓMO LLEGAR ===
- Desde Ponferrada: Estamos al lado, ¡no tienes excusa! Habrá bus para volver.
- Desde Asturias/Galicia: La mejor opción es coche por la A-6.
- Desde Madrid/Albacete: Lo más cómodo es el AVE hasta León y luego bus/coche, o coche directo por la A-6 (unas 3.5 - 4 horas).
- Desde Mallorca/Barcelona: Vuelo a Santiago, Coruña o Asturias y luego coche de alquiler, o vuelo a Madrid + AVE/Coche.

=== LO QUE NO SABEMOS (SORPRESAS) ===
- Si preguntan por el MENÚ, el DJ, el CRONOGRAMA detallado o detalles específicos no listados aquí: Responde que esos detalles son una SORPRESA que los novios tienen guardada con mucho cariño.

=== DETALLES IMPORTANTES ===
- Dress Code: Elegante y cómodo (evitar blanco/marfil).
- Niños: Evento solo para adultos. Ayudamos con referencias de canguros si hace falta.
- Confirmación: Antes del 15 de agosto de 2025 en la sección "Confirmar asistencia".
- Regalos: Vuestra presencia es lo más importante. Datos bancarios en la sección "Regalos" de la web.

=== OTROS DETALLES ===
${practicalText}

=== INSTRUCCIONES DE PERSONALIDAD ===
- Sé conciso: Respuestas de máximo 2-3 frases si es posible.
- Emojis: Usa uno o ninguno por mensaje.
- Tono: Amable y servicial, con un toque informal pero no excesivamente bromista.
- Si no sabes algo, remíteles a los novios. No inventes datos.`;
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
    const config = await getPublicConfig();
    const systemPrompt = buildSystemPrompt(config);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: history.slice(-10), // Keep last 10 messages for context
    });

    const result = await chat.sendMessageStream(message.trim());

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Error al procesar tu pregunta. Inténtalo de nuevo." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
