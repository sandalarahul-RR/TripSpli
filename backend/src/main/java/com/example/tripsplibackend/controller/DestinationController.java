package com.example.tripsplibackend.controller;

import com.example.tripsplibackend.entity.*;
import com.example.tripsplibackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/destinations")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class DestinationController {

    private final TripRepository tripRepository;
    private final MemberRepository memberRepository;
    private final TripDestinationRepository destinationRepository;
    private final DestinationVoteRepository voteRepository;

    public DestinationController(
            TripRepository tripRepository,
            MemberRepository memberRepository,
            TripDestinationRepository destinationRepository,
            DestinationVoteRepository voteRepository) {
        this.tripRepository = tripRepository;
        this.memberRepository = memberRepository;
        this.destinationRepository = destinationRepository;
        this.voteRepository = voteRepository;
    }

    @GetMapping
    public List<DestinationResponse> getDestinations(
            @PathVariable Long tripId) {

        if (!tripRepository.existsById(tripId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Trip not found");
        }

        return destinationRepository.findByTrip_Id(tripId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public DestinationResponse addDestination(
            @PathVariable Long tripId,
            @RequestBody DestinationRequest request) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Trip not found"));

        if (request.getDestinationName() == null
                || request.getDestinationName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Destination name is required");
        }

        TripDestination destination = new TripDestination();
        destination.setDestinationName(request.getDestinationName().trim());
        destination.setEstimatedCost(request.getEstimatedCost());
        destination.setDescription(request.getDescription());
        destination.setTrip(trip);

        return toResponse(destinationRepository.save(destination));
    }

    @PostMapping("/{destinationId}/vote")
    public DestinationResponse vote(
            @PathVariable Long tripId,
            @PathVariable Long destinationId,
            @RequestBody VoteRequest request) {

        if (request.getMemberId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Member ID is required");
        }

        TripDestination destination = destinationRepository
                .findById(destinationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Destination not found"));

        if (!destination.getTrip().getId().equals(tripId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Destination does not belong to this trip");
        }

        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Member not found"));

        if (member.getTrip() == null
                || !member.getTrip().getId().equals(tripId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Member does not belong to this trip");
        }

        DestinationVote vote = voteRepository
                .findByDestination_Trip_IdAndMember_Id(
                        tripId, member.getId())
                .orElse(new DestinationVote());

        vote.setDestination(destination);
        vote.setMember(member);
        voteRepository.save(vote);

        return toResponse(destination);
    }

    private DestinationResponse toResponse(
            TripDestination destination) {

        return new DestinationResponse(
                destination.getId(),
                destination.getDestinationName(),
                destination.getEstimatedCost(),
                destination.getDescription(),
                voteRepository.countByDestination_Id(destination.getId())
        );
    }

    public static class DestinationRequest {

        private String destinationName;
        private Double estimatedCost;
        private String description;

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
    }

    public static class VoteRequest {

        private Long memberId;

        public Long getMemberId() {
            return memberId;
        }

        public void setMemberId(Long memberId) {
            this.memberId = memberId;
        }
    }

    public static class DestinationResponse {

        private Long id;
        private String destinationName;
        private Double estimatedCost;
        private String description;
        private long voteCount;

        public DestinationResponse(
                Long id,
                String destinationName,
                Double estimatedCost,
                String description,
                long voteCount) {
            this.id = id;
            this.destinationName = destinationName;
            this.estimatedCost = estimatedCost;
            this.description = description;
            this.voteCount = voteCount;
        }

        public Long getId() {
            return id;
        }

        public String getDestinationName() {
            return destinationName;
        }

        public Double getEstimatedCost() {
            return estimatedCost;
        }

        public String getDescription() {
            return description;
        }

        public long getVoteCount() {
            return voteCount;
        }
    }
}