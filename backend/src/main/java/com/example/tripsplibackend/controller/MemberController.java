package com.example.tripsplibackend.controller;
import com.example.tripsplibackend.entity.Member;
import com.example.tripsplibackend.entity.Trip;
import com.example.tripsplibackend.repository.MemberRepository;
import com.example.tripsplibackend.repository.TripRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/trips/{tripId}/members")
@CrossOrigin(origins = "http://localhost:5173")
public class MemberController {
    private final MemberRepository memberRepository;
    private final TripRepository tripRepository;
    public MemberController(MemberRepository memberRepository, TripRepository tripRepository) {
        this.memberRepository = memberRepository;
        this.tripRepository = tripRepository;
    }
    @PostMapping
    public Member addMember(@PathVariable Long tripId, @RequestBody Member member) {
        Trip trip = tripRepository.findById(tripId).orElseThrow();
        member.setTrip(trip);
        return memberRepository.save(member);
    }
    @GetMapping
    public List<Member> getMembers(@PathVariable Long tripId) {
        return memberRepository.findByTripId(tripId);
    }
}