import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/google/callback";

// Para produccion, el refresh token deberia estar guardado en Firestore tras el primer login
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

export const createOAuthClient = () => {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

export async function getCalendarClient(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}

export async function getTasksClient(auth: OAuth2Client) {
  return google.tasks({ version: "v1", auth });
}

/**
 * Función para obtener un cliente autenticado usando el refresh token guardado
 */
export async function getAuthenticatedClient() {
  const oAuth2Client = createOAuthClient();

  if (!REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN not set. Run the auth flow first.");
  }

  oAuth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });

  return oAuth2Client;
}

/**
 * Añade un evento al calendario para un RSVP confirmado
 */
export async function addRsvpToCalendar(rsvpData: {
  fullName: string;
  email: string;
  guests: number;
}) {
  try {
    const auth = await getAuthenticatedClient();
    const calendar = await getCalendarClient(auth);

    const WEDDING_DATE = "2026-09-12";
    const WEDDING_TIME = "13:30:00"; // Hora inicio para calendario

    const event = {
      summary: `Boda Alba & Guille: ${rsvpData.fullName}`,
      description: `Confirmación de asistencia: ${rsvpData.guests} asistentes.\nEmail: ${rsvpData.email}`,
      start: {
        dateTime: `${WEDDING_DATE}T${WEDDING_TIME}Z`,
        timeZone: "UTC",
      },
      end: {
        dateTime: `${WEDDING_DATE}T23:59:00Z`,
        timeZone: "UTC",
      },
    };

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return res.data;
  } catch (error) {
    console.error("Error adding event to Google Calendar:", error);
    throw error;
  }
}

/**
 * Sincroniza una tarea con Google Tasks
 */
export async function syncTaskToGoogle(taskData: {
  title: string;
  notes?: string;
  due?: string;
}) {
  try {
    const auth = await getAuthenticatedClient();
    const tasks = await getTasksClient(auth);

    // Intentamos obtener la lista de tareas 'Boda' o usamos la predeterminada
    const res = await tasks.tasks.insert({
      tasklist: "@default",
      requestBody: {
        title: taskData.title,
        notes: taskData.notes,
        due: taskData.due ? new Date(taskData.due).toISOString() : undefined,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error adding task to Google Tasks:", error);
    throw error;
  }
}

