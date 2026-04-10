"use server";

import { addRsvpToCalendar } from "@/lib/googleApi";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase-admin";

interface EmailData {
  fullName: string;
  email: string;
  guests: number;
  attendance: "si" | "no";
  transport: "si" | "no";
  rsvpId?: string; // Permitir asociar el error a un RSVP específico
}

export async function sendConfirmationEmail(data: EmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn("Skipping email: GMAIL_USER or GMAIL_PASS not set.");
    await adminDb.collection("system_logs").add({
      type: "email_error",
      message: "GMAIL_USER or GMAIL_PASS not set in environment variables.",
      timestamp: new Date(),
      rsvpId: data.rsvpId || "unknown",
      guestName: data.fullName
    });
    return { success: false, error: "Missing credentials" };
  }

  if (!data.email || !data.email.includes("@")) {
    return { success: false, error: "Invalid email" };
  }

  try {
    // Google App Passwords sometimes have spaces; remove them to be safe
    const cleanPass = process.env.GMAIL_PASS.replace(/\s+/g, "");
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const subject = "Confirmación recibida - Boda Alba & Guille";
    const transportText = data.transport === "si" ? "Sí" : "No";
    
    const guestHtml = `
      <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #e5e5e5; border-radius: 8px;">
        <h2 style="color: #d4a373; text-transform: uppercase; letter-spacing: 2px;">¡Gracias ${data.fullName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
          Hemos recibido correctamente tu confirmación para nuestra boda.
        </p>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: left;">
          <p style="margin: 5px 0;"><strong>Asistencia:</strong> ${data.attendance === "si" ? "Sí, asistiré" : "No podré asistir"}</p>
          ${data.attendance === "si" ? `<p style="margin: 5px 0;"><strong>Número de adultos:</strong> ${data.guests}</p>` : ""}
          ${data.attendance === "si" ? `<p style="margin: 5px 0;"><strong>Transporte (Bus):</strong> ${transportText}</p>` : ""}
        </div>
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Si necesitas modificar algo, escríbenos directamente.
          <br>
          ¡Nos vemos pronto!
        </p>
        <p style="margin-top: 40px; font-size: 12px; color: #999;">
          Alba & Guille · 12 de Septiembre 2026
        </p>
      </div>
    `;

    const adminHtml = `
      <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
        <h2 style="color: #4a5568;">📢 Nueva Confirmación: ${data.fullName}</h2>
        <p><strong>Asistencia:</strong> <span style="color: ${data.attendance === 'si' ? 'green' : 'red'}; font-weight: bold;">${data.attendance.toUpperCase()}</span></p>
        <p><strong>Email:</strong> ${data.email}</p>
        ${data.attendance === "si" ? `<p><strong>Acompañantes totales:</strong> ${data.guests}</p>` : ""}
        ${data.attendance === "si" ? `<p><strong>Requiere Bus:</strong> ${transportText}</p>` : ""}
        <p style="font-size: 12px; color: #999; margin-top: 20px;">Revisa el panel de Firebase para ver detalles como menús especiales o canciones.</p>
      </div>
    `;

    const guestEmailPromise = transporter.sendMail({
      from: `"Boda Alba & Guille" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject,
      html: guestHtml,
    });

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
    const adminEmailPromise = adminEmails ? transporter.sendMail({
      from: `"Web Boda" <${process.env.GMAIL_USER}>`,
      to: adminEmails.split(",").map(e => e.trim()),
      subject: `Nueva confirmación: ${data.fullName} - ${data.attendance.toUpperCase()}`,
      html: adminHtml,
    }) : Promise.resolve();

    // Enviamos ambos en paralelo para mejorar la eficiencia (no esperamos uno para enviar otro)
    const results = await Promise.allSettled([guestEmailPromise, adminEmailPromise]);
    
    // Si la promesa de guestEmail falló, lanzamos error para que se registre (el admin puede fallar y no es crítico)
    if (results[0].status === "rejected") {
      throw results[0].reason;
    }

    // 4. Intentar sincronización con Google Calendar (Opcional, no bloquea el email y se lanza en bg)
    if (data.attendance === "si") {
      addRsvpToCalendar({
        fullName: data.fullName,
        email: data.email,
        guests: data.guests
      }).catch((calendarError) => {
        console.warn("Sincronización con Google Calendar omitida o fallida:", calendarError.message);
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    
    await adminDb.collection("system_logs").add({
      type: "email_failure",
      message: error.message || "Unknown error",
      details: error.stack || "",
      timestamp: new Date(),
      recipient: data.email,
      guestName: data.fullName,
      rsvpId: data.rsvpId || "unknown"
    });

    return { success: false, error: "SMTP Error" };
  }
}

