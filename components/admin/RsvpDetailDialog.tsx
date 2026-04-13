"use client";

import { useEffect, useState } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { RsvpRecord, RsvpStatus } from "./useRsvpData";
import { useAuth } from "@/components/admin/AuthContext";

type RsvpDetailDialogProps = {
  record: RsvpRecord | null;
  onClose: () => void;
};

const STATUS_OPTIONS: Array<{
  value: RsvpStatus;
  label: string;
  helper: string;
}> = [
  {
    value: "pendiente",
    label: "Pendiente",
    helper: "Todavía no se ha contactado al invitado.",
  },
  {
    value: "contactado",
    label: "Contactado",
    helper: "Ya hablaste con el invitado, queda cerrar detalles.",
  },
  {
    value: "confirmado",
    label: "Confirmado",
    helper: "Todo coordinado, listo para el gran día.",
  },
];

const TAG_SUGGESTIONS = [
  "familia",
  "amigos",
  "trabajo",
  "proveedor",
  "dietas",
  "transporte",
  "hotel",
  "mesa pendiente",
];

export function RsvpDetailDialog({ record, onClose }: RsvpDetailDialogProps) {
  const { user } = useAuth();
  
  // State for all fields
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
    processed: false,
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({
        fullName: record.fullName || "",
        email: record.email || "",
        phone: record.phone || "",
        attendance: record.attendance || "si",
        guests: record.guests || 0,
        guestNames: record.guestNames || "",
        preboda: record.preboda || "no",
        needsTransport: record.needsTransport || "no",
        transportSeats: record.transportSeats || 0,
        requests: record.requests || "",
        notes: record.notes || "",
        status: record.status || "pendiente",
        processed: record.processed || false,
        tags: record.tags || [],
      });
      setError(null);
    }
  }, [record]);

  if (!record) return null;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setError(null);

    try {
      const db = getFirestoreDb();
      const docRef = doc(db, "rsvps", record.id);

      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email ?? "admin",
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios.");
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

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setNewTag("");
  }

  function removeTag(tag: string) {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-3xl my-auto rounded-[32px] border border-border/80 bg-surface p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif italic text-accent">Editar Invitado</h2>
            <p className="text-xs text-muted uppercase tracking-widest mt-1">ID: {record.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Guest Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Nombre Completo</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Email</label>
                <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Teléfono</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Estado Admin</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20">
                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="processed" checked={formData.processed} onChange={(e) => setFormData(p => ({...p, processed: e.target.checked}))} className="rounded border-border text-accent focus:ring-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Procesado</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Event Info */}
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Asistencia</label>
                  <select name="attendance" value={formData.attendance} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20">
                    <option value="si">Confirmado</option>
                    <option value="no">No viene</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Nº Adultos</label>
                  <input name="guests" type="number" value={formData.guests} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Acompañantes</label>
                <input name="guestNames" value={formData.guestNames} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Preboda</label>
                  <select name="preboda" value={formData.preboda} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20">
                    <option value="si">Viene</option>
                    <option value="no">No viene</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Pazas Bus</label>
                  <input name="transportSeats" type="number" value={formData.transportSeats} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Notas Invitado</label>
                <textarea name="requests" value={formData.requests} onChange={handleChange} rows={1} className="w-full px-4 py-2.5 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Notas Internas (Dietas, Mesas, etc.)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-accent/20" />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted px-1">Etiquetas</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(newTag))} className="flex-1 px-4 py-2 rounded-full bg-background border border-border text-xs outline-none" placeholder="Nueva etiqueta..." />
                <button type="button" onClick={() => addTag(newTag)} className="px-4 py-2 rounded-full border border-border text-xs font-bold uppercase tracking-widest hover:bg-muted transition-colors">Añadir</button>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-muted hover:bg-muted transition-all">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-10 py-3 rounded-full bg-accent text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-all">
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
