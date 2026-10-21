import { NextResponse, type NextRequest } from "next/server";
import { updateMixedOrderStatus } from "@/lib/api";
import type { OrderStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

/** BFF for baristaknappene på blandede bestillinger. Se /api/orders/[orderId]. */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const { status } = (await request.json()) as { status: OrderStatus };

  try {
    return NextResponse.json(await updateMixedOrderStatus(orderId, status));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    return NextResponse.json({ message }, { status: 502 });
  }
}
