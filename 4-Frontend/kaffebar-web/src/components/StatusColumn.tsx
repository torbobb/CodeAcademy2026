"use client";

import { OrderCard } from "./OrderCard";
import { MixedOrderCard } from "./MixedOrderCard";
import { EmptyState } from "./EmptyState";
import { STATUS_LABEL, type MixedOrder, type Order, type OrderStatus } from "@/types/domain";

const ACCENT: Record<OrderStatus, string> = {
  PENDING: "var(--status-pending)",
  BREWING: "var(--status-brewing)",
  READY: "var(--status-ready)",
};

const EMPTY: Record<OrderStatus, { icon: string; description: string }> = {
  PENDING: { icon: "🧾", description: "Ingen nye bestillinger akkurat nå." },
  BREWING: { icon: "⏳", description: "Ingenting står på maskinen." },
  READY: { icon: "✅", description: "Alt er hentet." },
};

export function StatusColumn({
  status,
  orders,
  mixedOrders = [],
  names = new Map(),
  onAdvance,
  onAdvanceMixed,
  busyOrderId,
}: {
  status: OrderStatus;
  orders: Order[];
  mixedOrders?: MixedOrder[];
  names?: ReadonlyMap<string, string>;
  onAdvance?: (order: Order, next: OrderStatus) => void;
  onAdvanceMixed?: (order: MixedOrder, next: OrderStatus) => void;
  busyOrderId?: string | null;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <header className="flex items-center justify-between gap-2 border-b-2 pb-2" style={{ borderColor: ACCENT[status] }}>
        <h2 className="font-semibold" style={{ color: ACCENT[status] }}>
          {STATUS_LABEL[status]}
        </h2>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-secondary">
          {orders.length + mixedOrders.length}
        </span>
      </header>

      {orders.length + mixedOrders.length === 0 ? (
        <EmptyState
          icon={EMPTY[status].icon}
          title={STATUS_LABEL[status]}
          description={EMPTY[status].description}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {mixedOrders.map((order) => (
            <MixedOrderCard
              key={order.orderId}
              order={order}
              names={names}
              {...(onAdvanceMixed ? { onAdvance: onAdvanceMixed } : {})}
              busy={busyOrderId === order.orderId}
            />
          ))}
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              {...(onAdvance ? { onAdvance } : {})}
              busy={busyOrderId === order.orderId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
