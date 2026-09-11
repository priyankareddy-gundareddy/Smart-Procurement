package com.smartprocure.smartprocure.controller;

import com.smartprocure.smartprocure.entity.Notification;
import com.smartprocure.smartprocure.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4173")

public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/farmer/{farmerId}")
    public List<Notification> getNotificationsByFarmer(
            @PathVariable Integer farmerId) {

        return notificationService.getNotificationsByFarmer(farmerId);
    }

    @PostMapping
    public Notification createNotification(
            @RequestBody Notification notification) {

        return notificationService.createNotification(notification);
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Integer id) {

        return notificationService.markAsRead(id);
    }
}