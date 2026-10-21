package no.soprasteria.kaffebar.controller;

import no.soprasteria.kaffebar.api.OrdersV2Api;
import no.soprasteria.kaffebar.error.NotFoundException;
import no.soprasteria.kaffebar.model.CoffeeItem;
import no.soprasteria.kaffebar.model.CreateMixedOrderRequest;
import no.soprasteria.kaffebar.model.MixedOrder;
import no.soprasteria.kaffebar.model.OrderItem;
import no.soprasteria.kaffebar.model.OrderStatus;
import no.soprasteria.kaffebar.model.PastryItem;
import no.soprasteria.kaffebar.model.UpdateOrderStatusRequest;
import no.soprasteria.kaffebar.store.Menu;
import no.soprasteria.kaffebar.store.MixedOrderStore;
import no.soprasteria.kaffebar.store.PastryMenu;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Oppgave 9: bestillinger der hver linje er enten kaffe eller bakst.
 *
 * Hendelser til RabbitMQ publiseres ikke her: `order.created` har formen til
 * {@code Order}, og den er bevisst urørt.
 */
@RestController
public class MixedOrdersController implements OrdersV2Api {

    private final MixedOrderStore store;

    public MixedOrdersController(MixedOrderStore store) {
        this.store = store;
    }

    @Override
    public ResponseEntity<MixedOrder> createMixedOrder(CreateMixedOrderRequest request) {
        request.getItems().forEach(MixedOrdersController::requireOnMenu);

        MixedOrder order = store.create(request);
        return ResponseEntity
                .created(URI.create("/orders-v2/" + order.getOrderId()))
                .body(order);
    }

    @Override
    public ResponseEntity<List<MixedOrder>> listMixedOrders(OrderStatus status, Integer limit) {
        return ResponseEntity.ok(store.list(status, limit));
    }

    @Override
    public ResponseEntity<MixedOrder> getMixedOrder(UUID orderId) {
        return ResponseEntity.ok(store.find(orderId).orElseThrow(() -> notFound(orderId)));
    }

    @Override
    public ResponseEntity<MixedOrder> updateMixedOrderStatus(UUID orderId,
                                                              UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(store.setStatus(orderId, request.getStatus())
                .orElseThrow(() -> notFound(orderId)));
    }

    private static NotFoundException notFound(UUID orderId) {
        return new NotFoundException("Fant ingen bestilling med id " + orderId + ".");
    }

    private static void requireOnMenu(OrderItem item) {
        if (item instanceof CoffeeItem coffee) {
            Menu.find(coffee.getCoffeeId()).orElseThrow(() -> new NotFoundException(
                    "Fant ingen kaffe med id " + coffee.getCoffeeId() + ". Se GET /menu."));
        } else if (item instanceof PastryItem pastry) {
            PastryMenu.find(pastry.getPastryId()).orElseThrow(() -> new NotFoundException(
                    "Fant ingen bakverk med id " + pastry.getPastryId() + ". Se GET /pastries."));
        }
    }
}
