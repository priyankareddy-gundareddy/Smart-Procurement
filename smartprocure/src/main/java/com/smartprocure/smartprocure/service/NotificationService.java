package com.smartprocure.smartprocure.service;

import com.smartprocure.smartprocure.entity.Notification;
import com.smartprocure.smartprocure.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsByFarmer(Integer farmerId) {
        return notificationRepository
                .findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Integer id) {

        Notification notification =
                notificationRepository.findById(id).orElse(null);

        if (notification == null) {
            return null;
        }

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }
}