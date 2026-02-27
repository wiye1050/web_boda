import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getPublicConfig } from "@/lib/getPublicConfig";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

function buildSystemPrompt(config: Awaited<ReturnType<typeof getPublicConfig>>): string {
  const faqText = config.faqItems
    .map((f) => `P: ${f.question}\nR: ${f.answer}`)
    .join("\n\n");

  const timelineText = config.timelineItems
    .map((t) => `${t.time} — ${t.title}: ${t.description} (${t.location})`)
    .join("\n");

  const practicalText = config.practicalItems
    .map((p) => `• ${p.title}: ${p.description}`)
    .join("\n");

  return `Eres el asistente de boda de ${config.brandName}. Tu única función es ayudar a los invitados con preguntas sobre la boda. Responde siempre en español, de forma cálida, cercana y concisa. Si te preguntan algo que no tiene que ver con la boda, di amablemente que solo puedes ayudar con dudas sobre el evento.

=== DATOS DE LA BODA ===
Pareja: ${config.brandName}
Fecha: ${config.eventDate}
Horario: ${config.eventTimeRange}
Lugar: ${config.locationName}
Dirección: ${config.locationAddress}
${config.prebodaPlace ? `\nPreboda: ${config.prebodaPlace} — ${config.prebodaTime}` : ""}

=== CONTACTO ===
Email: ${config.contactEmail}
Teléfono: ${config.contactPhone}
${config.contactEmail2 ? `Email 2: ${config.contactEmail2}` : ""}
${config.contactPhone2 ? `Teléfono 2: ${config.contactPhone2}` : ""}

=== CRONOGRAMA DEL DÍA ===
${timelineText}

=== DETALLES PRÁCTICOS ===
${practicalText}

=== PREGUNTAS FRECUENTES ===
${faqText}

=== INSTRUCCIONES ADICIONALES ===
- Si preguntan por el formulario de asistencia, dirígeles a la sección "Confirmar asistencia" de la web.
- Si preguntan por alojamiento, diles que hay una sección de alojamientos en la web con opciones recomendadas.
- Si preguntan por regalos, diles que hay una sección de regalos en la web.
- No inventes información que no aparezca en estos datos.
- Usa un tono cálido y festivo, como si fueras un amigo de los novios.`;
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
      model: "gemini-2.0-flash",
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
