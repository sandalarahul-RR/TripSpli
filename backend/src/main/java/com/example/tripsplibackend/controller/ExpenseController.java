package com.example.tripsplibackend.controller;
import com.example.tripsplibackend.entity.Expense;
import com.example.tripsplibackend.entity.Member;
import com.example.tripsplibackend.entity.Trip;
import com.example.tripsplibackend.repository.ExpenseRepository;
import com.example.tripsplibackend.repository.MemberRepository;
import com.example.tripsplibackend.repository.TripRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {
    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final MemberRepository memberRepository;
    public ExpenseController(ExpenseRepository expenseRepository,
                             TripRepository tripRepository,
                             MemberRepository memberRepository) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.memberRepository = memberRepository;
    }
    @PostMapping
    public Expense addExpense(@PathVariable Long tripId, @RequestBody Expense expense) {
        Trip trip = tripRepository.findById(tripId).orElseThrow();
        Member member = memberRepository.findById(expense.getPaidBy().getId()).orElseThrow();
        expense.setTrip(trip);
        expense.setPaidBy(member);
        return expenseRepository.save(expense);
    }
    @GetMapping
    public List<Expense> getExpenses(@PathVariable Long tripId) {
        return expenseRepository.findByTripId(tripId);
    }
}