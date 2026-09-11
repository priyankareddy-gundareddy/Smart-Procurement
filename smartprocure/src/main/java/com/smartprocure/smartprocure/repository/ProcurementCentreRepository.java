package com.smartprocure.smartprocure.repository;

import com.smartprocure.smartprocure.entity.ProcurementCentre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcurementCentreRepository extends JpaRepository<ProcurementCentre, Integer> {

    List<ProcurementCentre> findByDistrict(String district);
}