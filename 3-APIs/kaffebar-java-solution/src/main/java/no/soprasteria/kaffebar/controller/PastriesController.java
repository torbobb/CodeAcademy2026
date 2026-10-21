package no.soprasteria.kaffebar.controller;

import no.soprasteria.kaffebar.api.PastriesApi;
import no.soprasteria.kaffebar.model.Pastry;
import no.soprasteria.kaffebar.store.PastryMenu;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PastriesController implements PastriesApi {

    @Override
    public ResponseEntity<List<Pastry>> getPastries() {
        return ResponseEntity.ok(PastryMenu.ITEMS);
    }
}
