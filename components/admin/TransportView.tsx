"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { useAuth } from "@/components/admin/AuthContext";
import { useRsvpData } from "./useRsvpData";
import type { RsvpRecord } from "./useRsvpData";

type TransportRoute = {
  id: string;
  name: string;
  description?: string;
  departureTime: string;
  returnTime: string;
  capacity: number;
  notes?: string;
  createdAt?: Date | null;
};

type Assignment = {
  id: string;
  rsvpId: string;
  rsvpName: string;
  seats: number;
  createdAt?: Date | null;
};

export function TransportView() {
  const { user } = useAuth();
  const { records: rsvps } = useRsvpData(500);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});

  useEffect(() => {
    const db = getFirestoreDb();
    const routesRef = collection(db, "transport_routes");
    const routesQuery = query(routesRef, orderBy("departureTime", "asc"));

    const unsubscribeRoutes = onSnapshot(
      routesQuery,
      (snapshot) => {
        const nextRoutes: TransportRoute[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          nextRoutes.push({
            id: docSnap.id,
            name: String(data.name ?? "Ruta"),
            description: data.description ? String(data.description) : undefined,
            departureTime: String(data.departureTime ?? ""),
            returnTime: String(data.returnTime ?? ""),
            capacity: Number(data.capacity ?? 0),
            notes: data.notes ? String(data.notes) : undefined,
            createdAt: data.createdAt
              ? new Date((data.createdAt as { toMillis: () => number }).toMillis())
              : null,
          });
        });
        setRoutes(nextRoutes);
        setIsLoading(false);
        if (!selectedRouteId && nextRoutes.length > 0) {
          setSelectedRouteId(nextRoutes[0].id);
        }
      },
      (err) => {
        console.error(err);
        setError("No se pudieron cargar las rutas de transporte.");
        setIsLoading(false);
      },
    );

    return unsubscribeRoutes;
  }, [selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId) return;
    const db = getFirestoreDb();
    const assignmentsRef = collection(db, "transport_routes", selectedRouteId, "assignments");
    const assignmentsQuery = query(assignmentsRef, orderBy("createdAt", "asc"));

    const unsubscribeAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const routeAssignments: Assignment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        routeAssignments.push({
          id: docSnap.id,
          rsvpId: String(data.rsvpId ?? ""),
          rsvpName: String(data.rsvpName ?? "Invitado"),
          seats: Number(data.seats ?? 0),
          createdAt: data.createdAt
            ? new Date((data.createdAt as { toMillis: () => number }).toMillis())
            : null,
        });
      });
      setAssignments((prev) => ({ ...prev, [selectedRouteId]: routeAssignments }));
    });

    return unsubscribeAssignments;
  }, [selectedRouteId]);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );

  const currentAssignments = useMemo(
    () => (selectedRouteId ? assignments[selectedRouteId] ?? [] : []),
    [assignments, selectedRouteId],
  );

  const totalAssignedSeats = currentAssignments.reduce(
    (acc, assignment) => acc + assignment.seats,
    0,
  );

  const overbooked =
    selectedRoute != null && totalAssignedSeats > selectedRoute.capacity;
  const remainingSeats = selectedRoute
    ? Math.max(selectedRoute.capacity - totalAssignedSeats, 0)
    : 0;
  const capacityUsage = selectedRoute
    ? Math.min((totalAssignedSeats / Math.max(selectedRoute.capacity, 1)) * 100, 100)
    : 0;

  const currentRsvpAssignments = useMemo(() => {
    return new Set(currentAssignments.map((assignment) => assignment.rsvpId));
  }, [currentAssignments]);

  const availableRsvps = useMemo(() => {
    return rsvps.filter(
      (rsvp) =>
        rsvp.needsTransport === "si" &&
        !currentRsvpAssignments.has(rsvp.id) &&
        (!rsvp.transportRouteId || rsvp.transportRouteId === selectedRouteId),
    );
  }, [rsvps, currentRsvpAssignments, selectedRouteId]);

  async function handleCreateDefaultRoute() {
    const db = getFirestoreDb();
    const routesRef = collection(db, "transport_routes");

    try {
      const docRef = await addDoc(routesRef, {
        name: "Bus central Ponferrada",
        description: "Salida y regreso al centro (estación de autobuses).",
        departureTime: "2025-09-12T12:30:00",
        returnTime: "2025-09-13T02:00:00",
        capacity: 55,
        notes: "Salida desde la estación de autobuses de Ponferrada a las 12:30. Regreso a las 02:00.",
        createdAt: serverTimestamp(),
      });
      setSelectedRouteId(docRef.id);
    } catch (err) {
      console.error(err);
      setError("No se pudo crear la ruta por defecto.");
    }
  }

  async function handleAssignSeats(rsvp: RsvpRecord, seats: number) {
    if (!selectedRoute) return;
    if (seats < 1) return;
    if (seats > remainingSeats) {
      setError("No hay suficientes plazas disponibles en este autobús.");
      return;
    }

    const maxAllowedSeats = Math.max(
      rsvp.transportSeats ?? rsvp.guests ?? 1,
      1,
    );
    if (seats > maxAllowedSeats) {
      setError(
        `Este invitado pidió ${maxAllowedSeats} plaza${maxAllowedSeats === 1 ? "" : "s"}.`,
      );
      return;
    }

    if (currentRsvpAssignments.has(rsvp.id)) {
      setError("Este invitado ya está asignado a este autobús.");
      return;
    }

    const db = getFirestoreDb();
    const assignmentsRef = collection(db, "transport_routes", selectedRoute.id, "assignments");

    try {
      const assignmentRef = doc(assignmentsRef);
      const batch = writeBatch(db);
      batch.set(assignmentRef, {
        rsvpId: rsvp.id,
        rsvpName: rsvp.fullName,
        seats,
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, "rsvps", rsvp.id), {
        transportRouteId: selectedRoute.id,
        transportAssignedSeats: seats,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email ?? null,
      });
      await batch.commit();
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo asignar el invitado. Intenta de nuevo.");
    }
  }

  async function handleRemoveAssignment(assignment: Assignment) {
    if (!selectedRoute) return;
    const db = getFirestoreDb();
    try {
      const batch = writeBatch(db);
      batch.delete(
        doc(db, "transport_routes", selectedRoute.id, "assignments", assignment.id),
      );
      batch.update(doc(db, "rsvps", assignment.rsvpId), {
        transportRouteId: null,
        transportAssignedSeats: 0,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email ?? null,
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la asignación.");
    }
  }

  async function handleUpdateRoute(routeId: string, values: Partial<TransportRoute>) {
    const db = getFirestoreDb();
    const routeRef = doc(db, "transport_routes", routeId);

    try {
      await updateDoc(routeRef, {
        ...values,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email ?? null,
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron guardar los cambios de la ruta.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">Transporte</h1>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Aún no tienes rutas creadas. Puedes crear la ruta por defecto para el bus
            desde el centro de Ponferrada y empezar a asignar invitados.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateDefaultRoute}
          className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30"
        >
          Crear ruta por defecto
        </button>
        {error && <p className="text-xs text-primary">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Transporte</h1>
          <p className="text-sm text-muted">
            Gestiona las rutas de bus, asigna plazas y controla el aforo.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelectedRouteId(route.id)}
              aria-pressed={selectedRouteId === route.id}
              className={[
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition",
                selectedRouteId === route.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted hover:border-primary/60 hover:text-primary",
              ].join(" ")}
            >
              {route.name}
            </button>
          ))}
        </div>
      </header>

      {selectedRoute ? (
        <section className="flex flex-col gap-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
              <h2 className="text-xl font-semibold">{selectedRoute.name}</h2>
              <p className="mt-2 text-sm text-muted">
                Salida: {new Date(selectedRoute.departureTime).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-muted">
                Regreso: {new Date(selectedRoute.returnTime).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-3 text-sm text-muted">
                {selectedRoute.description}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">Capacidad</span>
                  <p className="text-lg font-semibold">{selectedRoute.capacity} plazas</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">Asignadas</span>
                  <p className="text-lg font-semibold">{totalAssignedSeats}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">Disponibles</span>
                  <p className="text-lg font-semibold">{remainingSeats}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                  <div
                    className={[
                      "h-full rounded-full",
                      overbooked ? "bg-primary" : "bg-emerald-400",
                    ].join(" ")}
                    style={{ width: `${capacityUsage}%` }}
                  />
                </div>
                {overbooked && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Capacidad superada
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]">
              <h3 className="text-lg font-semibold">Editar notas</h3>
              <textarea
                rows={5}
                defaultValue={selectedRoute.notes}
                onBlur={(event) =>
                  handleUpdateRoute(selectedRoute.id, { notes: event.target.value })
                }
                placeholder="Detalles logísticos, contactos de chofer, recordatorios..."
                className="mt-3 w-full rounded-3xl border border-border/80 bg-background px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              {error && <p className="mt-2 text-xs text-primary">{error}</p>}
            </article>
          </div>

          <section className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Invitados asignados</h3>
              <span className="text-sm text-muted">
                {currentAssignments.length} registros
              </span>
            </header>
            {currentAssignments.length === 0 ? (
              <p className="text-sm text-muted">
                Todavía no hay invitados asignados a esta ruta.
              </p>
            ) : (
              <>
                <div className="grid gap-3 md:hidden">
                  {currentAssignments.map((assignment) => (
                    <article
                      key={assignment.id}
                      className="rounded-[20px] border border-border/70 bg-surface/95 p-4 shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {assignment.rsvpName}
                          </p>
                          <p className="text-xs text-muted">
                            {assignment.createdAt
                              ? assignment.createdAt.toLocaleString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                          {assignment.seats} plazas
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(assignment)}
                        className="mt-4 w-full rounded-full border border-border px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                      >
                        Quitar
                      </button>
                    </article>
                  ))}
                </div>
                <div className="hidden overflow-x-auto rounded-[20px] border border-border/70 bg-surface/95 shadow-[var(--shadow-soft)] md:block">
                  <table className="w-full min-w-[720px] divide-y divide-border/60 text-left text-sm">
                    <thead className="bg-accent/70 text-xs uppercase tracking-[0.3em] text-muted">
                      <tr>
                        <th className="px-4 py-3">Invitado</th>
                        <th className="px-4 py-3">Plazas</th>
                        <th className="px-4 py-3">Asignado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {currentAssignments.map((assignment) => (
                        <tr key={assignment.id} className="bg-background/40">
                          <td className="px-4 py-4 font-semibold text-foreground">
                            {assignment.rsvpName}
                          </td>
                          <td className="px-4 py-4">{assignment.seats}</td>
                          <td className="px-4 py-4 text-xs text-muted">
                            {assignment.createdAt
                              ? assignment.createdAt.toLocaleString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveAssignment(assignment)}
                              className="rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted transition hover:border-primary/60 hover:text-primary"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Asignar nuevo invitado</h3>
            {remainingSeats === 0 ? (
              <p className="text-sm text-primary">
                No quedan plazas disponibles en este autobús. Crea otro bus o libera algunas plazas.
              </p>
            ) : (
              <AssignForm
                rsvps={availableRsvps}
                onAssign={handleAssignSeats}
                maxSeats={remainingSeats}
              />
            )}
          </section>
        </section>
      ) : (
        <p className="text-sm text-muted">
          Selecciona una ruta para ver los detalles.
        </p>
      )}
    </div>
  );
}

function AssignForm({
  rsvps,
  onAssign,
  maxSeats,
}: {
  rsvps: RsvpRecord[];
  onAssign: (rsvp: RsvpRecord, seats: number) => void;
  maxSeats: number;
}) {
  const [selectedRsvpId, setSelectedRsvpId] = useState<string>("");
  const [seats, setSeats] = useState<string>("1");
  const [localError, setLocalError] = useState<string | null>(null);
  const selectedRsvp = useMemo(
    () => rsvps.find((item) => item.id === selectedRsvpId) ?? null,
    [rsvps, selectedRsvpId],
  );
  const suggestedSeats = useMemo(() => {
    if (!selectedRsvp) return 1;
    const requested = selectedRsvp.transportSeats ?? selectedRsvp.guests ?? 1;
    return Math.min(Math.max(requested, 1), Math.max(maxSeats, 1));
  }, [maxSeats, selectedRsvp]);

  useEffect(() => {
    if (!selectedRsvp) return;
    const next = String(suggestedSeats);
    if (seats !== next) {
      setSeats(next);
    }
  }, [selectedRsvp, suggestedSeats, seats]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rsvp = rsvps.find((item) => item.id === selectedRsvpId);
    const seatNumber = Number.parseInt(seats, 10);

    if (!rsvp) {
      setLocalError("Selecciona un invitado.");
      return;
    }

    const maxAllowedSeats = Math.max(
      rsvp.transportSeats ?? rsvp.guests ?? 1,
      1,
    );
    const finalMax = Math.min(maxAllowedSeats, maxSeats);

    if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > finalMax) {
      setLocalError("Número de plazas no válido para este invitado.");
      return;
    }

    onAssign(rsvp, seatNumber);
    setSelectedRsvpId("");
    setSeats("1");
    setLocalError(null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border/80 bg-surface/95 p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Invitado
        </label>
        <select
          value={selectedRsvpId}
          onChange={(event) => setSelectedRsvpId(event.target.value)}
          className="rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Selecciona una opción</option>
          {rsvps.map((rsvp) => (
            <option key={rsvp.id} value={rsvp.id}>
              {rsvp.fullName} · {rsvp.guests} pax
            </option>
          ))}
        </select>
        {selectedRsvp && (
          <span className="text-xs text-muted">
            Solicitó {selectedRsvp.transportSeats ?? selectedRsvp.guests ?? 1} plazas
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Plazas a reservar
        </label>
        <input
          value={seats}
          onChange={(event) => setSeats(event.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          min={1}
          max={maxSeats}
          className="w-full rounded-full border border-border/80 bg-background px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <span className="text-xs text-muted">Disponibles: {maxSeats}</span>
      </div>
      {localError && <p className="text-xs text-primary">{localError}</p>}
      <button
        type="submit"
        className="self-end rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground transition hover:translate-y-[-1px] hover:shadow-lg hover:shadow-primary/30"
      >
        Añadir invitado
      </button>
    </form>
  );
}
