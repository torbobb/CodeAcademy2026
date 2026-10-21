package no.soprasteria.kaffebar.store;

import no.soprasteria.kaffebar.model.CreateMixedOrderRequest;
import no.soprasteria.kaffebar.model.MixedOrder;
import no.soprasteria.kaffebar.model.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/** Lagring i minne for bestillinger med blandede varelinjer. Se {@link OrderStore}. */
@Component
public class MixedOrderStore {

    private final Map<UUID, MixedOrder> orders = new ConcurrentHashMap<>();

    public MixedOrder create(CreateMixedOrderRequest request) {
        MixedOrder order = new MixedOrder(
                UUID.randomUUID(),
                request.getCustomerName().trim(),
                new ArrayList<>(request.getItems()),
                OrderStatus.PENDING,
                OrderStore.now());
        orders.put(order.getOrderId(), order);
        return order;
    }

    public Optional<MixedOrder> find(UUID orderId) {
        return Optional.ofNullable(orders.get(orderId));
    }

    /** Nyeste først, filtrert på status. */
    public List<MixedOrder> list(OrderStatus status, int limit) {
        return orders.values().stream()
                .filter(order -> status == null || order.getStatus() == status)
                .sorted(Comparator.comparing(MixedOrder::getCreatedAt).reversed())
                .limit(limit)
                .toList();
    }

    public Optional<MixedOrder> setStatus(UUID orderId, OrderStatus status) {
        return find(orderId).map(order -> {
            order.setStatus(status);
            return order;
        });
    }

    public void reset() {
        orders.clear();
    }
}
