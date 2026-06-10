package com.chatapp.controller;

import com.chatapp.dto.Dtos.*;
import com.chatapp.entity.User;
import com.chatapp.repository.UserRepository;
import com.chatapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @MessageMapping("/room/{roomId}/send")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload SendMessageRequest request,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        chatService.sendMessage(roomId, request, user);
    }

    @MessageMapping("/room/{roomId}/typing")
    public void typing(
            @DestinationVariable Long roomId,
            @Payload TypingEvent event,
            Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        chatService.handleTyping(roomId, user, event.isTyping());
    }
}
