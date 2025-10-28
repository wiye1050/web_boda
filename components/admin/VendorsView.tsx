"use client";

import { useMemo, useState } from "react";
import {
  useVendors,
  type Vendor,
  type VendorCategory,
  type VendorStatus,
} from "@/components/admin/useVendors";

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  catering: "Catering",
  fotografia: "Fotografía",
  video: "Vídeo",
  musica: "Música / DJ",
  decoracion: "Decoración",
  floristeria: "Floristería",
  iluminacion: "Iluminación",
  transporte: "Transporte",
  papeleria: "Papelería",
  officiant: "Oficiante",
  otros: "Otros",
};

const STATUS_OPTIONS: Array<{ value: VendorStatus; label: string }> = [
  { value: "pendiente", label: "Pendiente" },
  { value: "contratado", label: "Contratado" },
  { value: "pagado", label: "Pagado" },
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as VendorCategory,
  label,
}));

export function VendorsView() {
  const { vendors, totals, isLoading, error, addVendor, updateVendor, removeVendor } =
    useVendors();

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<VendorCategory>("otros");
  const [newStatus, setNewStatus] = useState<VendorStatus>("pendiente");
  const [newContactName, setNewContactName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const vendorsByCategory = useMemo(() => {
    const map = new Map<VendorCategory, Vendor[]>();
    vendors.forEach((vendor) => {
      const key = vendor.category ?? "otros";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(vendor);
    });
    return Array.from(map.entries());
  }, [vendors]);

  async function handleAddVendor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newName.trim()) {
      setFormError("Escribe el nombre del proveedor.");
      return;
    }

    try {
      await addVendor({
        name: newName.trim(),
        category: newCategory,
        status: newStatus,
        contactName: newContactName || undefined,
        contactPhone: newPhone || undefined,
        contactEmail: newEmail || undefined,
      });
      setNewName("");
      setNewContactName("");
      setNewPhone("");
      setNewEmail("");
      setNewCategory("otros");
      setNewStatus("pendiente");
      setFormError(null);
    } catch (err) {
      console.error(err);
      setFormError("No se pudo crear el proveedor.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Proveedores</h1>
          <p className="text-sm text-muted">
            Seguimiento de contratos, pagos y contactos clave.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/95 px-5 py-3 text-sm text-muted shadow-[var(--shadow-soft)]">
          <span>
            <strong className="text-foreground">{totals.count}</strong> proveedores
          </span>
          <span>
            <strong className="text-foreground">{totals.hired}</strong> contratados
          </span>
          <span>
            <strong className="text-foreground">{totals.paid}</strong> pagados
          </span>
          <span>
            Presupuesto: <strong className="text-foreground">{formatCurrency(totals.costEstimate)}</strong>
          </span>
          <span>
            Pagado: <strong className="text-foreground">{formatCurrency(totals.paidAmount)}</strong>
          </span>
        </div>
      </header>

      <section className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-semibold">Añadir proveedor</h2>
        <form
          onSubmit={handleAddVendor}
          className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_150px]"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Nombre
            </label>
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Ej. Catering del Bierzo"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Categoría
            </label>
            <select
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value as VendorCategory)}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Estado
            </label>
            <select
              value={newStatus}
              onChange={(event) => setNewStatus(event.target.value as VendorStatus)}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Contacto
            </label>
            <input
              value={newContactName}
              onChange={(event) => setNewContactName(event.target.value)}
              placeholder="Nombre de contacto"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Teléfono
            </label>
            <input
              value={newPhone}
              onChange={(event) => setNewPhone(event.target.value)}
              placeholder="+34 ..."
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Email
            </label>
            <input
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              placeholder="contacto@proveedor.com"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30"
            >
              Añadir
            </button>
          </div>
        </form>
        {formError && <p className="mt-2 text-xs text-primary">{formError}</p>}
      </section>

      {error && <p className="text-xs text-primary">{error}</p>}

      <section className="flex flex-col gap-4">
        {vendorsByCategory.length === 0 ? (
          <p className="text-sm text-muted">
            Añade tu primer proveedor para comenzar el seguimiento.
          </p>
        ) : (
          vendorsByCategory.map(([category, list]) => (
            <VendorGroup
              key={category}
              category={category}
              vendors={list}
              updateVendor={updateVendor}
              removeVendor={removeVendor}
            />
          ))
        )}
      </section>
    </div>
  );
}

function VendorGroup({
  category,
  vendors,
  updateVendor,
  removeVendor,
}: {
  category: VendorCategory;
  vendors: Vendor[];
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  removeVendor: (id: string) => Promise<void>;
}) {
  const sorted = useMemo(() => {
    return [...vendors].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [vendors]);

  return (
    <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{CATEGORY_LABELS[category]}</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-muted">
          {vendors.length} proveedores
        </span>
      </header>
      <div className="mt-4 grid gap-3">
        {sorted.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            updateVendor={updateVendor}
            removeVendor={removeVendor}
          />
        ))}
      </div>
    </article>
  );
}

function VendorCard({
  vendor,
  updateVendor,
  removeVendor,
}: {
  vendor: Vendor;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  removeVendor: (id: string) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function updateField(field: keyof Vendor, value: Vendor[keyof Vendor]) {
    setIsSaving(true);
    try {
      await updateVendor(vendor.id, { [field]: value });
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo actualizar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    const confirmation = window.confirm(`¿Eliminar a ${vendor.name}?`);
    if (!confirmation) return;
    setIsSaving(true);
    try {
      await removeVendor(vendor.id);
      setLocalError(null);
    } catch (err) {
      console.error(err);
      setLocalError("No se pudo eliminar el proveedor.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-base font-semibold text-foreground">{vendor.name}</h4>
          <div className="mt-2 grid gap-2 text-xs text-muted sm:grid-cols-2">
            {vendor.contactName && <span>Contacto: {vendor.contactName}</span>}
            {vendor.contactPhone && <span>Tel: {vendor.contactPhone}</span>}
            {vendor.contactEmail && <span>Email: {vendor.contactEmail}</span>}
            {vendor.website && (
              <span>
                Web: {" "}
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-primary/40 underline-offset-4 hover:text-primary"
                >
                  {vendor.website}
                </a>
              </span>
            )}
          </div>
          {vendor.notes && <p className="mt-2 text-xs text-muted">Notas: {vendor.notes}</p>}
        </div>
        <div className="flex w-full flex-col gap-3 lg:max-w-xs">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Estado
            <select
              value={vendor.status}
              onChange={(event) => updateField("status", event.target.value as VendorStatus)}
              disabled={isSaving}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Presupuesto (€)
            <input
              defaultValue={vendor.costEstimate ?? ""}
              onBlur={(event) =>
                updateField(
                  "costEstimate",
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
              type="number"
              min={0}
              step={50}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Pagado (€)
            <input
              defaultValue={vendor.paidAmount ?? ""}
              onBlur={(event) =>
                updateField(
                  "paidAmount",
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
              type="number"
              min={0}
              step={50}
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Fecha límite de pago
            <input
              defaultValue={vendor.paymentDueDate ?? ""}
              onBlur={(event) => updateField("paymentDueDate", event.target.value || undefined)}
              type="date"
              className="rounded-full border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Notas internas
            <textarea
              defaultValue={vendor.notes ?? ""}
              onBlur={(event) => updateField("notes", event.target.value || undefined)}
              rows={3}
              className="rounded-2xl border border-border/80 bg-background px-4 py-2 text-xs text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSaving}
            className="self-end rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary disabled:opacity-60"
          >
            Eliminar
          </button>
          {localError && <p className="text-xs text-primary">{localError}</p>}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(value);
}
