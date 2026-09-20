/**
 * RAGEWARE — Real-Time Mail Client Service
 * 
 * Hybrid Real-Time Architecture:
 * 1. Dedicated WebSocket Server (when running locally or with VITE_RAGEWARE_REALTIME_URL).
 * 2. Instant Browser Peer Mesh via BroadcastChannel & LocalStorage event syncing
 *    (100% serverless, zero-configuration real-time messaging across tabs and windows
 *    on Vercel, static hosting, or offline environments).
 * 
 * ZERO database persistence — temporary in-memory state during the active session.
 */

class RagewareMailService {
  constructor() {
    this.ws = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
    this.mode = 'PEER_MESH'; // 'WEBSOCKET' | 'PEER_MESH'
    this.currentRoomId = null;
    this.currentUserId = null; // e.g. "ADHIL"
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
    this.maxReconnectAttempts = 2;
    this.reconnectTimer = null;
    this.pingInterval = null;
    this.presenceInterval = null;
    this.explicitDisconnect = false;

    // Cross-tab / cross-window broadcast channel
    this.channel = null;
    this.initBroadcastChannel();
  }

  initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('rageware_mail_mesh');
        this.channel.onmessage = (event) => this.handlePeerMessage(event.data);
      } catch (err) {
        console.warn('[MailService] BroadcastChannel unavailable, falling back to storage events:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'rageware_mail_p2p_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handlePeerMessage(data);
          } catch {}
        }
      });
    }
  }

  // Get WebSocket URL from environment or default to local dev server
  getServerUrl() {
    const envUrl = import.meta.env.VITE_RAGEWARE_REALTIME_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim();
    }
    // Only attempt local ws on localhost / 127.0.0.1
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        return 'ws://localhost:8000';
      }
    }
    // On static deployments (like Vercel) without env var, return null to use peer mesh directly
    return null;
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

  setStatus(newStatus, mode = this.mode) {
    this.mode = mode;
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.emit({ type: 'STATUS_CHANGE', status: newStatus, mode: this.mode });
    }
  }

  connect() {
    const url = this.getServerUrl();

    // If no dedicated WebSocket server is configured, switch directly to Browser Peer Mesh
    if (!url) {
      console.log('[MailService] Initializing Serverless Peer Mesh mode (active across tabs/windows).');
      this.mode = 'PEER_MESH';
      this.setStatus('CONNECTED', 'PEER_MESH');
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.explicitDisconnect = false;
    this.setStatus('CONNECTING');

    try {
      this.ws = new WebSocket(url);
    } catch (err) {
      console.warn('[MailService] Failed to instantiate WebSocket, falling back to Peer Mesh:', err);
      this.fallbackToPeerMesh();
      return;
    }

    this.ws.onopen = () => {
      console.log('[MailService] Connected to real-time WebSocket server:', url);
      this.mode = 'WEBSOCKET';
      this.setStatus('CONNECTED', 'WEBSOCKET');
      this.reconnectAttempts = 0;
      this.startHeartbeat();

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

    this.ws.onclose = () => {
      this.stopHeartbeat();
      if (!this.explicitDisconnect) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.reconnectTimer = setTimeout(() => this.connect(), 1500);
        } else {
          // Graceful fallback to Peer Mesh without breaking the app
          this.fallbackToPeerMesh();
        }
      }
    };

    this.ws.onerror = () => {
      this.fallbackToPeerMesh();
    };
  }

  fallbackToPeerMesh() {
    console.log('[MailService] WebSocket server unavailable; operating in local Peer Mesh mode.');
    this.mode = 'PEER_MESH';
    this.setStatus('CONNECTED', 'PEER_MESH');

    if (this.currentRoomId && this.currentUserId) {
      this.joinPeerSession(this.currentRoomId, this.currentUserId);
    }
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

  broadcastPeer(payload) {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('[MailService] BroadcastChannel post failed:', e);
      }
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rageware_mail_p2p_event', JSON.stringify({ ...payload, _t: Date.now() }));
      } catch {}
    }
  }

  // Handle messages received from other tabs/windows in Peer Mesh mode
  handlePeerMessage(data) {
    if (!data || !this.currentRoomId || data.roomId !== this.currentRoomId) return;

    switch (data.type) {
      case 'PEER_DISCOVERY_PING': {
        // Another user is asking who is in the room. Respond with our presence.
        if (this.currentUserId && data.from !== this.currentUserId) {
          this.broadcastPeer({
            type: 'PEER_PRESENCE_PONG',
            roomId: this.currentRoomId,
            from: this.currentUserId,
          });
          if (!this.onlineUsers.includes(data.from)) {
            this.onlineUsers = [...this.onlineUsers, data.from];
            this.emit({ type: 'USER_JOINED', ragewareId: data.from, users: this.onlineUsers });
          }
        }
        break;
      }

      case 'PEER_PRESENCE_PONG': {
        // A peer replied with their presence
        if (data.from && !this.onlineUsers.includes(data.from)) {
          this.onlineUsers = [...this.onlineUsers, data.from];
          this.emit({ type: 'USER_JOINED', ragewareId: data.from, users: this.onlineUsers });
        }
        break;
      }

      case 'PEER_USER_JOIN': {
        if (data.ragewareId && !this.onlineUsers.includes(data.ragewareId)) {
          this.onlineUsers = [...this.onlineUsers, data.ragewareId];
          this.emit({ type: 'USER_JOINED', ragewareId: data.ragewareId, users: this.onlineUsers });
        }
        break;
      }

      case 'PEER_USER_LEFT': {
        if (data.ragewareId) {
          this.onlineUsers = this.onlineUsers.filter((u) => u !== data.ragewareId);
          this.emit({ type: 'USER_LEFT', ragewareId: data.ragewareId, users: this.onlineUsers });
        }
        break;
      }

      case 'PEER_MESSAGE': {
        const msg = data.message;
        if (!msg) return;

        // Check if message is for us
        const cleanRecipient = msg.recipient.toUpperCase().replace(/@RAGEWARE$/i, '');
        if (cleanRecipient === this.currentUserId) {
          this.folders.inbox = [msg, ...this.folders.inbox.filter((m) => m.id !== msg.id)];
          this.emit({
            type: 'NEW_MESSAGE',
            message: msg,
            folders: { ...this.folders },
          });
        }
        break;
      }

      default:
        break;
    }
  }

  handleServerMessage(data) {
    const { type } = data;

    switch (type) {
      case 'JOIN_SUCCESS':
        this.currentRoomId = data.roomId;
        this.currentUserId = data.ragewareId;
        this.onlineUsers = data.users || [];

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
        break;

      default:
        break;
    }
  }

  // Join or Create a Temporary Session (defaults to GLOBAL room)
  joinSession(arg1, arg2) {
    let cleanId;
    let cleanRoom;

    if (arg2 !== undefined) {
      cleanRoom = arg1;
      cleanId = arg2;
    } else {
      cleanRoom = 'GLOBAL';
      cleanId = arg1;
    }

    this.currentRoomId = (cleanRoom || 'GLOBAL').trim().toUpperCase();
    this.currentUserId = cleanId ? cleanId.trim().toUpperCase() : null;

    if (this.mode === 'WEBSOCKET' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendJson({
        type: 'JOIN_ROOM',
        roomId: this.currentRoomId,
        ragewareId: this.currentUserId,
      });
      return;
    }

    // Otherwise use Peer Mesh
    this.joinPeerSession(this.currentRoomId, this.currentUserId);
  }

  joinPeerSession(roomId, ragewareId) {
    this.currentRoomId = roomId;
    this.currentUserId = ragewareId;
    this.onlineUsers = [ragewareId];

    // Announce to other tabs/windows
    this.broadcastPeer({
      type: 'PEER_USER_JOIN',
      roomId,
      ragewareId,
    });

    // Query for other peers in this room
    this.broadcastPeer({
      type: 'PEER_DISCOVERY_PING',
      roomId,
      from: ragewareId,
    });

    this.setStatus('CONNECTED', 'PEER_MESH');

    this.emit({
      type: 'JOIN_SUCCESS',
      roomId,
      ragewareId,
      users: this.onlineUsers,
      folders: { ...this.folders },
      mode: 'PEER_MESH',
    });
  }

  // Send a Real Mail to another active user
  sendMail(to, subject, body, threadId = null) {
    const cleanTo = to.trim().toUpperCase().replace(/@RAGEWARE$/i, '');

    // Format standard message
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roomId: this.currentRoomId,
      sender: this.currentUserId,
      recipient: cleanTo,
      subject: subject.trim() || '(No Subject)',
      body: body.trim(),
      threadId: threadId || null,
      timestamp: Date.now(),
    };

    // If WebSocket is connected, use it
    if (this.mode === 'WEBSOCKET' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return this.sendJson({
        type: 'SEND_MESSAGE',
        to: cleanTo,
        subject: msg.subject,
        body: msg.body,
        threadId: msg.threadId,
      });
    }

    // In Peer Mesh mode: Save in Sent & Broadcast to peers
    this.folders.sent = [msg, ...this.folders.sent];
    this.broadcastPeer({
      type: 'PEER_MESSAGE',
      roomId: this.currentRoomId,
      message: msg,
    });

    this.emit({
      type: 'MESSAGE_SENT',
      message: msg,
      folders: { ...this.folders },
    });

    return true;
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

    this.folders[folderKey] = this.folders[folderKey].filter((m) => m.id !== messageId);
    if (folderKey !== 'trash') {
      this.folders.trash = [target, ...this.folders.trash];
    }
    this.emit({ type: 'MESSAGE_DELETED', messageId, folders: { ...this.folders } });
  }

  // Leave active session and clear temporary state
  leaveSession() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    if (this.mode === 'WEBSOCKET' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendJson({ type: 'LEAVE_ROOM' });
    } else {
      this.broadcastPeer({
        type: 'PEER_USER_LEFT',
        roomId: this.currentRoomId,
        ragewareId: this.currentUserId,
      });
    }

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
