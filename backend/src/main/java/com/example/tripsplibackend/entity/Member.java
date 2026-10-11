package com.example.tripsplibackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    private Double budget;

    private String interests;

    private String travelStyle;

    public Member() {
    }

    public Member(String name, Trip trip) {
        this.name = name;
        this.trip = trip;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Trip getTrip() {
        return trip;
    }

    public Double getBudget() {
        return budget;
    }

    public String getInterests() {
        return interests;
    }

    public String getTravelStyle() {
        return travelStyle;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public void setTravelStyle(String travelStyle) {
        this.travelStyle = travelStyle;
    }
}