import type {
  Coffee,
  CreateMixedOrderRequest,
  CreateOrderRequest,
  MixedOrder,
  Order,
  OrderStatus,
  Pastry,
} from "@/types/domain";
import { emitMockOrderCreated, emitMockStatusChanged } from "./events";
import {
  addMockMixedOrder,
  createMockOrder,
  listMockMixedOrders,
  listMockOrders,
  MOCK_MENU,
  MOCK_PASTRIES,
  setMockMixedStatus,
  setMockStatus,
} from "./store";

/**
 * Mock-modus: de samme fire operasjonene som `src/lib/api.ts`, men mot
 * minnelageret i stedet for over HTTP.
 *
 * Hvorfor ikke bare la et mock-bibliotek fange opp nettverkskallene? Fordi
 * serversiden i Next allerede har byttet ut `fetch` med sin egen versjon, og da
 * blir det et kappløp om hvem som pakker inn hvem. Vinner feil part, går kallet
 * ut på ekte og feiler med «fetch failed» — uten at noe sier fra om hvorfor.
 * Her er det ingen interception i det hele tatt, bare et funksjonskall, og da
 * oppfører mock-modus seg likt hver eneste gang.
 *
 * Feilmeldingene er de samme som API-et ville gitt, slik at feilhåndteringen i
 * UI-et kan testes uten containere.
 */

export function mockFetchMenu(): Coffee[] {
  return MOCK_MENU;
}

export function mockFetchPastries(): Pastry[] {
  return MOCK_PASTRIES;
}

export function mockCreateMixedOrder(request: CreateMixedOrderRequest): MixedOrder {
  if (!request.customerName?.trim() || request.customerName.trim().length < 2) {
    throw new Error("customerName må være minst 2 tegn.");
  }
  if (!request.items?.length) {
    throw new Error("items må inneholde minst én varelinje.");
  }

  for (const item of request.items) {
    if (item.type === "coffee" && !MOCK_MENU.some((c) => c.id === item.coffeeId)) {
      throw new Error(`Fant ingen kaffe med id ${item.coffeeId}.`);
    }
    if (item.type === "pastry" && !MOCK_PASTRIES.some((p) => p.id === item.pastryId)) {
      throw new Error(`Fant ingen bakverk med id ${item.pastryId}.`);
    }
  }

  return addMockMixedOrder({
    orderId: crypto.randomUUID(),
    customerName: request.customerName.trim(),
    items: request.items,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });
}

export function mockFetchMixedOrders(
  params: { status?: OrderStatus; limit?: number } = {},
): MixedOrder[] {
  return listMockMixedOrders(params);
}

export function mockUpdateMixedOrderStatus(orderId: string, status: OrderStatus): MixedOrder {
  const order = setMockMixedStatus(orderId, status);
  if (!order) throw new Error(`Fant ingen bestilling med id ${orderId}.`);
  return order;
}

export function mockFetchOrders(params: { status?: OrderStatus; limit?: number } = {}): Order[] {
  return listMockOrders(params);
}

export function mockCreateOrder(request: CreateOrderRequest): Order {
  if (!request.customerName?.trim() || request.customerName.trim().length < 2) {
    throw new Error("customerName må være minst 2 tegn.");
  }

  let order: Order;
  try {
    order = createMockOrder(request);
  } catch {
    throw new Error(`Fant ingen kaffe med id ${request.coffeeId}.`);
  }

  emitMockOrderCreated(order);
  return order;
}

export function mockUpdateOrderStatus(orderId: string, status: OrderStatus): Order {
  const result = setMockStatus(orderId, status);
  if (!result) {
    throw new Error(`Fant ingen bestilling med id ${orderId}.`);
  }

  if (result.previousStatus !== status) {
    emitMockStatusChanged(result.order, result.previousStatus);
  }

  return result.order;
}
