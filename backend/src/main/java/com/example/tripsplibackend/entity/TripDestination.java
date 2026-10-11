package com.example.tripsplibackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "trip_destinations")
public class TripDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String destinationName;

    private Double estimatedCost;

    @Column(length = 1000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    public TripDestination() {
    }

    public Long getId() {
        return id;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }
}