/**
 * RAGEWARE — Temporary Real-Time Communication Server
 * 
 * Lightweight in-memory WebSocket server for simulated retro Windows 95/98 OS.
 * ZERO persistent databases, zero permanent accounts, zero disk storage.
 * All rooms, identities, and messages exist solely in memory during the active session.
 */

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 8000;

// HTTP server for health check and WebSocket upgrade
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'RAGEWARE Temporary Real-Time Mail Server',
      activeRooms: rooms.size,
      uptime: process.uptime(),
      timestamp: Date.now(),
    }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({ server });

/**
 * Temporary In-Memory State:
 * rooms = Map<roomId, {
 *   roomId: string,
 *   clients: Map<clientId, { id, ws, ragewareId, joinedAt }>,
 *   messages: Array<Message>,
 *   createdAt: number
 * }>
 */
const rooms = new Map();

// Helper to sanitize and format RAGEWARE IDs
function sanitizeId(id) {
  if (!id || typeof id !== 'string') return null;
  const clean = id.trim().replace(/@rageware$/i, '');
  if (!/^[a-zA-Z0-9_-]{2,20}$/.test(clean)) return null;
  return clean.toUpperCase();
}

// Helper to sanitize Room codes
function sanitizeRoomId(roomId) {
  if (!roomId || typeof roomId !== 'string') return null;
  const clean = roomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (clean.length < 2 || clean.length > 16) return null;
  return clean;
}

// Safely send JSON to a WebSocket client
function sendJson(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to send WebSocket payload:', err.message);
    }
  }
}

// Broadcast to all active clients in a specific room
function broadcastToRoom(room, payload, excludeClientId = null) {
  if (!room || !room.clients) return;
  for (const [clientId, client] of room.clients.entries()) {
    if (clientId !== excludeClientId) {
      sendJson(client.ws, payload);
    }
  }
}

// Remove client from their current room and notify peers
function removeClientFromRoom(client) {
  if (!client.roomId) return;
  const room = rooms.get(client.roomId);
  if (!room) {
    client.roomId = null;
    return;
  }

  room.clients.delete(client.id);
  console.log(`[RAGEWARE] User ${client.ragewareId || client.id} left room ${room.roomId}`);

  if (room.clients.size === 0) {
    rooms.delete(room.roomId);
    console.log(`[RAGEWARE] Room ${room.roomId} is empty and was destroyed.`);
  } else {
    const activeUsers = Array.from(room.clients.values()).map((c) => c.ragewareId);
    broadcastToRoom(room, {
      type: 'USER_LEFT',
      ragewareId: client.ragewareId,
      users: activeUsers,
    });
  }

  client.roomId = null;
}

let clientCounter = 0;

wss.on('connection', (ws) => {
  const clientId = `client_${Date.now()}_${++clientCounter}`;
  const client = {
    id: clientId,
    ws,
    ragewareId: null,
    roomId: null,
    joinedAt: Date.now(),
  };

  console.log(`[RAGEWARE] Client connected: ${clientId}`);

  ws.on('message', (rawData) => {
    let msg;
    try {
      msg = JSON.parse(rawData.toString());
    } catch {
      sendJson(ws, {
        type: 'ERROR',
        code: 'MALFORMED_MESSAGE',
        message: 'Malformed request packet.',
      });
      return;
    }

    const type = msg.type;

    // 1. JOIN_ROOM
    if (type === 'JOIN_ROOM') {
      const targetRoomId = sanitizeRoomId(msg.roomId);
      const chosenId = sanitizeId(msg.ragewareId);

      if (!targetRoomId) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'INVALID_ROOM',
          message: 'Invalid Room ID. Must be 2-16 alphanumeric characters.',
        });
        return;
      }

      if (!chosenId) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'INVALID_ID',
          message: 'Invalid RAGEWARE ID. Use 2-20 alphanumeric characters, no spaces.',
        });
        return;
      }

      // Check if room exists or create new temporary room
      let room = rooms.get(targetRoomId);
      if (!room) {
        room = {
          roomId: targetRoomId,
          clients: new Map(),
          messages: [],
          createdAt: Date.now(),
        };
        rooms.set(targetRoomId, room);
        console.log(`[RAGEWARE] Created new temporary room: ${targetRoomId}`);
      }

      // Ensure no active user in this room already uses this RAGEWARE ID
      const isTaken = Array.from(room.clients.values()).some(
        (c) => c.ragewareId === chosenId && c.id !== client.id
      );

      if (isTaken) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'ID_TAKEN',
          message: 'That RAGEWARE ID is already active in this session. Please choose another ID.',
        });
        return;
      }

      // If client was in another room, leave it first
      if (client.roomId && client.roomId !== targetRoomId) {
        removeClientFromRoom(client);
      }

      client.ragewareId = chosenId;
      client.roomId = targetRoomId;
      room.clients.set(client.id, client);

      const activeUsers = Array.from(room.clients.values()).map((c) => c.ragewareId);

      console.log(`[RAGEWARE] User ${chosenId}@RAGEWARE joined session [${targetRoomId}] (${activeUsers.length} online)`);

      // Acknowledge join to the user
      sendJson(ws, {
        type: 'JOIN_SUCCESS',
        roomId: targetRoomId,
        ragewareId: chosenId,
        users: activeUsers,
        messages: room.messages, // Provide recent active-session messages
      });

      // Broadcast new user to all peers in room
      broadcastToRoom(room, {
        type: 'USER_JOINED',
        ragewareId: chosenId,
        users: activeUsers,
      }, client.id);

      return;
    }

    // 2. SEND_MESSAGE
    if (type === 'SEND_MESSAGE') {
      if (!client.roomId || !client.ragewareId) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'NOT_IN_SESSION',
          message: 'You must join an active RAGEWARE session before sending mail.',
        });
        return;
      }

      const room = rooms.get(client.roomId);
      if (!room) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'ROOM_NOT_FOUND',
          message: 'Communication session has expired or no longer exists.',
        });
        return;
      }

      const rawRecipient = msg.to;
      const targetRecipient = sanitizeId(rawRecipient);

      if (!targetRecipient) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'INVALID_RECIPIENT',
          message: 'Please provide a valid recipient RAGEWARE address (e.g. ALEX95@RAGEWARE).',
        });
        return;
      }

      // Find recipient in the same active room
      const recipientClient = Array.from(room.clients.values()).find(
        (c) => c.ragewareId === targetRecipient
      );

      if (!recipientClient) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'RECIPIENT_NOT_FOUND',
          message: 'RAGEWARE user not found.\n\nMake sure the user is connected to the same temporary session.',
          recipient: targetRecipient,
        });
        return;
      }

      // Enforce message length limits
      const subject = String(msg.subject || '(No Subject)').trim().slice(0, 120);
      const body = String(msg.body || '').trim().slice(0, 5000);

      if (!body && !subject) {
        sendJson(ws, {
          type: 'ERROR',
          code: 'EMPTY_MESSAGE',
          message: 'Cannot send an empty message.',
        });
        return;
      }

      const messageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        sender: client.ragewareId,
        recipient: recipientClient.ragewareId,
        subject: subject || '(No Subject)',
        body: body,
        timestamp: Date.now(),
        roomId: room.roomId,
        threadId: msg.threadId || `thread_${Date.now()}`,
      };

      // Store in temporary in-memory room buffer (capped at 100 messages)
      room.messages.push(messageObj);
      if (room.messages.length > 100) {
        room.messages.shift();
      }

      // Deliver immediately to recipient
      sendJson(recipientClient.ws, {
        type: 'NEW_MESSAGE',
        message: messageObj,
      });

      // Confirm send back to sender
      sendJson(ws, {
        type: 'MESSAGE_SENT',
        message: messageObj,
      });

      console.log(`[RAGEWARE] Message transferred: ${client.ragewareId} -> ${recipientClient.ragewareId} [${room.roomId}]`);
      return;
    }

    // 3. LEAVE_ROOM
    if (type === 'LEAVE_ROOM') {
      removeClientFromRoom(client);
      sendJson(ws, {
        type: 'LEFT_SESSION_SUCCESS',
      });
      return;
    }

    // 4. PING
    if (type === 'PING') {
      sendJson(ws, { type: 'PONG', timestamp: Date.now() });
      return;
    }
  });

  ws.on('close', () => {
    console.log(`[RAGEWARE] Client disconnected: ${client.id} (${client.ragewareId || 'unregistered'})`);
    removeClientFromRoom(client);
  });

  ws.on('error', (err) => {
    console.error(`[RAGEWARE] Client socket error (${client.id}):`, err.message);
    removeClientFromRoom(client);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  RAGEWARE Temporary Real-Time Communication Server`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  WebSocket URL: ws://localhost:${PORT}`);
  console.log(`  Zero Database. In-Memory Session Storage Only.`);
  console.log('====================================================');
});
