package no.soprasteria.kaffebar.store;

import no.soprasteria.kaffebar.model.Pastry;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Bakverkmenyen. Faste uuid-er, av samme grunn som i {@link Menu}. */
public final class PastryMenu {

    public static final List<Pastry> ITEMS = List.of(
            pastry("ba5e0001-0000-4000-8000-000000000001", "Kanelbolle", 38),
            pastry("ba5e0001-0000-4000-8000-000000000002", "Croissant", 42),
            pastry("ba5e0001-0000-4000-8000-000000000003", "Skolebrød", 36),
            pastry("ba5e0001-0000-4000-8000-000000000004", "Vegansk muffins", 40),
            pastry("ba5e0001-0000-4000-8000-000000000005", "Brownie", 44));

    private PastryMenu() {
    }

    public static Optional<Pastry> find(UUID pastryId) {
        return ITEMS.stream().filter(p -> p.getId().equals(pastryId)).findFirst();
    }

    private static Pastry pastry(String id, String name, int price) {
        return new Pastry(UUID.fromString(id), name, new BigDecimal(price));
    }
}
