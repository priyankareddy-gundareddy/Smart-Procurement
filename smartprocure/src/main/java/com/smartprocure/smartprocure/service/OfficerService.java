

package com.smartprocure.smartprocure.service;

import com.smartprocure.smartprocure.entity.Booking;
import com.smartprocure.smartprocure.entity.Officer;
import com.smartprocure.smartprocure.repository.BookingRepository;
import com.smartprocure.smartprocure.repository.OfficerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OfficerService {

    private final OfficerRepository officerRepository;
    private final BookingRepository bookingRepository;

    public OfficerService(
            OfficerRepository officerRepository,
            BookingRepository bookingRepository) {

        this.officerRepository = officerRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Officer> getAllOfficers() {
        return officerRepository.findAll();
    }

    public Officer getOfficerById(Integer id) {
        return officerRepository.findById(id).orElse(null);
    }

    public Officer loginOfficer(String email, String password) {
        return officerRepository
                .findByEmailAndPassword(email, password)
                .orElse(null);
    }

    // Get queue with farmer name and centre name
    public List<Map<String, Object>> getQueueByDate(
            Integer officerId,
            LocalDate date) {

        Officer officer = officerRepository.findById(officerId).orElse(null);

        if (officer == null) {
            throw new RuntimeException("Officer not found");
        }

        Integer centreId = officer.getCentreId();

        List<Object[]> queue =
                bookingRepository.findQueueWithDetails(centreId, date);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : queue) {

            Booking booking = (Booking) row[0];
            String farmerName = (String) row[1];
            String centreName = (String) row[2];

            Map<String, Object> data = new HashMap<>();

            data.put("bookingId", booking.getId());
            data.put("tokenNumber", booking.getTokenNumber());
            data.put("farmerId", booking.getFarmerId());
            data.put("farmerName", farmerName);
            data.put("centreId", booking.getCentreId());
            data.put("centreName", centreName);
            data.put("cropName", booking.getCropName());
            data.put("quantity", booking.getQuantity());
            data.put("bookingDate", booking.getBookingDate());
            data.put("slotTime", booking.getSlotTime());
            data.put("status", booking.getStatus());

            result.add(data);
        }

        return result;
    }
}