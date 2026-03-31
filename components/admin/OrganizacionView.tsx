"use client";

import { useState } from "react";
import { useWeddingTasks, type WeddingTask } from "./useWeddingTasks";
import { useVendors, type Vendor, type VendorCategory, type VendorStatus } from "./useVendors";
import { formatCurrency } from "./utils/formatCurrency";
import { Plus, Trash2, CircleCheck, Circle, Clock, Euro, Phone, Mail, User } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
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

export function OrganizacionView() {
  const { tasks, isLoading: tasksLoading, addTask, updateTask, removeTask } = useWeddingTasks();
  const { vendors, totals, isLoading: vendorsLoading, addVendor, updateVendor, removeVendor } = useVendors();

  const [activeTab, setActiveTab] = useState<"tareas" | "presupuesto">("tareas");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newVendorName, setNewVendorName] = useState("");

  if (tasksLoading || vendorsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Organización</h1>
          <p className="text-sm text-muted">
            Gestiona las tareas y el presupuesto de tu boda desde un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/50 bg-surface/50 p-4 sm:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Guille</p>
              <p className="text-xs font-medium">696 40 86 89</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-border/50 pl-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Alba</p>
              <p className="text-xs font-medium">695 43 87 98</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-6 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab("tareas")}
          className={`relative pb-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "tareas" ? "text-primary" : "text-muted hover:text-foreground"
          }`}
        >
          Plan de Tareas
          {activeTab === "tareas" && (
            <div className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("presupuesto")}
          className={`relative pb-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "presupuesto" ? "text-primary" : "text-muted hover:text-foreground"
          }`}
        >
          Gastos & Proveedores
          {activeTab === "presupuesto" && (
            <div className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-primary" />
          )}
        </button>
      </div>

      <div>
        {activeTab === "tareas" ? (
          <div className="flex flex-col gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTaskTitle.trim()) {
                  addTask({ title: newTaskTitle, status: "pendiente", priority: "media" });
                  setNewTaskTitle("");
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Nueva tarea..."
                className="flex-1 rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-sm focus:border-primary/50 focus:outline-none"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-2xl bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-105 active:scale-95"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="grid gap-3">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border/70 py-12 text-center">
                  <Clock className="mb-3 text-muted/30" size={40} />
                  <p className="text-sm font-medium text-muted">No hay tareas pendientes</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-4 rounded-3xl border border-border/50 bg-surface px-5 py-4 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-black/5"
                  >
                    <button
                      onClick={() => updateTask(task.id, { status: task.status === "completada" ? "pendiente" : "completada" })}
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                        task.status === "completada"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border group-hover:border-primary/50"
                      }`}
                    >
                      {task.status === "completada" && <CircleCheck size={14} />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.status === "completada" ? "text-muted line-through" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      {task.monthLabel && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mt-0.5">
                          {task.monthLabel}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-muted hover:text-primary"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[32px] border border-border/50 bg-surface p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Presupuesto Estimado</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.costEstimate)}</p>
              </div>
              <div className="rounded-[32px] border border-emerald-500/10 bg-surface p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Total Pagado</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-500">{formatCurrency(totals.paidAmount)}</p>
              </div>
              <div className="rounded-[32px] border border-primary/10 bg-surface p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Pendiente</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{formatCurrency(totals.costEstimate - totals.paidAmount)}</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newVendorName.trim()) {
                  addVendor({ name: newVendorName, category: "otros", status: "pendiente" });
                  setNewVendorName("");
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Nombre del proveedor..."
                className="flex-1 rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-sm focus:border-primary/50 focus:outline-none"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-2xl bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 transition hover:scale-105 active:scale-95"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="overflow-hidden rounded-[32px] border border-border/50 bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/10 text-[10px] font-bold uppercase tracking-widest text-muted">
                    <tr>
                      <th className="px-6 py-4">Proveedor</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4">Costo</th>
                      <th className="px-6 py-4">Pagado</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted">
                          No hay proveedores registrados
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor) => (
                        <tr key={vendor.id} className="group hover:bg-muted/5">
                          <td className="px-6 py-4 font-medium">{vendor.name}</td>
                          <td className="px-6 py-4 text-muted">{CATEGORY_LABELS[vendor.category] || vendor.category}</td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              className="w-24 bg-transparent outline-none focus:text-primary"
                              defaultValue={vendor.costEstimate}
                              onBlur={(e) => updateVendor(vendor.id, { costEstimate: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              className="w-24 bg-transparent outline-none focus:text-emerald-500"
                              defaultValue={vendor.paidAmount}
                              onBlur={(e) => updateVendor(vendor.id, { paidAmount: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className="bg-transparent text-xs font-semibold uppercase tracking-wider outline-none"
                              value={vendor.status}
                              onChange={(e) => updateVendor(vendor.id, { status: e.target.value as VendorStatus })}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="contratado">Contratado</option>
                              <option value="pagado">Pagado</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => removeVendor(vendor.id)}
                              className="opacity-0 transition-opacity group-hover:opacity-100 text-muted hover:text-primary"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
