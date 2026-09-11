package com.smartprocure.smartprocure.repository;

import com.smartprocure.smartprocure.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Integer> {

    Optional<Farmer> findByPhone(String phone);
}