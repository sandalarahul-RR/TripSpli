package com.example.tripsplibackend.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String description;
    private BigDecimal amount;
    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;
    @ManyToOne
    @JoinColumn(name = "paid_by")
    private Member paidBy;
    public Expense() {
    }
    public Expense(String description, BigDecimal amount, Trip trip, Member paidBy) {
        this.description = description;
        this.amount = amount;
        this.trip = trip;
        this.paidBy = paidBy;
    }
    public Long getId() {
        return id;
    }
    public String getDescription() {
        return description;
    }
    public BigDecimal getAmount() {
        return amount;
    }
    public Trip getTrip() {
        return trip;
    }
    public Member getPaidBy() {
        return paidBy;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    public void setTrip(Trip trip) {
        this.trip = trip;
    }
    public void setPaidBy(Member paidBy) {
        this.paidBy = paidBy;
    }
}