"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MixedOrder, OrderStatus } from "@/types/domain";

export const MIXED_ORDERS_QUERY_KEY = ["mixed-orders"] as const;

/**
 * Bestillinger med kaffe og bakst. De publiserer ikke hendelser på RabbitMQ, så
 * i stedet for å vente på en hendelse poller vi rolig.
 */
export function useMixedOrders(initialOrders: MixedOrder[]) {
  return useQuery({
    queryKey: MIXED_ORDERS_QUERY_KEY,
    queryFn: async (): Promise<MixedOrder[]> => {
      const response = await fetch("/api/mixed-orders", { cache: "no-store" });
      if (!response.ok) throw new Error("Klarte ikke å hente bestillinger");
      return response.json();
    },
    initialData: initialOrders,
    refetchInterval: 5000,
    staleTime: 1000,
  });
}

export function useUpdateMixedStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const response = await fetch(`/api/mixed-orders/${orderId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Klarte ikke å oppdatere status");
      return (await response.json()) as MixedOrder;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MIXED_ORDERS_QUERY_KEY }),
  });
}
