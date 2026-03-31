"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X, Send, MessageCircleHeart, Loader, ChevronDown } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Mostrar el hint después de 4 segundos
    const timer = setTimeout(() => {
      if (!isOpen) setShowHint(true);
    }, 4000);

    // Ocultar automáticamente después de 10 segundos adicionales si no se ha interactuado
    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, 14000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

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

  const buildHistory = useCallback((): ApiHistory[] => {
    return messages
      .filter((m) => m.id !== "welcome" && !m.streaming)
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
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

      if (!res.ok) {
        throw new Error("Error del servidor");
      }

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

      if (!isOpen) setHasNewMessage(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Lo siento, no he podido procesar tu pregunta. Inténtalo de nuevo.",
                streaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isOpen, buildHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowHint(false);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-8 sm:right-8">
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
                {/* Flecha del bocadillo */}
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
          {/* Aura pulsante sutil */}
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
            />

            {/* Chat panel / Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) handleClose();
              }}
              className="fixed bottom-0 right-0 z-50 flex w-full flex-col bg-surface shadow-2xl sm:bottom-8 sm:right-8 sm:w-[calc(100vw-2rem)] sm:max-w-sm sm:rounded-[var(--radius-card)] sm:border sm:border-border/30 overflow-hidden"
              style={{ height: "min(600px, 85dvh)" }}
            >
              {/* Mobile Drag Handle */}
              <div className="flex w-full items-center justify-center pt-3 pb-1 sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-muted/30" />
              </div>

              {/* Header */}
              <div className="flex shrink-0 items-center justify-between gap-3 bg-foreground px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <MessageCircleHeart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Asistente de la boda</p>
                    <p className="text-[10px] tracking-wide text-white/60">Alba &amp; Guille · 12 sep 2026</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Cerrar chat"
                  className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
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
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "rounded-tr-sm bg-foreground text-white"
                          : "rounded-tl-sm bg-accent-bg text-foreground border border-border/30"
                      )}
                    >
                      {msg.streaming && msg.content === "" ? (
                        <TypingDots />
                      ) : (
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-border/20 p-4 pb-8 sm:pb-4 bg-surface">
                <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu pregunta..."
                    maxLength={500}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted/60 outline-none disabled:opacity-60"
                    aria-label="Mensaje para el asistente"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    aria-label="Enviar mensaje"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-white transition disabled:opacity-40 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
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
