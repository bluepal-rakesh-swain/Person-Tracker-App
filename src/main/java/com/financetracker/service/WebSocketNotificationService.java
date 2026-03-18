package com.financetracker.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class WebSocketNotificationService {

    // email → active WebSocket session
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    public void register(String email, WebSocketSession session) {
        sessions.put(email, session);
    }

    public void remove(WebSocketSession session) {
        sessions.values().remove(session);
    }

    public void sendBudgetAlert(String email, String categoryName, double usagePercent,
                                long spent, long limit, String monthYear) {
        WebSocketSession session = sessions.get(email);
        if (session == null || !session.isOpen()) return;
        try {
            String payload = String.format(
                "{\"type\":\"budget-alert\",\"categoryName\":\"%s\",\"usagePercent\":%.1f,\"spent\":%d,\"limit\":%d,\"monthYear\":\"%s\"}",
                categoryName, usagePercent, spent, limit, monthYear
            );
            session.sendMessage(new TextMessage(payload));
            log.info("WS budget-alert sent to {} for category {}", email, categoryName);
        } catch (Exception e) {
            log.warn("Failed to send WS message to {}: {}", email, e.getMessage());
            sessions.remove(email);
        }
    }
}
