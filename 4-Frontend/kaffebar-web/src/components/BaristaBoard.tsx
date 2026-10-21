"use client";

import { useMemo, useState } from "react";
import { StatusColumn } from "./StatusColumn";
import { LiveIndicator } from "./LiveIndicator";
import { useOrders, useUpdateStatus } from "@/hooks/useOrders";
import { useMixedOrders, useUpdateMixedStatus } from "@/hooks/useMixedOrders";
import {
  STATUS_ORDER,
  type Coffee,
  type MixedOrder,
  type Order,
  type OrderStatus,
  type Pastry,
} from "@/types/domain";

/**
 * Baristaskjermen. Utlevert.
 *
 * Denne komponenten er grunnen til at hendelsene er verdt bryet: den har ingen egen
 * tilstand for ordrene. Den leser fra TanStack Query, og `useOrders` invaliderer
 * cachen når det kommer en hendelse over SSE. Ingen polling, ingen manuell synk.
 *
 * Bestillinger med kaffe og bakst (`/orders-v2`) vises i de samme kolonnene. De har
 * ingen hendelser, så de hentes med rolig polling (se `useMixedOrders`).
 */
export function BaristaBoard({
  initialOrders,
  initialMixedOrders = [],
  menu = [],
  pastries = [],
}: {
  initialOrders: Order[];
  initialMixedOrders?: MixedOrder[];
  menu?: Coffee[];
  pastries?: Pastry[];
}) {
  const { data: orders = [], connection } = useOrders(initialOrders);
  const { data: mixedOrders = [] } = useMixedOrders(initialMixedOrders);
  const updateStatus = useUpdateStatus();
  const updateMixedStatus = useUpdateMixedStatus();
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const names = useMemo(
    () => new Map([...menu, ...pastries].map((item) => [item.id, item.name])),
    [menu, pastries],
  );

  const advance = (order: Order, status: OrderStatus) => {
    setBusyOrderId(order.orderId);
    updateStatus.mutate(
      { orderId: order.orderId, status },
      { onSettled: () => setBusyOrderId(null) },
    );
  };

  const advanceMixed = (order: MixedOrder, status: OrderStatus) => {
    setBusyOrderId(order.orderId);
    updateMixedStatus.mutate(
      { orderId: order.orderId, status },
      { onSettled: () => setBusyOrderId(null) },
    );
  };

  const total = orders.length + mixedOrders.length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-secondary">
          {total} bestilling{total === 1 ? "" : "er"} i køen
        </p>
        <LiveIndicator state={connection} />
      </div>

      {connection === "closed" && (
        <p className="rounded-lg border border-line bg-accent-soft px-3 py-2 text-sm text-secondary">
          Ingen live-forbindelse. Køen oppdaterer seg ikke av seg selv — sjekk hooken
          i <code className="font-mono">src/hooks/useEventSource.ts</code> (oppgave 1),
          og at kilden i <code className="font-mono">useOrders.ts</code> peker riktig.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {STATUS_ORDER.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            orders={orders.filter((order) => order.status === status)}
            mixedOrders={mixedOrders.filter((order) => order.status === status)}
            names={names}
            onAdvance={advance}
            onAdvanceMixed={advanceMixed}
            busyOrderId={busyOrderId}
          />
        ))}
      </div>
    </div>
  );
}
