package com.example.tripsplibackend.repository;

import com.example.tripsplibackend.entity.DestinationVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DestinationVoteRepository
        extends JpaRepository<DestinationVote, Long> {

    List<DestinationVote> findByDestination_Id(Long destinationId);

    Optional<DestinationVote> findByDestination_Trip_IdAndMember_Id(
            Long tripId,
            Long memberId
    );

    long countByDestination_Id(Long destinationId);
}