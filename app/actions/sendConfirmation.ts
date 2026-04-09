"use server";

import { addRsvpToCalendar } from "@/lib/googleApi";
import nodemailer from "nodemailer";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Inicialización de Firebase Admin (Singleton pattern)
function getAdminDb() {
  if (getApps().length === 0) {
    // Si estamos en Vercel/Producción, usaremos las credenciales de Service Account
    // de las variables de entorno si están disponibles, si no, intentamos conexión por defecto
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) 
      : undefined;

    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
    });
  }
  return getFirestore();
}

interface EmailData {
  fullName: string;
  email: string;
  guests: number;
  attendance: "si" | "no";
  transport: "si" | "no";
  rsvpId?: string; // Permitir asociar el error a un RSVP específico
}

export async function sendConfirmationEmail(data: EmailData) {
  const db = getAdminDb();
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn("Skipping email: GMAIL_USER or GMAIL_PASS not set.");
    await db.collection("system_logs").add({
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
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Ayuda con algunos problemas de red
      }
    });

    const subject = "Confirmación recibida - Boda Alba & Guille";
    const transportText = data.transport === "si" ? "Sí" : "No";
    
    const html = `
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

    await transporter.sendMail({
      from: `"Boda Alba & Guille" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject,
      html,
    });

    // 4. Intentar sincronización con Google Calendar (Opcional, no bloquea el email)
    if (data.attendance === "si") {
      try {
        await addRsvpToCalendar({
          fullName: data.fullName,
          email: data.email,
          guests: data.guests
        });
        console.log("Sincronización con Google Calendar exitosa");
      } catch (calendarError: any) {
        console.warn("Sincronización con Google Calendar omitida o fallida:", calendarError.message);
        // No logueamos esto como error fatal porque depende de que el usuario configure las credenciales
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    
    // Registrar el error en Firestore para que el administrador pueda verlo en el panel
    await db.collection("system_logs").add({
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

