package com.example.tripsplibackend.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "destination_votes",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"destination_id", "member_id"}
        )
)
public class DestinationVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "destination_id")
    private TripDestination destination;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private Member member;

    public DestinationVote() {
    }

    public Long getId() {
        return id;
    }

    public TripDestination getDestination() {
        return destination;
    }

    public void setDestination(TripDestination destination) {
        this.destination = destination;
    }

    public Member getMember() {
        return member;
    }

    public void setMember(Member member) {
        this.member = member;
    }
}