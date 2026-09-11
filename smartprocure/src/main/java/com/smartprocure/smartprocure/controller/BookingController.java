package com.smartprocure.smartprocure.controller;

import com.smartprocure.smartprocure.entity.Booking;
import com.smartprocure.smartprocure.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4173")
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    @GetMapping("/{id}")
    public Booking getBookingById(@PathVariable Integer id) {
        return bookingService.getBookingById(id);
    }

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/centre/{centreId}/date/{bookingDate}")
    public List<Booking> getBookingsByCentreAndDate(
            @PathVariable Integer centreId,
            @PathVariable LocalDate bookingDate) {

        return bookingService.getBookingsByCentreAndDate(
                centreId,
                bookingDate
        );
    }

    @GetMapping("/farmer/{farmerId}")
    public List<Booking> getBookingsByFarmer(
            @PathVariable Integer farmerId) {

        return bookingService.getBookingsByFarmer(farmerId);
    }

    @PutMapping("/{id}/status")
    public Booking updateBookingStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");

        return bookingService.updateBookingStatus(id, status);
    }

    // Get queue position
    @GetMapping("/{id}/queue-position")
    public Map<String, Object> getQueuePosition(
            @PathVariable Integer id) {

        return bookingService.getQueuePosition(id);
    }
}