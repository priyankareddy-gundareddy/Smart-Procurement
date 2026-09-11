package com.smartprocure.smartprocure.controller;

import com.smartprocure.smartprocure.entity.ProcurementCentre;
import com.smartprocure.smartprocure.service.ProcurementCentreService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/centres")
@CrossOrigin(origins = "http://localhost:4173")
public class ProcurementCentreController {

    private final ProcurementCentreService procurementCentreService;

    public ProcurementCentreController(
            ProcurementCentreService procurementCentreService) {

        this.procurementCentreService =
                procurementCentreService;
    }


    // ================= GET ALL CENTRES =================

    @GetMapping
    public List<ProcurementCentre> getAllCentres() {

        return procurementCentreService
                .getAllCentres();
    }


    // ================= GET CENTRE BY ID =================

    @GetMapping("/{id}")
    public ProcurementCentre getCentreById(
            @PathVariable Integer id) {

        return procurementCentreService
                .getCentreById(id);
    }


    // ================= GET CENTRES BY DISTRICT =================

    @GetMapping("/district/{district}")
    public List<ProcurementCentre> getCentresByDistrict(
            @PathVariable String district) {

        return procurementCentreService
                .getCentresByDistrict(district);
    }


    // ================= UPDATE CENTRE STATUS =================

    @PutMapping("/{id}/status")
    public ProcurementCentre updateCentreStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> request) {

        Boolean isActive =
                request.get("isActive");


        if (isActive == null) {

            throw new RuntimeException(
                    "isActive is required"
            );
        }


        return procurementCentreService
                .updateCentreStatus(
                        id,
                        isActive
                );
    }


    // ================= NEARBY CENTRES =================

    // Find procurement centres near the farmer
    @GetMapping("/nearby")
    public List<Map<String, Object>> getNearbyCentres(
            @RequestParam double latitude,
            @RequestParam double longitude) {

        return procurementCentreService
                .getNearbyCentres(
                        latitude,
                        longitude
                );
    }
}