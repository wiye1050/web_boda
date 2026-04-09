import { createOAuthClient } from "@/lib/googleApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Mostramos los tokens para que el usuario pueda guardarlos en su .env
    // En un sistema real se guardarian en DB, pero aqui los necesitamos para el .env local del usuario
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; background: #f9f9f9;">
          <h1 style="color: #2e7d32;">¡Autenticación con Google Exitosa!</h1>
          <p>Copia el siguiente <b>Refresh Token</b> y añádelo a tu archivo <code>.env.local</code>:</p>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 14px;">
            ${tokens.refresh_token}
          </div>

          <p style="color: #666;">Variables necesarias en tu <code>.env.local</code>:</p>
          <pre style="background: #eee; padding: 15px; border-radius: 4px;">
GOOGLE_CLIENT_ID="tu_id_de_cliente"
GOOGLE_CLIENT_SECRET="tu_secreto_de_cliente"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/google/callback"
GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"
          </pre>
          
          <p>Una vez guardadas las variables y reiniciado el servidor, la sincronización estará activa.</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error: any) {
    console.error("Error exchanging code for tokens:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
