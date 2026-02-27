"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, Send, MessageCircleHeart, Loader2, ChevronDown } from "lucide-react";

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
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir chat de asistencia"
        className={cn(
          "fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 sm:bottom-8 sm:right-8",
          "bg-foreground text-white hover:scale-110 hover:shadow-xl",
          isOpen && "opacity-0 pointer-events-none scale-95"
        )}
      >
        <MessageCircleHeart className="h-6 w-6" />
        {hasNewMessage && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-primary" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col rounded-[var(--radius-card)] border border-border/30 bg-surface shadow-2xl sm:bottom-8 sm:right-8"
          style={{ height: "min(560px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-[var(--radius-card)] bg-foreground px-5 py-4 text-white">
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
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
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

          {/* Scroll hint */}
          <button
            onClick={scrollToBottom}
            className="absolute bottom-[72px] right-4 hidden items-center gap-1 rounded-full border border-border/30 bg-surface px-3 py-1.5 text-[10px] text-muted shadow-sm transition hover:text-foreground"
          >
            <ChevronDown className="h-3 w-3" />
            Bajar
          </button>

          {/* Input */}
          <div className="shrink-0 border-t border-border/20 p-3">
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
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
