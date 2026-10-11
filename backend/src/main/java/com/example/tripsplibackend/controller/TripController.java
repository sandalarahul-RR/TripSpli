package com.example.tripsplibackend.controller;

import com.example.tripsplibackend.entity.Trip;
import com.example.tripsplibackend.repository.TripRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:5173")
public class TripController {

    private final TripRepository tripRepository;

    public TripController(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        trip.setStatus("PLANNING");
        return tripRepository.save(trip);
    }

    @GetMapping
    public List<Trip> getTrips() {
        return tripRepository.findAll();
    }

    @GetMapping("/{id}")
    public Trip getTrip(@PathVariable Long id) {
        return tripRepository.findById(id).orElseThrow();
    }

    @PutMapping("/{id}/destination")
    public Trip selectDestination(
            @PathVariable Long id,
            @RequestBody DestinationRequest request) {

        Trip trip = tripRepository.findById(id).orElseThrow();

        trip.setSelectedDestination(request.getDestination());

        return tripRepository.save(trip);
    }

    @PutMapping("/{id}/status")
    public Trip updateStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        Trip trip = tripRepository.findById(id).orElseThrow();

        String status = request.getStatus();

        if (!List.of("PLANNING", "ACTIVE", "COMPLETED").contains(status)) {
            throw new IllegalArgumentException("Invalid trip status");
        }

        trip.setStatus(status);

        return tripRepository.save(trip);
    }

    public static class DestinationRequest {

        private String destination;

        public String getDestination() {
            return destination;
        }

        public void setDestination(String destination) {
            this.destination = destination;
        }
    }

    public static class StatusRequest {

        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}