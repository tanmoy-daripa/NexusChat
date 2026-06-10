package com.chatapp.repository;

import com.chatapp.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT r FROM ChatRoom r JOIN r.members m WHERE m.id = :userId")
    List<ChatRoom> findRoomsByUserId(Long userId);

    @Query("SELECT r FROM ChatRoom r WHERE r.type = 'PUBLIC'")
    List<ChatRoom> findPublicRooms();

    @Query("SELECT r FROM ChatRoom r WHERE r.type = 'DIRECT' AND " +
           "EXISTS (SELECT 1 FROM r.members m WHERE m.id = :userId1) AND " +
           "EXISTS (SELECT 1 FROM r.members m WHERE m.id = :userId2)")
    Optional<ChatRoom> findDirectRoom(Long userId1, Long userId2);
}
