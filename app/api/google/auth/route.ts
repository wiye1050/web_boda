import { createOAuthClient } from "@/lib/googleApi";
import { NextResponse } from "next/server";

export async function GET() {
  const oauth2Client = createOAuthClient();

  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/tasks",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // Forzar consentimiento para asegurar recibir el refresh_token
  });

  return NextResponse.redirect(url);
}
