package com.smartprocure.smartprocure.service;

import com.smartprocure.smartprocure.entity.Booking;
import com.smartprocure.smartprocure.entity.Notification;
import com.smartprocure.smartprocure.entity.Farmer;
import com.smartprocure.smartprocure.entity.ProcurementCentre;
import com.smartprocure.smartprocure.repository.BookingRepository;
import com.smartprocure.smartprocure.repository.NotificationRepository;
import com.smartprocure.smartprocure.repository.FarmerRepository;
import com.smartprocure.smartprocure.repository.ProcurementCentreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationRepository notificationRepository;
    private final FarmerRepository farmerRepository;
    private final ProcurementCentreRepository procurementCentreRepository;

    public BookingService(
            BookingRepository bookingRepository,
            NotificationRepository notificationRepository,
            FarmerRepository farmerRepository,
            ProcurementCentreRepository procurementCentreRepository) {

        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.farmerRepository = farmerRepository;
        this.procurementCentreRepository = procurementCentreRepository;
    }

    public Booking createBooking(Booking booking) {

        // Check farmer exists
        Farmer farmer = farmerRepository
                .findById(booking.getFarmerId())
                .orElse(null);

        if (farmer == null) {
            throw new RuntimeException("Farmer not found");
        }

        // Check procurement centre exists
        ProcurementCentre centre = procurementCentreRepository
                .findById(booking.getCentreId())
                .orElse(null);

        if (centre == null) {
            throw new RuntimeException("Procurement centre not found");
        }

        // Check centre is active
        if (centre.getIsActive() == null || !centre.getIsActive()) {
            throw new RuntimeException("Procurement centre is not active");
        }

        // Check quantity
        if (booking.getQuantity() == null || booking.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        // Check booking date
        if (booking.getBookingDate() == null) {
            throw new RuntimeException("Booking date is required");
        }

        if (booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Booking date cannot be in the past");
        }

        // Set initial status
        booking.setStatus("BOOKED");

        // Generate token number
        Integer lastToken = bookingRepository.findMaxTokenNumber(
                booking.getCentreId(),
                booking.getBookingDate()
        );

        if (lastToken == null) {
            booking.setTokenNumber(1);
        } else {
            booking.setTokenNumber(lastToken + 1);
        }

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        // Create automatic notification
        Notification notification = new Notification();

        notification.setFarmerId(savedBooking.getFarmerId());

        notification.setMessage(
                "Your booking has been confirmed. Token number: "
                        + savedBooking.getTokenNumber()
        );

        notification.setType("BOOKING");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

        return savedBooking;
    }

    public Booking getBookingById(Integer id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByCentreAndDate(
            Integer centreId,
            LocalDate bookingDate) {

        return bookingRepository
                .findByCentreIdAndBookingDateOrderByTokenNumberAsc(
                        centreId,
                        bookingDate
                );
    }

    public List<Booking> getBookingsByFarmer(Integer farmerId) {
        return bookingRepository
                .findByFarmerIdOrderByBookingDateDesc(farmerId);
    }

    public Booking updateBookingStatus(Integer id, String status) {

        Booking booking =
                bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return null;
        }

        // Allow only valid statuses
        if (!status.equals("BOOKED")
                && !status.equals("WAITING")
                && !status.equals("PROCESSING")
                && !status.equals("COMPLETED")
                && !status.equals("PAID")
                && !status.equals("CANCELLED")) {

            throw new RuntimeException("Invalid booking status");
        }

        booking.setStatus(status);

        Booking updatedBooking = bookingRepository.save(booking);

        // Create automatic notification
        Notification notification = new Notification();

        notification.setFarmerId(updatedBooking.getFarmerId());

        notification.setMessage(
                "Your booking status has been updated to "
                        + status
        );

        notification.setType("STATUS_UPDATE");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);

        return updatedBooking;
    }

    // Get queue position of a booking
    public Map<String, Object> getQueuePosition(Integer bookingId) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElse(null);

        if (booking == null) {
            throw new RuntimeException("Booking not found");
        }

        List<Booking> queue = bookingRepository
                .findByCentreIdAndBookingDateOrderByTokenNumberAsc(
                        booking.getCentreId(),
                        booking.getBookingDate()
                );

        int queuePosition = 0;

        for (int i = 0; i < queue.size(); i++) {

            if (queue.get(i).getId().equals(bookingId)) {
                queuePosition = i + 1;
                break;
            }
        }

        int peopleAhead = queuePosition - 1;

        Map<String, Object> result = new HashMap<>();

        result.put("bookingId", bookingId);
        result.put("tokenNumber", booking.getTokenNumber());
        result.put("queuePosition", queuePosition);
        result.put("peopleAhead", peopleAhead);

        return result;
    }
}