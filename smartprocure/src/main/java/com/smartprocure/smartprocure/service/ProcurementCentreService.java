package com.smartprocure.smartprocure.service;

import com.smartprocure.smartprocure.entity.ProcurementCentre;
import com.smartprocure.smartprocure.repository.BookingRepository;
import com.smartprocure.smartprocure.repository.ProcurementCentreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProcurementCentreService {

    private final ProcurementCentreRepository procurementCentreRepository;
    private final BookingRepository bookingRepository;

    public ProcurementCentreService(
            ProcurementCentreRepository procurementCentreRepository,
            BookingRepository bookingRepository) {

        this.procurementCentreRepository = procurementCentreRepository;
        this.bookingRepository = bookingRepository;
    }


    public List<ProcurementCentre> getAllCentres() {

        return procurementCentreRepository.findAll();
    }


    public ProcurementCentre getCentreById(Integer id) {

        return procurementCentreRepository
                .findById(id)
                .orElse(null);
    }


    public List<ProcurementCentre> getCentresByDistrict(
            String district) {

        return procurementCentreRepository
                .findByDistrict(district);
    }


    // ================= UPDATE CENTRE STATUS =================

    public ProcurementCentre updateCentreStatus(
            Integer id,
            Boolean isActive) {

        ProcurementCentre centre =
                procurementCentreRepository
                        .findById(id)
                        .orElse(null);

        if (centre == null) {
            return null;
        }

        centre.setIsActive(isActive);

        return procurementCentreRepository.save(centre);
    }


    // ================= NEARBY CENTRES =================

    // Find nearby procurement centres using farmer's GPS location
    public List<Map<String, Object>> getNearbyCentres(
            double farmerLatitude,
            double farmerLongitude) {

        List<ProcurementCentre> centres =
                procurementCentreRepository.findAll();

        LocalDate today = LocalDate.now();

        List<Map<String, Object>> result =
                new ArrayList<>();


        for (ProcurementCentre centre : centres) {

            if (centre.getLatitude() == null ||
                    centre.getLongitude() == null) {

                continue;
            }


            double distance =
                    calculateDistance(
                            farmerLatitude,
                            farmerLongitude,
                            centre.getLatitude(),
                            centre.getLongitude()
                    );


            // Count today's bookings for this centre
            long bookedSlots =
                    bookingRepository
                            .countByCentreIdAndBookingDate(
                                    centre.getId(),
                                    today
                            );


            // Each centre has 24 slots per day
            long availableSlots =
                    Math.max(
                            0,
                            24 - bookedSlots
                    );


            Map<String, Object> centreData =
                    new HashMap<>();


            centreData.put(
                    "id",
                    centre.getId()
            );

            centreData.put(
                    "name",
                    centre.getName()
            );

            centreData.put(
                    "location",
                    centre.getLocation()
            );

            centreData.put(
                    "district",
                    centre.getDistrict()
            );

            centreData.put(
                    "contactNumber",
                    centre.getContactNumber()
            );

            centreData.put(
                    "openingTime",
                    centre.getOpeningTime()
            );

            centreData.put(
                    "closingTime",
                    centre.getClosingTime()
            );

            centreData.put(
                    "isActive",
                    centre.getIsActive()
            );

            centreData.put(
                    "latitude",
                    centre.getLatitude()
            );

            centreData.put(
                    "longitude",
                    centre.getLongitude()
            );

            centreData.put(
                    "distanceKm",
                    Math.round(
                            distance * 100.0
                    ) / 100.0
            );


            // Available slots
            centreData.put(
                    "availableSlots",
                    availableSlots
            );


            result.add(centreData);
        }


        // Nearest centre first
        result.sort(
                Comparator.comparingDouble(
                        centre ->
                                ((Number)
                                        centre.get("distanceKm"))
                                        .doubleValue()
                )
        );


        return result;
    }


    // ================= HAVERSINE FORMULA =================

    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final double EARTH_RADIUS_KM =
                6371.0;


        double latDistance =
                Math.toRadians(
                        lat2 - lat1
                );


        double lonDistance =
                Math.toRadians(
                        lon2 - lon1
                );


        double a =
                Math.sin(
                        latDistance / 2
                ) *
                        Math.sin(
                                latDistance / 2
                        )
                        +
                        Math.cos(
                                Math.toRadians(lat1)
                        ) *
                                Math.cos(
                                        Math.toRadians(lat2)
                                ) *
                                Math.sin(
                                        lonDistance / 2
                                ) *
                                Math.sin(
                                        lonDistance / 2
                                );


        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );


        return EARTH_RADIUS_KM * c;
    }
}