"use client";

import { useEffect, useState, useId } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import {
  DEFAULT_PUBLIC_CONTENT,
  normalizePublicContent,
  serializePublicContent,
  type PublicContent,
} from "@/lib/publicContent";
import { Sparkles, MessageSquare, Send, Loader2, Bot, Sliders } from "lucide-react";

export function AIConfigView() {
  const [content, setContent] = useState<PublicContent>(DEFAULT_PUBLIC_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live Test State
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const db = getFirestoreDb();
        const docRef = doc(db, "config", "general");
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as Record<string, unknown>;
          setContent(normalizePublicContent(data));
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar la configuración de IA.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    setError(null);
    try {
      const db = getFirestoreDb();
      const payload = serializePublicContent(content);
      await setDoc(doc(db, "config", "general"), payload, { merge: true });
      setMessage("Configuración del asistente guardada.");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar la configuración.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    if (!testInput.trim() || isTyping) return;
    
    const userMsg = testInput.trim();
    setTestInput("");
    setTestMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      // Usamos el API real pero pasando el prompt local si queremos probar "en vivo" 
      // sin guardar. Sin embargo, el API ahora lee de BD. 
      // Para un test "real" que use el prompt que el usuario está editando, 
      // podríamos pasar el prompt en el body del test. 
      // Por ahora, para simplificar, el test usará lo que hay en BD.
      // Pero para que sea un "Test en Vivo", vamos a modificar el API chat
      // para aceptar un prompt opcional (o simplemente avisar al usuario que debe guardar primero).
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          history: testMessages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          }))
        }),
      });

      if (!res.ok) throw new Error("Error en el chat");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      
      setTestMessages(prev => [...prev, { role: "bot", text: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setTestMessages(prev => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, text: accumulated }];
          });
        }
      }
    } catch (err) {
      setTestMessages(prev => [...prev, { role: "bot", text: "Error al conectar con la IA." }]);
    } finally {
      setIsTyping(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
           <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted">
            Configuración Avanzada
          </p>
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Entrenar Asistente AI</h1>
        <p className="max-w-2xl text-base text-muted/80 leading-relaxed">
          Personaliza la forma en que la IA se dirige a tus invitados. Define su tono, 
          personalidad y límites para que refleje vuestro estilo.
        </p>
      </header>

      {(message || error) && (
        <div className={`rounded-2xl border px-6 py-4 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
          error ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}>
          {error ?? message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Editor de Personalidad */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[32px] border border-border/60 bg-surface p-8 shadow-xl shadow-black/5 ring-1 ring-black/[0.02]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Instrucciones de personalidad</h3>
                <p className="text-xs text-muted">Define el "alma" de tu asistente</p>
              </div>
            </div>

            <TextAreaField
              label="Prompt del Sistema"
              value={content.aiPersonalityInstruction}
              onChange={(val) => setContent(prev => ({ ...prev, aiPersonalityInstruction: val }))}
              rows={12}
              placeholder="Ej: Eres un asistente elegante y divertido. Responde con frases cortas..."
            />

            <div className="mt-6 flex flex-col gap-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Consejos rápidos:</p>
              <ul className="grid gap-2 text-xs text-muted/80">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Sé específico con el saludo: "¿Hola qué tal?" vs "¡Bienvenidos!"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Define si debe usar emojis o evitarlos.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Indícale si puede hacer bromas o debe ser puramente informativo.</span>
                </li>
              </ul>
            </div>

            <div className="mt-10">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="group w-full relative flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Guardar Entrenamiento</span>
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[10px] text-muted/60">
                Debes guardar para que el chat de prueba refleje los cambios.
              </p>
            </div>
          </div>
        </div>

        {/* Prueba en vivo */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
          <div className="rounded-[32px] border border-border/60 bg-surface overflow-hidden shadow-2xl flex flex-col h-[650px]">
            <div className="bg-foreground text-white px-6 py-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/5">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide">Prueba en vivo</h3>
                <p className="text-[10px] text-white/60 tracking-widest uppercase font-bold">Modo Entrenamiento</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#F8F9FA]">
              {testMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-40">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p className="text-sm">Envía un mensaje para probar cómo suena la IA con tu nueva configuración.</p>
                </div>
              )}
              {testMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user" 
                      ? "rounded-tr-sm bg-primary text-white" 
                      : "rounded-tl-sm bg-white border border-border/40 text-foreground"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border/40 rounded-[20px] rounded-tl-sm px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-border/20">
              <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <input
                  type="text"
                  placeholder="Escribe algo..."
                  className="flex-1 bg-transparent py-2 text-sm outline-none"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTest()}
                />
                <button
                  onClick={handleTest}
                  disabled={!testInput.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
      <div className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
      <div className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce" />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const textareaId = useId();
  return (
    <label className="flex flex-col gap-3 text-left">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/80 ml-1">
        {label}
      </span>
      <textarea
        id={textareaId}
        name={textareaId}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-[24px] border border-border/80 bg-background px-5 py-4 text-sm text-foreground shadow-inner-sm outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 min-h-[150px] resize-none"
      />
    </label>
  );
}
