package com.smartprocure.smartprocure.repository;

import com.smartprocure.smartprocure.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfficerRepository extends JpaRepository<Officer, Integer> {

    Optional<Officer> findByEmailAndPassword(
            String email,
            String password
    );
}