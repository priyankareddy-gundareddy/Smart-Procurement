package com.smartprocure.smartprocure.service;

import com.smartprocure.smartprocure.entity.Booking;
import com.smartprocure.smartprocure.entity.ChatRequest;
import com.smartprocure.smartprocure.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public ChatService(
            BookingRepository bookingRepository,
            BookingService bookingService) {

        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    public String getResponse(ChatRequest request) {

        Integer farmerId = request.getFarmerId();

        String message = request.getMessage().toLowerCase();

        String language = request.getLanguage();

        // Get farmer's bookings from database
        List<Booking> bookings =
                bookingRepository.findByFarmerIdOrderByBookingDateDesc(farmerId);

        // If farmer has no bookings
        if (bookings.isEmpty()) {

            if ("te".equalsIgnoreCase(language)) {
                return "మీకు ప్రస్తుతం ఎలాంటి బుకింగ్‌లు లేవు.";
            }

            return "You currently have no bookings.";
        }

        // Get the latest booking
        Booking booking = bookings.get(0);


        // =========================================
        // QUEUE POSITION
        // =========================================

        if (message.contains("queue")
                || message.contains("position")
                || message.contains("wait")
                || message.contains("where am i")
                || message.contains("ahead")
                || message.contains("క్యూ")
                || message.contains("స్థానం")
                || message.contains("వేచి")) {

            Map<String, Object> queue =
                    bookingService.getQueuePosition(booking.getId());

            int queuePosition =
                    (Integer) queue.get("queuePosition");

            int peopleAhead =
                    (Integer) queue.get("peopleAhead");

            if ("te".equalsIgnoreCase(language)) {

                return "మీ క్యూ స్థానం "
                        + queuePosition
                        + ". మీ ముందు "
                        + peopleAhead
                        + " మంది ఉన్నారు.";
            }

            return "Your queue position is "
                    + queuePosition
                    + ". There are "
                    + peopleAhead
                    + " people ahead of you.";
        }


        // =========================================
        // BOOKING STATUS
        // =========================================

        if (message.contains("status")
                || message.contains("booking status")
                || message.contains("స్థితి")
                || message.contains("బుకింగ్")) {

            if ("te".equalsIgnoreCase(language)) {

                return "మీ బుకింగ్ స్థితి: "
                        + booking.getStatus();
            }

            return "Your booking status is: "
                    + booking.getStatus();
        }


        // =========================================
        // TOKEN NUMBER
        // =========================================

        if (message.contains("token")
                || message.contains("token number")
                || message.contains("టోకెన్")) {

            if ("te".equalsIgnoreCase(language)) {

                return "మీ టోకెన్ నంబర్: "
                        + booking.getTokenNumber();
            }

            return "Your token number is: "
                    + booking.getTokenNumber();
        }


        // =========================================
        // SLOT TIME
        // =========================================

        if (message.contains("slot")
                || message.contains("time")
                || message.contains("appointment")
                || message.contains("స్లాట్")
                || message.contains("సమయం")) {

            if ("te".equalsIgnoreCase(language)) {

                return "మీ స్లాట్ సమయం: "
                        + booking.getSlotTime();
            }

            return "Your slot time is: "
                    + booking.getSlotTime();
        }


        // =========================================
        // BOOKING DATE
        // =========================================

        if (message.contains("date")
                || message.contains("when")
                || message.contains("తేదీ")
                || message.contains("ఎప్పుడు")) {

            if ("te".equalsIgnoreCase(language)) {

                return "మీ బుకింగ్ తేదీ: "
                        + booking.getBookingDate();
            }

            return "Your booking date is: "
                    + booking.getBookingDate();
        }


        // =========================================
        // CROP
        // =========================================

        if (message.contains("crop")
                || message.contains("పంట")) {

            if ("te".equalsIgnoreCase(language)) {

                return "మీ పంట: "
                        + booking.getCropName();
            }

            return "Your crop is: "
                    + booking.getCropName();
        }


        // =========================================
        // QUANTITY
        // =========================================

        if (message.contains("quantity")
                || message.contains("how much")
                || message.contains("ఎంత")
                || message.contains("పరిమాణం")) {

            if ("te".equalsIgnoreCase(language)) {

                return "మీ బుకింగ్ పరిమాణం: "
                        + booking.getQuantity()
                        + " kg";
            }

            return "Your booked quantity is "
                    + booking.getQuantity()
                    + " kg.";
        }


        // =========================================
        // DEFAULT RESPONSE
        // =========================================

        if ("te".equalsIgnoreCase(language)) {

            return "క్షమించండి, మీ ప్రశ్న అర్థం కాలేదు. " +
                    "మీ టోకెన్, క్యూ స్థానం, బుకింగ్ స్థితి, " +
                    "స్లాట్ లేదా తేదీ గురించి అడగండి.";
        }

        return "Sorry, I didn't understand. You can ask about " +
                "your token, queue position, booking status, " +
                "slot, date, crop, or quantity.";
    }
}