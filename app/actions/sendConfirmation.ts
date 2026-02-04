"use server";

import nodemailer from "nodemailer";

interface EmailData {
  fullName: string;
  email: string;
  guests: number;
  attendance: "si" | "no";
  transport: "si" | "no";
}

export async function sendConfirmationEmail(data: EmailData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn("Skipping email: GMAIL_USER or GMAIL_PASS not set.");
    return;
  }

  // Si no proporcionó email, no podemos enviar confirmación individual,
  // pero la función no debe fallar.
  if (!data.email || !data.email.includes("@")) {
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const subject = "Confirmación recibida - Boda Alba & Guille";
    const transportText = data.transport === "si" ? "Sí" : "No";
    
    // Diseño simple y limpio
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
          Alba & Guille · 12 de Septiembre 2025
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Boda Alba & Guille" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject,
      html,
    });

    console.log(`Confirmation email sent to ${data.email}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // No lanzamos error para no romper el flujo del cliente
  }
}
