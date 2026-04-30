"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, Send, MessageCircleHeart, Loader, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type ApiHistory = {
  role: "user" | "model";
  parts: { text: string }[];
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "¡Hola! 👋 Soy el asistente de Alba & Guille. Estoy aquí para resolver cualquier duda que tengas sobre la boda. ¿En qué puedo ayudarte?",
};

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function WeddingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Bloquear scroll cuando el chat está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    // Mostrar el hint después de 4 segundos
    const timer = setTimeout(() => {
      if (!isOpen) setShowHint(true);
    }, 4000);

    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, 14000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  // TTS Voice Selection
  const loadBestVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    // Priorizamos voces en español de España
    const spanishVoices = voices.filter(v => v.lang.startsWith("es"));
    
    // Lista de preferencias (de más natural a menos)
    const preferredNames = [
      "Google español", // Chrome Cloud (Muy natural)
      "Neural",          // Voces modernas (Edge/Windows)
      "Monica",         // macOS Natural
      "Jorge",          // macOS Natural
      "Paulina",        // macOS decente
      "Helena",         // Windows decente
      "Laura"           // Windows decente
    ];

    let bestVoice = spanishVoices.find(v => v.lang === "es-ES" && preferredNames.some(p => v.name.includes(p)));
    
    // Si no hay de España, buscamos cualquier española preferida
    if (!bestVoice) {
      bestVoice = spanishVoices.find(v => preferredNames.some(p => v.name.includes(p)));
    }

    // Si sigue sin haber, la primera de España
    if (!bestVoice) {
      bestVoice = spanishVoices.find(v => v.lang === "es-ES");
    }

    // Último recurso: cualquier voz española
    if (!bestVoice) {
      bestVoice = spanishVoices[0];
    }

    if (bestVoice) {
      setSelectedVoice(bestVoice);
      console.log("Voz seleccionada:", bestVoice.name);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadBestVoice();
      window.speechSynthesis.onvoiceschanged = loadBestVoice;
    }
  }, [loadBestVoice]);

  // STT Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "es-ES";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakText = useCallback((text: string) => {
    if (!isVoiceEnabled || typeof window === "undefined") return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      utterance.lang = "es-ES";
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled, selectedVoice]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  // Listener para el evento custom disparado desde la MobileBottomBar
  useEffect(() => {
    const onOpenChat = () => {
      setIsOpen(true);
      setShowHint(false);
    };
    window.addEventListener('open-chat', onOpenChat);
    return () => window.removeEventListener('open-chat', onOpenChat);
  }, []);

  const buildHistory = useCallback((): ApiHistory[] => {
    return messages
      .filter((m) => m.id !== "welcome" && !m.streaming)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
  }, [messages]);

  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const history = buildHistory();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Error del servidor");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            )
          );
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );

      // Hablar la respuesta si la voz está habilitada
      speakText(accumulated);

      if (!isOpen) setHasNewMessage(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg = "Lo siento, no he podido procesar tu pregunta. Inténtalo de nuevo.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: errorMsg, streaming: false } : m
        )
      );
      speakText(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isOpen, buildHistory, speakText]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    window.speechSynthesis.cancel();
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowHint(false);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-4 z-40 hidden sm:block sm:bottom-8 sm:right-8">
        <AnimatePresence>
          {showHint && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              className="absolute bottom-full right-0 mb-4 w-48 pointer-events-none"
            >
              <div className="relative rounded-2xl bg-white p-3 shadow-xl border border-accent/20 text-center">
                <p className="text-[11px] font-medium leading-tight text-foreground/80">
                  ¿Alguna duda sobre la boda? <span className="text-secondary font-bold italic">Pregúntame</span>
                </p>
                <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-accent/10 bg-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleOpen}
          aria-label="Abrir chat de asistencia"
          className={cn(
            "group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 bg-transparent border-none outline-none shadow-none",
            isOpen && "opacity-0 pointer-events-none scale-95"
          )}
        >
          <span className="absolute inset-0 rounded-full bg-accent/20 animate-pulse opacity-40 scale-110" />
          
          <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center border-2 border-accent/10 bg-white/50 backdrop-blur-sm group-hover:border-accent/30 transition-colors">
             <Image 
               src="/images/ai-logo.png" 
               alt="AI Assistant" 
               width={92}
               height={92}
               priority
               className="h-[145%] w-[145%] max-w-none object-cover mix-blend-multiply brightness-[1.1] contrast-[1.1] grayscale-[0.05] group-hover:scale-110 transition-transform duration-500"
             />
          </div>
          
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-accent shadow-sm" />
            </span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) handleClose();
              }}
              className="fixed bottom-0 right-0 z-[70] flex w-full flex-col bg-surface shadow-2xl sm:bottom-8 sm:right-8 sm:w-[calc(100vw-2rem)] sm:max-w-sm rounded-t-[2.5rem] sm:rounded-[var(--radius-card)] sm:border sm:border-border/30 overflow-hidden"
              style={{ height: "min(700px, 92dvh)" }}
            >
              <div className="flex w-full items-center justify-center pt-3 pb-1 shrink-0">
                <div className="h-1 w-10 rounded-full bg-muted/20" />
              </div>

              {/* Header */}
              <div className="flex shrink-0 items-center justify-between gap-3 bg-foreground px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 relative">
                    <MessageCircleHeart className="h-5 w-5 text-accent" />
                    {isSpeaking && (
                      <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-accent opacity-75" />
                        <span className="h-3 w-3 rounded-full bg-accent" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold tracking-tight text-white/95">Asistente de Alba & Guille</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                      </span>
                      <p className="text-[10px] font-medium tracking-wide text-white/50 uppercase">En línea ahora</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setIsVoiceEnabled(!isVoiceEnabled);
                      if (isVoiceEnabled) window.speechSynthesis.cancel();
                    }}
                    className={cn(
                      "rounded-full p-2.5 transition-all active:scale-90",
                      isVoiceEnabled ? "bg-accent text-white" : "text-white/50 hover:bg-white/10"
                    )}
                    title={isVoiceEnabled ? "Desactivar voz" : "Activar voz"}
                  >
                    {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={handleClose}
                    aria-label="Cerrar chat"
                    className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white active:scale-90"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 overscroll-contain bg-surface">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed relative group shadow-sm transition-all",
                        msg.role === "user"
                          ? "rounded-tr-sm bg-foreground text-white/95 shadow-md shadow-foreground/5"
                          : "rounded-tl-sm bg-accent-bg text-foreground border border-accent/10"
                      )}
                    >
                      {msg.streaming && msg.content === "" ? (
                        <TypingDots />
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}
                      {!msg.streaming && msg.role === "assistant" && (
                        <button 
                          onClick={() => {
                            setIsVoiceEnabled(true);
                            speakText(msg.content);
                          }}
                          className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-border/20 p-4 pb-8 sm:pb-4 bg-surface">
                <div className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all shadow-xl shadow-black/5",
                  isListening ? "border-accent ring-4 ring-accent/10 bg-accent/5" : "border-border/30 bg-background focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/5"
                )}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta..."}
                    maxLength={500}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none disabled:opacity-60"
                  />
                  
                  {recognitionRef.current && (
                    <button
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                        isListening ? "bg-accent text-white animate-pulse" : "text-muted hover:bg-muted/10"
                      )}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  )}

                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-white transition disabled:opacity-40 hover:scale-105"
                  >
                    {isLoading ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
