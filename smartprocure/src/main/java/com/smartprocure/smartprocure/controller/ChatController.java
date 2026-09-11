package com.smartprocure.smartprocure.controller;

import com.smartprocure.smartprocure.entity.ChatRequest;
import com.smartprocure.smartprocure.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody ChatRequest request) {

        String response = chatService.getResponse(request);

        return Map.of(
                "response", response
        );
    }
}