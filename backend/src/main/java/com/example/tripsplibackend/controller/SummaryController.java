package com.example.tripsplibackend.controller;
import com.example.tripsplibackend.entity.Expense;
import com.example.tripsplibackend.entity.Member;
import com.example.tripsplibackend.repository.ExpenseRepository;
import com.example.tripsplibackend.repository.MemberRepository;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;
@RestController
@RequestMapping("/api/trips/{tripId}")
@CrossOrigin(origins = "http://localhost:5173")
public class SummaryController {
    private final ExpenseRepository expenseRepository;
    private final MemberRepository memberRepository;
    public SummaryController(ExpenseRepository expenseRepository,
                             MemberRepository memberRepository) {
        this.expenseRepository = expenseRepository;
        this.memberRepository = memberRepository;
    }
    @GetMapping("/summary")
    public Map<String, Object> summary(@PathVariable Long tripId) {
        List<Member> members = memberRepository.findByTripId(tripId);
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal share = members.isEmpty()
                ? BigDecimal.ZERO
                : total.divide(BigDecimal.valueOf(members.size()), 2,
                java.math.RoundingMode.HALF_UP);
        Map<Long, BigDecimal> paid = new HashMap<>();
        for (Member member : members) {
            paid.put(member.getId(), BigDecimal.ZERO);
        }
        for (Expense expense : expenses) {
            Long id = expense.getPaidBy().getId();
            paid.put(id, paid.get(id).add(expense.getAmount()));
        }
        List<Map<String, Object>> balances = new ArrayList<>();
        for (Member member : members) {
            BigDecimal balance = paid.get(member.getId()).subtract(share);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("member", member.getName());
            data.put("paid", paid.get(member.getId()));
            data.put("balance", balance);
            balances.add(data);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("share", share);
        result.put("members", members.size());
        result.put("balances", balances);
        return result;
    }
}