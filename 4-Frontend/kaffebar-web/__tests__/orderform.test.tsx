import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OrderForm } from "@/components/OrderForm";
import type { Coffee, Pastry } from "@/types/domain";

const menu: Coffee[] = [{ id: "c0ffee01-0000-4000-8000-000000000007", name: "Kaffe Latte", price: 52 }];
const pastries: Pastry[] = [
  { id: "ba5e0001-0000-4000-8000-000000000001", name: "Kanelbolle", price: 38 },
];

function renderForm(withPastries = true) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <OrderForm menu={menu} pastries={withPastries ? pastries : []} />
    </QueryClientProvider>,
  );
}

function mockFetch() {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("OrderForm med bakverk", () => {
  it("sender kaffe og bakverk som én blandet bestilling", async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText("Hvem ropes opp?"), "Ada");
    await user.click(screen.getByLabelText(/Kanelbolle/));
    await user.click(screen.getByRole("button", { name: "Bestill" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/mixed-orders");
    expect(JSON.parse(init.body)).toEqual({
      customerName: "Ada",
      items: [
        { type: "coffee", coffeeId: menu[0].id, size: "MEDIUM" },
        { type: "pastry", pastryId: pastries[0].id },
      ],
    });
  });

  it("bruker vanlig /api/orders når ingen bakverk er valgt", async () => {
    const fetchMock = mockFetch();
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByPlaceholderText("Hvem ropes opp?"), "Ada");
    await user.click(screen.getByRole("button", { name: "Bestill" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/orders");
  });

  it("skjuler bakverkvalget når menyen er tom", () => {
    renderForm(false);
    expect(screen.queryByText(/bakverk/i)).not.toBeInTheDocument();
  });
});
