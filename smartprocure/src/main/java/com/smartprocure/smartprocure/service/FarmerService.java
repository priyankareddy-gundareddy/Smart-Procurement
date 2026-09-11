package com.smartprocure.smartprocure.service;

import com.smartprocure.smartprocure.entity.Farmer;
import com.smartprocure.smartprocure.repository.FarmerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FarmerService {

    private final FarmerRepository farmerRepository;

    public FarmerService(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    public Farmer registerFarmer(Farmer farmer) {
        return farmerRepository.save(farmer);
    }

    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    public Farmer loginFarmer(String phone, String password) {

        Farmer farmer = farmerRepository.findByPhone(phone)
                .orElse(null);

        if (farmer != null && farmer.getPassword().equals(password)) {
            return farmer;
        }

        return null;
    }
}