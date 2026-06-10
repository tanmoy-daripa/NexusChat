package com.chatapp.controller;

import com.chatapp.dto.Dtos.*;
import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/public")
    public ResponseEntity<List<RoomDto>> getPublicRooms() {
        return ResponseEntity.ok(chatService.getPublicRooms());
    }

    @GetMapping("/my")
    public ResponseEntity<List<RoomDto>> getMyRooms(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(chatService.getUserRooms(user.getId()));
    }

    @PostMapping
    public ResponseEntity<RoomDto> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(chatService.createRoom(request, user));
    }

    @PostMapping("/{roomId}/join")
    public ResponseEntity<RoomDto> joinRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(chatService.joinRoom(roomId, user));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        chatService.leaveRoom(roomId, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(chatService.getRoomMessages(roomId, page, size));
    }

    @PostMapping("/{roomId}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable Long roomId,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(chatService.sendMessage(roomId, request, user));
    }

    @PostMapping("/direct/{targetUserId}")
    public ResponseEntity<RoomDto> getOrCreateDirect(
            @PathVariable Long targetUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(chatService.getOrCreateDirectRoom(targetUserId, user));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
    }
}
