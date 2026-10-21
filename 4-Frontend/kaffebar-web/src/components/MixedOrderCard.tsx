"use client";

import { nextStatus } from "./OrderCard";
import { timeAgo } from "@/lib/format";
import { MILK_LABEL, SIZE_LABEL, type MixedOrder, type OrderStatus } from "@/types/domain";

const NEXT_LABEL: Record<string, string> = {
  BREWING: "Start brygging",
  READY: "Marker som klar",
};

/** Baristakort for en bestilling med både kaffe og bakst. `names` slår opp id → navn. */
export function MixedOrderCard({
  order,
  names,
  onAdvance,
  busy = false,
}: {
  order: MixedOrder;
  names: ReadonlyMap<string, string>;
  onAdvance?: (order: MixedOrder, status: OrderStatus) => void;
  busy?: boolean;
}) {
  const next = nextStatus(order.status);

  return (
    <article className="animate-fade-in rounded-xl border border-line bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <p className="truncate font-semibold">{order.customerName}</p>
        <time className="shrink-0 text-xs text-muted" dateTime={order.createdAt}>
          {timeAgo(order.createdAt)}
        </time>
      </header>

      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {order.items.map((item, index) => {
          if (item.type === "coffee") {
            const details = [
              SIZE_LABEL[item.size],
              item.milkType ? MILK_LABEL[item.milkType] : null,
              item.extraShot ? "ekstra shot" : null,
            ].filter(Boolean);
            return (
              <li key={index}>
                <span className="text-secondary">☕ {names.get(item.coffeeId) ?? "Kaffe"}</span>
                <span className="text-xs text-muted"> · {details.join(" · ")}</span>
              </li>
            );
          }

          const details = [item.isVegan ? "vegansk" : null, item.warmed ? "varmet" : null].filter(
            Boolean,
          );
          return (
            <li key={index}>
              <span className="text-secondary">🥐 {names.get(item.pastryId) ?? "Bakverk"}</span>
              {details.length > 0 && (
                <span className="text-xs text-muted"> · {details.join(" · ")}</span>
              )}
            </li>
          );
        })}
      </ul>

      {onAdvance && next && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAdvance(order, next)}
          className="mt-3 w-full rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Oppdaterer …" : NEXT_LABEL[next]}
        </button>
      )}
    </article>
  );
}
