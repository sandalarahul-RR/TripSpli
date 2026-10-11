package com.example.tripsplibackend.repository;
import com.example.tripsplibackend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TripRepository extends JpaRepository<Trip, Long> {
}