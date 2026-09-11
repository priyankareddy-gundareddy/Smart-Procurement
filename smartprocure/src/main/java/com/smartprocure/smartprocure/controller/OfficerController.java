package com.smartprocure.smartprocure.controller;

import com.smartprocure.smartprocure.entity.Officer;
import com.smartprocure.smartprocure.service.OfficerService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/officers")
@CrossOrigin(origins = "http://localhost:4173")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    // Get all officers
    @GetMapping
    public List<Officer> getAllOfficers() {
        return officerService.getAllOfficers();
    }

    // Get officer by ID
    @GetMapping("/{id}")
    public Officer getOfficerById(@PathVariable Integer id) {
        return officerService.getOfficerById(id);
    }

    // Officer login
    @PostMapping("/login")
    public Officer loginOfficer(@RequestBody Officer officer) {
        return officerService.loginOfficer(
                officer.getEmail(),
                officer.getPassword()
        );
    }

    // Get queue for officer's centre on selected date
    @GetMapping("/{officerId}/queue")
    public List<Map<String, Object>> getQueueByDate(
            @PathVariable Integer officerId,
            @RequestParam LocalDate date) {

        return officerService.getQueueByDate(officerId, date);
    }
}