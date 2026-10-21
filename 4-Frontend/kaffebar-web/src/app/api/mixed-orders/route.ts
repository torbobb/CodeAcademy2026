import { NextResponse, type NextRequest } from "next/server";
import { createMixedOrder, fetchMixedOrders } from "@/lib/api";
import type { CreateMixedOrderRequest } from "@/types/domain";

export const dynamic = "force-dynamic";

/** BFF for bestillinger med både kaffe og bakst. Se /api/orders. */
export async function GET() {
  try {
    return NextResponse.json(await fetchMixedOrders());
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 502 },
    );
  }
}
export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateMixedOrderRequest;

  try {
    const order = await createMixedOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Ukjent feil" },
      { status: 400 },
    );
  }
}
