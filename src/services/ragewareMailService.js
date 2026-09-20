/**
 * RAGEWARE — Real-Time Mail Client Service
 * 
 * Manages WebSocket lifecycle, temporary session identity, real-time message exchange,
 * and user presence.
 * ZERO database persistence — temporary in-memory store during the active session.
 */

class RagewareMailService {
  constructor() {
    this.ws = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
    this.currentRoomId = null;
    this.currentUserId = null; // e.g. "ADHIL95"
    this.onlineUsers = []; // string[]
    
    // In-memory mailbox folders for current session
    this.folders = {
      inbox: [],
      sent: [],
      drafts: [],
      trash: [],
    };

    this.subscribers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimer = null;
    this.pingInterval = null;
    this.explicitDisconnect = false;
  }

  // Get WebSocket URL from environment or default to local dev server
  getServerUrl() {
    const envUrl = import.meta.env.VITE_RAGEWARE_REALTIME_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim();
    }
    // Default fallback
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      return 'wss://' + window.location.host;
    }
    return 'ws://localhost:8000';
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  emit(event) {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error('[MailService] Subscriber error:', err);
      }
    }
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.emit({ type: 'STATUS_CHANGE', status: newStatus });
    }
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.explicitDisconnect = false;
    this.setStatus('CONNECTING');

    const url = this.getServerUrl();
    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.error('[MailService] Failed to instantiate WebSocket:', err);
      this.setStatus('DISCONNECTED');
      this.handleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[MailService] Connected to real-time server:', url);
      this.setStatus('CONNECTED');
      this.reconnectAttempts = 0;
      this.startHeartbeat();

      // If we were previously in a session, re-join
      if (this.currentRoomId && this.currentUserId) {
        this.joinSession(this.currentRoomId, this.currentUserId);
      }
    };

    this.ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.warn('[MailService] Received unparseable message:', event.data);
        return;
      }

      this.handleServerMessage(data);
    };

    this.ws.onclose = (event) => {
      console.log('[MailService] WebSocket closed:', event.code, event.reason);
      this.stopHeartbeat();
      this.setStatus('DISCONNECTED');

      if (!this.explicitDisconnect) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (err) => {
      console.error('[MailService] WebSocket encountered error:', err);
      this.emit({
        type: 'CONNECTION_ERROR',
        message: 'Connection to RAGEWARE communication server failed.',
      });
    };
  }

  handleReconnect() {
    if (this.explicitDisconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[MailService] Maximum reconnect attempts reached.');
      this.emit({
        type: 'CONNECTION_FAILED_PERMANENT',
        message: 'Connection to RAGEWARE communication server was lost.',
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    console.log(`[MailService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  retryConnection() {
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.connect();
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendJson({ type: 'PING' });
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  sendJson(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  handleServerMessage(data) {
    const { type } = data;

    switch (type) {
      case 'JOIN_SUCCESS':
        this.currentRoomId = data.roomId;
        this.currentUserId = data.ragewareId;
        this.onlineUsers = data.users || [];

        // Distribute existing session messages to folders
        if (Array.isArray(data.messages)) {
          this.folders.inbox = data.messages.filter((m) => m.recipient === this.currentUserId);
          this.folders.sent = data.messages.filter((m) => m.sender === this.currentUserId);
        }

        this.emit({
          type: 'JOIN_SUCCESS',
          roomId: data.roomId,
          ragewareId: data.ragewareId,
          users: this.onlineUsers,
          folders: { ...this.folders },
        });
        break;

      case 'USER_JOINED':
        this.onlineUsers = data.users || [];
        this.emit({
          type: 'USER_JOINED',
          ragewareId: data.ragewareId,
          users: this.onlineUsers,
        });
        break;

      case 'USER_LEFT':
        this.onlineUsers = data.users || [];
        this.emit({
          type: 'USER_LEFT',
          ragewareId: data.ragewareId,
          users: this.onlineUsers,
        });
        break;

      case 'NEW_MESSAGE': {
        const msg = data.message;
        // Prepend to Inbox
        this.folders.inbox = [msg, ...this.folders.inbox.filter((m) => m.id !== msg.id)];
        this.emit({
          type: 'NEW_MESSAGE',
          message: msg,
          folders: { ...this.folders },
        });
        break;
      }

      case 'MESSAGE_SENT': {
        const msg = data.message;
        // Prepend to Sent
        this.folders.sent = [msg, ...this.folders.sent.filter((m) => m.id !== msg.id)];
        this.emit({
          type: 'MESSAGE_SENT',
          message: msg,
          folders: { ...this.folders },
        });
        break;
      }

      case 'ERROR':
        this.emit({
          type: 'SERVER_ERROR',
          code: data.code,
          message: data.message,
          recipient: data.recipient,
        });
        break;

      case 'PONG':
        // Heartbeat confirmed
        break;

      default:
        console.log('[MailService] Unhandled server event:', data);
    }
  }

  // Join or Create a Temporary Session
  joinSession(roomId, ragewareId) {
    this.currentRoomId = roomId ? roomId.trim().toUpperCase() : null;
    this.currentUserId = ragewareId ? ragewareId.trim().toUpperCase() : null;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
      // Join command will be sent once onopen triggers
      return;
    }

    this.sendJson({
      type: 'JOIN_ROOM',
      roomId: this.currentRoomId,
      ragewareId: this.currentUserId,
    });
  }

  // Send a Real Mail to another active user
  sendMail(to, subject, body, threadId = null) {
    if (this.status !== 'CONNECTED') {
      this.emit({
        type: 'SERVER_ERROR',
        code: 'NOT_CONNECTED',
        message: 'Cannot send message. Communication server is not connected.',
      });
      return false;
    }

    return this.sendJson({
      type: 'SEND_MESSAGE',
      to,
      subject,
      body,
      threadId,
    });
  }

  // Save in local Drafts folder
  saveDraft(to, subject, body) {
    const draft = {
      id: `draft_${Date.now()}`,
      sender: this.currentUserId,
      recipient: to,
      subject: subject || '(Draft - No Subject)',
      body: body || '',
      timestamp: Date.now(),
      isDraft: true,
    };
    this.folders.drafts = [draft, ...this.folders.drafts];
    this.emit({ type: 'DRAFT_SAVED', draft, folders: { ...this.folders } });
    return draft;
  }

  // Move a message to trash or permanently remove
  deleteMessage(messageId, folderKey = 'inbox') {
    if (!this.folders[folderKey]) return;
    const target = this.folders[folderKey].find((m) => m.id === messageId);
    if (!target) return;

    // Remove from source folder
    this.folders[folderKey] = this.folders[folderKey].filter((m) => m.id !== messageId);

    // If not already in trash, move to trash
    if (folderKey !== 'trash') {
      this.folders.trash = [target, ...this.folders.trash];
    }

    this.emit({ type: 'MESSAGE_DELETED', messageId, folders: { ...this.folders } });
  }

  // Leave active session and clear temporary state
  leaveSession() {
    this.explicitDisconnect = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendJson({ type: 'LEAVE_ROOM' });
      try {
        this.ws.close();
      } catch {}
    }

    this.ws = null;
    this.setStatus('DISCONNECTED');
    this.currentRoomId = null;
    this.currentUserId = null;
    this.onlineUsers = [];
    this.folders = {
      inbox: [],
      sent: [],
      drafts: [],
      trash: [],
    };

    this.emit({ type: 'SESSION_RESET' });
  }
}

// Export singleton instance
export const ragewareMailService = new RagewareMailService();
