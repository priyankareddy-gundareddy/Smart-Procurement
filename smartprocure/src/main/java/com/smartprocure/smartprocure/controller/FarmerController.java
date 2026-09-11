package com.smartprocure.smartprocure.controller;

import com.smartprocure.smartprocure.entity.Farmer;
import com.smartprocure.smartprocure.service.FarmerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4173")
@RequestMapping("/api/farmers")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @PostMapping("/register")
    public Farmer registerFarmer(@RequestBody Farmer farmer) {
        return farmerService.registerFarmer(farmer);
    }

    @GetMapping
    public List<Farmer> getAllFarmers() {
        return farmerService.getAllFarmers();
    }

    @PostMapping("/login")
    public Farmer loginFarmer(@RequestBody Farmer farmer) {
        return farmerService.loginFarmer(
                farmer.getPhone(),
                farmer.getPassword()
        );
    }
}