package com.smartprocure.smartprocure.repository;

import com.smartprocure.smartprocure.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByFarmerIdOrderByCreatedAtDesc(Integer farmerId);
}