package com.example.tripsplibackend.repository;

import com.example.tripsplibackend.entity.TripDestination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripDestinationRepository
        extends JpaRepository<TripDestination, Long> {

    List<TripDestination> findByTrip_Id(Long tripId);
}