"use client";

import { useState } from "react";
import type { RsvpRecord, RsvpStatus } from "./useRsvpData";
import { useAuth } from "@/components/admin/AuthContext";
import { X } from "lucide-react";

type AddRsvpDialogProps = {
  onAdd: (data: Omit<RsvpRecord, "id" | "submittedAt" | "updatedAt">) => Promise<void>;
  onClose: () => void;
};

export function AddRsvpDialog({ onAdd, onClose }: AddRsvpDialogProps) {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    attendance: "si" as "si" | "no",
    guests: 1,
    guestNames: "",
    preboda: "si" as "si" | "no",
    needsTransport: "no" as "si" | "no",
    transportSeats: 0,
    requests: "",
    notes: "",
    status: "pendiente" as RsvpStatus,
    tags: [] as string[],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;
    if (!formData.fullName) {
      setError("El nombre es obligatorio");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onAdd({
        ...formData,
        processed: true,
        updatedBy: user?.email ?? "admin",
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al crear el invitado. Revisa la consola.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto rounded-[32px] border border-border/80 bg-surface p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif italic text-foreground text-accent">Añadir Invitado Manual</h2>
            <p className="text-xs text-muted mt-1 uppercase tracking-widest">Creador offline / administrativo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Nombre Completo</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Email (Opcional)</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Teléfono</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                placeholder="600 000 000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Asistencia</label>
              <select
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              >
                <option value="si">Confirmado (Viene)</option>
                <option value="no">Cancelado (No viene)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Nº Adultos</label>
              <input
                name="guests"
                type="number"
                min="0"
                value={formData.guests}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Nombres Acompañantes</label>
            <input
              name="guestNames"
              value={formData.guestNames}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
              placeholder="Ej: María y los niños"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-2xl bg-background border border-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.preboda === "si"}
                  onChange={(e) => setFormData(prev => ({ ...prev, preboda: e.target.checked ? "si" : "no" }))}
                  className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className="text-xs font-medium uppercase tracking-widest">¿Viene a la Preboda?</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.needsTransport === "si"}
                  onChange={(e) => setFormData(prev => ({ ...prev, needsTransport: e.target.checked ? "si" : "no" }))}
                  className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className="text-xs font-medium uppercase tracking-widest">¿Necesita Autobús?</span>
              </label>
            </div>
            {formData.needsTransport === "si" && (
              <div className="space-y-2 animate-in slide-in-from-left duration-200">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Plazas Bus</label>
                <input
                  name="transportSeats"
                  type="number"
                  min="1"
                  value={formData.transportSeats}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Notas Internas (Admin)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-background border border-border focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
              placeholder="Asignación de mesa, dietas especiales, etc."
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-muted hover:bg-muted transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Crear Invitado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
