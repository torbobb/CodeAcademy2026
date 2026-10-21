import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MixedOrderCard } from "@/components/MixedOrderCard";
import { StatusColumn } from "@/components/StatusColumn";
import type { MixedOrder } from "@/types/domain";

const order: MixedOrder = {
  orderId: "11111111-0000-4000-8000-000000000001",
  customerName: "Ada",
  status: "PENDING",
  createdAt: new Date().toISOString(),
  items: [
    { type: "coffee", coffeeId: "c1", size: "MEDIUM", milkType: "OAT" },
    { type: "pastry", pastryId: "p1", isVegan: true },
  ],
};
const names = new Map([
  ["c1", "Kaffe Latte"],
  ["p1", "Kanelbolle"],
]);

describe("MixedOrderCard", () => {
  it("viser både kaffe og bakverk med navn og detaljer", () => {
    render(<MixedOrderCard order={order} names={names} />);
    expect(screen.getByText(/Kaffe Latte/)).toBeInTheDocument();
    expect(screen.getByText(/Havre/)).toBeInTheDocument();
    expect(screen.getByText(/Kanelbolle/)).toBeInTheDocument();
    expect(screen.getByText(/vegansk/)).toBeInTheDocument();
  });

  it("flytter bestillingen til neste status", async () => {
    const onAdvance = vi.fn();
    render(<MixedOrderCard order={order} names={names} onAdvance={onAdvance} />);
    await userEvent.click(screen.getByRole("button", { name: "Start brygging" }));
    expect(onAdvance).toHaveBeenCalledWith(order, "BREWING");
  });
});

describe("StatusColumn med blandede bestillinger", () => {
  it("teller og viser dem sammen med vanlige bestillinger", () => {
    render(<StatusColumn status="PENDING" orders={[]} mixedOrders={[order]} names={names} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
});
