"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "wb_envelope_seen";

export function EnvelopeIntro() {
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setDone(true);
      setTimeout(() => setVisible(false), 600);
    }, 900);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f8f5f2]"
          aria-modal="true"
          role="dialog"
        >
          {/* Background subtle texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(183,140,100,0.08),_transparent_70%)]" />

          <div className="relative flex flex-col items-center gap-8 text-center px-6">
            {/* Names above */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className="font-serif italic text-muted text-sm tracking-[0.2em] uppercase"
            >
              Alba & Guille
            </motion.p>

            {/* Envelope SVG */}
            <button
              onClick={handleOpen}
              aria-label="Abrir invitación"
              className="group relative cursor-pointer focus:outline-none"
            >
              <motion.div
                animate={opening ? { scale: [1, 1.04, 0.97, 1], y: [0, -8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <svg
                  viewBox="0 0 240 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-72 h-auto drop-shadow-lg"
                >
                  {/* Envelope body */}
                  <rect x="4" y="30" width="232" height="146" rx="8" fill="#fffdf9" stroke="#d6c9b8" strokeWidth="2" />

                  {/* Envelope flap (closed) */}
                  <motion.path
                    d="M4 38 L120 105 L236 38 L236 30 Q236 22 228 22 L12 22 Q4 22 4 30 Z"
                    fill="#f3ede2"
                    stroke="#d6c9b8"
                    strokeWidth="1.5"
                    animate={opening ? { d: "M4 22 L120 22 L236 22 L236 22 Q236 22 228 22 L12 22 Q4 22 4 22 Z", y: -40, opacity: 0 } : {}}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />

                  {/* Bottom V fold lines */}
                  <path d="M4 176 L114 100 M236 176 L126 100" stroke="#d6c9b8" strokeWidth="1" opacity="0.5" />

                  {/* Wax seal */}
                  <motion.g
                    animate={opening ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ transformOrigin: "120px 105px" }}
                  >
                    <circle cx="120" cy="105" r="18" fill="#8b7e74" />
                    <circle cx="120" cy="105" r="15" fill="#a08b7a" />
                    {/* AG monogram */}
                    <text
                      x="120"
                      y="111"
                      textAnchor="middle"
                      fontSize="13"
                      fontFamily="Georgia, serif"
                      fill="white"
                      fontStyle="italic"
                    >
                      AG
                    </text>
                  </motion.g>
                </svg>
              </motion.div>

              {/* Hover hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.8 } }}
                className="mt-4 text-xs font-sans tracking-[0.25em] uppercase text-muted/60 group-hover:text-muted transition-colors"
              >
                Toca para abrir
              </motion.p>
            </button>

            {/* Skip */}
            <button
              onClick={() => {
                sessionStorage.setItem(SESSION_KEY, "1");
                setDone(true);
                setTimeout(() => setVisible(false), 400);
              }}
              className="text-[10px] tracking-widest uppercase text-muted/40 hover:text-muted/70 transition-colors"
            >
              Saltar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
