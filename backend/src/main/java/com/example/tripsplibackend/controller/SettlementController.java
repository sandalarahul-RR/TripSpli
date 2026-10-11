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
public class SettlementController {
    private final ExpenseRepository expenseRepository;
    private final MemberRepository memberRepository;
    public SettlementController(ExpenseRepository expenseRepository,
                                MemberRepository memberRepository) {
        this.expenseRepository = expenseRepository;
        this.memberRepository = memberRepository;
    }
    @GetMapping("/settlement")
    public List<Map<String, Object>> settlement(@PathVariable Long tripId) {
        List<Member> members = memberRepository.findByTripId(tripId);
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal share = members.isEmpty()
                ? BigDecimal.ZERO
                : total.divide(
                BigDecimal.valueOf(members.size()),
                2,
                java.math.RoundingMode.HALF_UP
        );
        Map<Long, BigDecimal> paid = new HashMap<>();
        for (Member member : members) {
            paid.put(member.getId(), BigDecimal.ZERO);
        }
        for (Expense expense : expenses) {
            Long id = expense.getPaidBy().getId();
            paid.put(id, paid.get(id).add(expense.getAmount()));
        }
        List<Map<String, Object>> creditors = new ArrayList<>();
        List<Map<String, Object>> debtors = new ArrayList<>();
        for (Member member : members) {
            BigDecimal balance = paid.get(member.getId()).subtract(share);
            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                Map<String, Object> person = new HashMap<>();
                person.put("name", member.getName());
                person.put("amount", balance);
                creditors.add(person);
            } else if (balance.compareTo(BigDecimal.ZERO) < 0) {
                Map<String, Object> person = new HashMap<>();
                person.put("name", member.getName());
                person.put("amount", balance.abs());
                debtors.add(person);
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        int i = 0;
        int j = 0;
        while (i < debtors.size() && j < creditors.size()) {
            Map<String, Object> debtor = debtors.get(i);
            Map<String, Object> creditor = creditors.get(j);
            BigDecimal debt = (BigDecimal) debtor.get("amount");
            BigDecimal credit = (BigDecimal) creditor.get("amount");
            BigDecimal payment = debt.min(credit);
            Map<String, Object> transaction = new LinkedHashMap<>();
            transaction.put("from", debtor.get("name"));
            transaction.put("to", creditor.get("name"));
            transaction.put("amount", payment);
            result.add(transaction);
            debtor.put("amount", debt.subtract(payment));
            creditor.put("amount", credit.subtract(payment));
            if (((BigDecimal) debtor.get("amount"))
                    .compareTo(BigDecimal.ZERO) == 0) {
                i++;
            }
            if (((BigDecimal) creditor.get("amount"))
                    .compareTo(BigDecimal.ZERO) == 0) {
                j++;
            }
        }
        return result;
    }
}