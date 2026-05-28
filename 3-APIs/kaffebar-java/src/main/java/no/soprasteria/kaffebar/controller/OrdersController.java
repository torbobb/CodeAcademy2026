package no.soprasteria.kaffebar.controller;

import no.soprasteria.kaffebar.OrderNotFoundException;
import no.soprasteria.kaffebar.api.OrdersApi;
import no.soprasteria.kaffebar.model.Order;
import no.soprasteria.kaffebar.model.OrderConfirmation;
import no.soprasteria.kaffebar.model.Status;import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;import java.util.UUID;

@RestController
public class OrdersController implements OrdersApi {

    @Override
    public ResponseEntity<OrderConfirmation> getOrder(UUID orderId) {
        OrderConfirmation bekreftelse = new OrderConfirmation();
        bekreftelse.setId(UUID.randomUUID());
        bekreftelse.setCoffeeIds(new ArrayList<>());
        bekreftelse.getCoffeeIds().add(UUID.randomUUID());

        //return ResponseEntity.ok(bekreftelse);
        throw new OrderNotFoundException();
    }

    @Override
    public ResponseEntity<List<OrderConfirmation>> getOrders(Status status, Integer limit, Integer offset) {
        return null;
    }

    @Override
    public ResponseEntity<OrderConfirmation> orderCoffee(Order order) {
        System.out.println("vi har fått inn en ordre på "+order.getOrderItems().size()+" kaffe: "+ order.getOrderItems().getFirst().getCoffeeId());
        System.out.println("Ønsket størrelse: "+ order.getOrderItems().getFirst().getSize());
        System.out.println("Ønsket melketype: "+ order.getOrderItems().getFirst().getMilkType());
        System.out.println("Ønsket ekstra shot? "+ order.getOrderItems().getFirst().getExtraShot());

        OrderConfirmation bekreftelse = new OrderConfirmation();
        bekreftelse.setId(UUID.randomUUID());
        bekreftelse.setCoffeeIds(new ArrayList<>());
        bekreftelse.getCoffeeIds().add(order.getOrderItems().getFirst().getCoffeeId());

        return ResponseEntity.ok(bekreftelse);
    }

    @Override
    public ResponseEntity<Void> updateOrder(UUID orderId, Status status) {
        System.out.println("Vi skal oppdatere status på orderId "+orderId+" til: "+ status);

        return ResponseEntity.ok(null);
    }
}

