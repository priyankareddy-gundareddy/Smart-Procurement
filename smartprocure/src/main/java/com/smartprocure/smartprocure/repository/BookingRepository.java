package com.smartprocure.smartprocure.repository;

import com.smartprocure.smartprocure.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("SELECT MAX(b.tokenNumber) FROM Booking b " +
            "WHERE b.centreId = :centreId AND b.bookingDate = :bookingDate")
    Integer findMaxTokenNumber(
            @Param("centreId") Integer centreId,
            @Param("bookingDate") LocalDate bookingDate);

    List<Booking> findByCentreIdAndBookingDateOrderByTokenNumberAsc(
            Integer centreId,
            LocalDate bookingDate);

    List<Booking> findByFarmerIdOrderByBookingDateDesc(
            Integer farmerId);

    // Get bookings with farmer and centre details
    long countByCentreIdAndBookingDate(
            Integer centreId,
            LocalDate bookingDate);
    @Query("SELECT b, f.name, p.name " +
            "FROM Booking b, Farmer f, ProcurementCentre p " +
            "WHERE b.farmerId = f.id " +
            "AND b.centreId = p.id " +
            "AND b.centreId = :centreId " +
            "AND b.bookingDate = :bookingDate " +
            "ORDER BY b.tokenNumber ASC")
    List<Object[]> findQueueWithDetails(
            @Param("centreId") Integer centreId,
            @Param("bookingDate") LocalDate bookingDate);
}