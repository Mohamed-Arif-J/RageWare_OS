import React, { useState, useEffect, useRef } from 'react';
import { 
  IconMail, 
  IconFolder, 
  IconInfo, 
  IconWarning 
} from './OSIcons';
import { ragewareMailService } from '../../services/ragewareMailService';
import { soundEngine } from '../../engine/soundEngine';
import { increaseRage, RAGE_EVENTS } from '../../engine/rageEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';

export default function RagewareMailApp({ 
  onClose, 
  onRageUpdate,
  isChaosMode = true,
  initialSelectedMessageId = null 
}) {
  // Session Identity State
  const [sessionJoined, setSessionJoined] = useState(
    Boolean(ragewareMailService.currentUserId)
  );
  const [inputId, setInputId] = useState(ragewareMailService.currentUserId || '');
  
  // Connection & User State
  const [connectionStatus, setConnectionStatus] = useState(ragewareMailService.status);
  const [connectionMode, setConnectionMode] = useState(ragewareMailService.mode);
  const [activeUserId, setActiveUserId] = useState(ragewareMailService.currentUserId || '');
  const [onlineUsers, setOnlineUsers] = useState(ragewareMailService.onlineUsers || []);
  
  // Mailbox Folders
  const [folders, setFolders] = useState({ ...ragewareMailService.folders });
  const [currentFolder, setCurrentFolder] = useState('inbox'); // 'inbox' | 'sent' | 'drafts' | 'trash'
  const [selectedMessageId, setSelectedMessageId] = useState(initialSelectedMessageId);

  // Modals & UI States
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [dialogError, setDialogError] = useState(null); // { title, message }
  
  // Compose Form
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeThreadId, setComposeThreadId] = useState(null);

  // Anti-Spam / Behavioral Tracking for OS Personality
  const refreshCountRef = useRef(0);
  const lastSendHashRef = useRef(null);

  // Subscribe to real-time service events
  useEffect(() => {
    // If not connected yet, initiate connection
    if (ragewareMailService.status === 'DISCONNECTED' && !ragewareMailService.explicitDisconnect) {
      ragewareMailService.connect();
    }

    const unsubscribe = ragewareMailService.subscribe((event) => {
      switch (event.type) {
        case 'STATUS_CHANGE':
          setConnectionStatus(event.status);
          if (event.mode) setConnectionMode(event.mode);
          break;

        case 'JOIN_SUCCESS':
          setSessionJoined(true);
          setActiveUserId(event.ragewareId);
          setOnlineUsers(event.users || []);
          if (event.folders) setFolders({ ...event.folders });
          soundEngine.playDing();
          break;

        case 'USER_JOINED':
          setOnlineUsers(event.users || []);
          soundEngine.playClick();
          break;

        case 'USER_LEFT':
          setOnlineUsers(event.users || []);
          break;

        case 'NEW_MESSAGE': {
          if (event.folders) setFolders({ ...event.folders });
          soundEngine.playDing();
          // Auto-select if nothing is currently selected
          if (!selectedMessageId) {
            setSelectedMessageId(event.message.id);
          }
          break;
        }

        case 'MESSAGE_SENT': {
          if (event.folders) setFolders({ ...event.folders });
          setIsComposeOpen(false);
          soundEngine.playClick();
          
          // Personality reaction to successful delivery
          osPersonalityInstance.dispatch({
            type: 'notification',
            title: 'RAGEWARE MAIL',
            message: 'Message delivered. Against all odds.',
            severity: 'low',
          });
          break;
        }

        case 'SERVER_ERROR': {
          setDialogError({
            title: 'RAGEWARE MAIL',
            message: event.message,
          });
          soundEngine.playChord();

          // If failed recipient, increase rage subtly
          if (event.code === 'RECIPIENT_NOT_FOUND' || event.code === 'INVALID_RECIPIENT') {
            increaseRage(8, 'precision');
            if (onRageUpdate) onRageUpdate();
          }
          break;
        }

        case 'CONNECTION_FAILED_PERMANENT': {
          console.warn('[RagewareMailApp] Communication server unavailable; operating in local Peer Mesh mode.');
          setConnectionStatus('CONNECTED');
          break;
        }

        case 'SESSION_RESET': {
          setSessionJoined(false);
          setActiveRoomId('');
          setActiveUserId('');
          setOnlineUsers([]);
          setFolders({ inbox: [], sent: [], drafts: [], trash: [] });
          setSelectedMessageId(null);
          break;
        }

        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [selectedMessageId, onRageUpdate]);

  // Handle Entering Mail with RAGEWARE ID
  const handleEnterWithId = (e) => {
    if (e) e.preventDefault();
    const cleanId = inputId.trim().toUpperCase().replace(/@rageware$/i, '');

    if (!cleanId || cleanId.length < 2 || cleanId.length > 18) {
      setDialogError({
        title: 'RAGEWARE MAIL',
        message: 'Invalid RAGEWARE ID.\nPlease enter a 2-18 character username.',
      });
      soundEngine.playChord();
      return;
    }

    soundEngine.playClick();
    ragewareMailService.joinSession(cleanId);
  };

  // Handle Changing ID / Return to Welcome Screen
  const handleChangeId = () => {
    soundEngine.playClick();
    ragewareMailService.leaveSession();
    setSessionJoined(false);
    setActiveUserId('');
    setOnlineUsers([]);
    setFolders({ inbox: [], sent: [], drafts: [], trash: [] });
    setSelectedMessageId(null);
  };

  // Handle Compose open
  const handleOpenCompose = (to = '', subject = '', body = '', threadId = null) => {
    soundEngine.playClick();
    setComposeTo(to);
    setComposeSubject(subject);
    setComposeBody(body);
    setComposeThreadId(threadId);
    setIsComposeOpen(true);
  };

  // Handle Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const cleanTo = composeTo.trim();
    const cleanSubject = composeSubject.trim();
    const cleanBody = composeBody.trim();

    if (!cleanTo) {
      setDialogError({
        title: 'RAGEWARE MAIL',
        message: 'Please specify a recipient RAGEWARE address.',
      });
      soundEngine.playChord();
      return;
    }

    // Check repeated send attempt on identical message
    const sendHash = `${cleanTo}|${cleanSubject}|${cleanBody}`;
    if (lastSendHashRef.current === sendHash) {
      osPersonalityInstance.dispatch({
        type: 'notification',
        title: 'RAGEWARE MAIL',
        message: 'That message has already been sent.',
        severity: 'low',
      });
      soundEngine.playDing();
      return;
    }
    lastSendHashRef.current = sendHash;

    ragewareMailService.sendMail(cleanTo, cleanSubject, cleanBody, composeThreadId);
  };

  // Handle Save Draft
  const handleSaveDraft = () => {
    soundEngine.playClick();
    ragewareMailService.saveDraft(composeTo, composeSubject, composeBody);
    setIsComposeOpen(false);
  };

  // Handle Reply
  const handleReplyToMessage = (msg) => {
    if (!msg) return;
    const targetRecipient = `${msg.sender}@RAGEWARE`;
    const replySubject = msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`;
    const quotedBody = `\n\n--- Original Message from ${msg.sender}@RAGEWARE ---\n${msg.body}`;
    handleOpenCompose(targetRecipient, replySubject, quotedBody, msg.threadId || msg.id);
  };

  // Handle Delete
  const handleDeleteMessage = (msgId) => {
    soundEngine.playClick();
    ragewareMailService.deleteMessage(msgId, currentFolder);
    if (selectedMessageId === msgId) {
      setSelectedMessageId(null);
    }
  };

  // Handle Refresh
  const handleRefresh = () => {
    soundEngine.playClick();
    refreshCountRef.current += 1;

    // Check repeated refresh for OS personality sarcasm
    if (refreshCountRef.current >= 3) {
      osPersonalityInstance.dispatch({
        type: 'notification',
        title: 'RAGEWARE MAIL',
        message: 'Refreshing the mailbox again will not summon new mail.',
        severity: 'low',
      });
      soundEngine.playDing();
      refreshCountRef.current = 0;
    }
  };

  // Get active folder list of messages
  const activeMessages = folders[currentFolder] || [];
  const selectedMessage = activeMessages.find((m) => m.id === selectedMessageId) || activeMessages[0] || null;

  // Format timestamp into retro Windows 95 time
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // -------------------------------------------------------------
  // VIEW 1: WELCOME & IDENTITY SETUP WIZARD
  // -------------------------------------------------------------
  if (!sessionJoined) {
    return (
      <div className="win95-mail-welcome sunken" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#C0C0C0',
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'var(--font-win95)',
      }}>
        {/* Wizard Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          borderBottom: '2px groove #ffffff',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}>
          <IconMail size={42} />
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: '#000080' }}>
              WELCOME TO RAGEWARE MAIL
            </h2>
            <p style={{ fontSize: '11px', margin: '3px 0 0 0', color: '#333333' }}>
              Temporary Real-Time Peer Communication System
            </p>
          </div>
        </div>

        {/* Wizard Body Form */}
        <form onSubmit={handleEnterWithId} style={{ maxWidth: '440px', margin: '0 auto', width: '100%' }}>
          <div className="win95-fieldset" style={{ marginBottom: '16px' }}>
            <legend style={{ fontWeight: 'bold', color: '#000080' }}>Choose Temporary RAGEWARE ID</legend>
            <div style={{ fontSize: '11px', color: '#555555', marginBottom: '8px' }}>
              Choose your temporary username. Messages addressed to you will arrive in real-time.
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '11px' }}>
                Temporary RAGEWARE ID:
              </label>
              <input
                type="text"
                className="win95-input"
                style={{ width: '100%', textTransform: 'uppercase', fontWeight: inputId ? 'bold' : 'normal', fontSize: '13px', padding: '4px 6px' }}
                value={inputId}
                onChange={(e) => setInputId(e.target.value.toUpperCase())}
                placeholder="e.g. USERNAME"
                maxLength={18}
                autoFocus
                required
              />
            </div>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #808080',
              padding: '8px 10px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: '500' }}>Your RAGEWARE Address:</span>
              <strong style={{ color: '#000080', fontSize: '12px' }}>
                {(inputId && inputId.trim() ? inputId.trim().toUpperCase() : 'USERNAME')}@RAGEWARE
              </strong>
            </div>
          </div>

          <div style={{
            border: '1px dashed #808080',
            backgroundColor: '#FFF9D2',
            padding: '10px 12px',
            fontSize: '11px',
            lineHeight: '1.4',
            marginBottom: '16px',
            color: '#404040',
          }}>
            <strong>REAL-TIME PEER MESSAGING:</strong><br />
            Enter your ID to connect instantly. Open a second browser tab or window to exchange real-time messages between different user IDs.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="win95-btn"
              onClick={onClose}
              style={{ minWidth: '80px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="win95-btn default-btn"
              style={{ fontWeight: 'bold', padding: '6px 20px', minWidth: '220px', color: '#000080' }}
            >
              ★ ENTER RAGEWARE MAIL ▶
            </button>
          </div>
        </form>

        {/* Retro Error Dialog */}
        {dialogError && (
          <div className="os-dialog-backdrop" onClick={() => setDialogError(null)}>
            <div className="os-dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
              <div className="os-dialog-titlebar">
                <span className="os-dialog-title">{dialogError.title}</span>
                <button className="dialog-close-btn" onClick={() => setDialogError(null)}>&#10005;</button>
              </div>
              <div className="os-dialog-content">
                <IconWarning size={32} />
                <div className="os-dialog-msg" style={{ whiteSpace: 'pre-line' }}>
                  {dialogError.message}
                </div>
              </div>
              <div className="os-dialog-actions">
                <button
                  className="win95-btn default-btn"
                  onClick={() => setDialogError(null)}
                  autoFocus
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: RETRO OUTLOOK EXPRESS / MS MAIL INTERFACE
  // -------------------------------------------------------------
  return (
    <div className="win95-mail-shell" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: '#C0C0C0',
      userSelect: 'none',
      fontFamily: 'var(--font-win95)',
      overflow: 'hidden',
    }}>
      {/* 1. Classic Windows Menu Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderBottom: '1px solid #808080',
        fontSize: '11px',
        backgroundColor: '#C0C0C0',
        gap: '12px',
      }}>
        <span style={{ cursor: 'pointer' }} onClick={() => handleOpenCompose()}><u>F</u>ile</span>
        <span style={{ cursor: 'pointer' }} onClick={handleRefresh}><u>M</u>ail</span>
        <span style={{ cursor: 'pointer' }} onClick={() => setIsAboutOpen(true)}><u>H</u>elp</span>
      </div>

      {/* 2. Classic Win95 Toolbar Strip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 6px',
        borderBottom: '2px solid #808080',
        backgroundColor: '#D4D0C8',
        flexWrap: 'wrap',
      }}>
        <button 
          className="win95-btn btn-sm"
          onClick={() => handleOpenCompose()}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
        >
          <IconMail size={16} />
          <span>New Msg</span>
        </button>

        <button 
          className="win95-btn btn-sm"
          disabled={!selectedMessage}
          onClick={() => handleReplyToMessage(selectedMessage)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>&#8617; Reply</span>
        </button>

        <button 
          className="win95-btn btn-sm"
          disabled={!selectedMessage}
          onClick={() => selectedMessage && handleDeleteMessage(selectedMessage.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>&#10005; Delete</span>
        </button>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#808080', margin: '0 4px' }} />

        <button 
          className="win95-btn btn-sm"
          onClick={handleRefresh}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Check for new messages"
        >
          <span>&#8635; Send/Recv</span>
        </button>

        <button 
          className="win95-btn btn-sm"
          onClick={handleChangeId}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontWeight: 'bold',
            color: '#800000',
            backgroundColor: '#ECE9D8',
            border: '2px outset #FFFFFF',
            padding: '2px 8px',
          }}
          title="Change your RAGEWARE ID or log out"
        >
          <span>⟵ Change ID / Log Out</span>
        </button>

        <button 
          className="win95-btn btn-sm"
          onClick={() => setIsAboutOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
        >
          <IconInfo size={14} />
          <span>About</span>
        </button>
      </div>

      {/* 3. Main Workspace: Left Folders + Right Split View */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        backgroundColor: '#C0C0C0',
      }}>
        {/* Left Side: Mailbox Folders & Online Users Panel */}
        <div style={{
          width: '190px',
          borderRight: '2px solid #808080',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#D4D0C8',
        }}>
          {/* Folders List */}
          <div style={{ padding: '4px 6px', fontWeight: 'bold', fontSize: '11px', color: '#000080' }}>
            RAGEWARE Folders
          </div>

          <div className="sunken" style={{
            flex: 1,
            margin: '0 4px 6px 4px',
            backgroundColor: '#FFFFFF',
            overflowY: 'auto',
            padding: '4px',
          }}>
            {[
              { key: 'inbox', label: 'Inbox', count: folders.inbox?.length || 0 },
              { key: 'sent', label: 'Sent Items', count: folders.sent?.length || 0 },
              { key: 'drafts', label: 'Drafts', count: folders.drafts?.length || 0 },
              { key: 'trash', label: 'Deleted Items', count: folders.trash?.length || 0 },
            ].map((f) => {
              const isSelected = currentFolder === f.key;
              return (
                <div
                  key={f.key}
                  onClick={() => {
                    soundEngine.playClick();
                    setCurrentFolder(f.key);
                    setSelectedMessageId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#000080' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#000000',
                    fontSize: '11px',
                    fontWeight: f.key === 'inbox' && f.count > 0 ? 'bold' : 'normal',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconFolder size={14} />
                    <span>{f.label}</span>
                  </div>
                  {f.count > 0 && (
                    <span style={{
                      fontSize: '10px',
                      padding: '0 4px',
                      backgroundColor: isSelected ? '#FFFFFF' : '#E0E0E0',
                      color: isSelected ? '#000080' : '#000000',
                      border: '1px solid #808080',
                    }}>
                      {f.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Identity & Online Users Strip */}
          <div style={{
            borderTop: '1px solid #808080',
            padding: '6px',
            fontSize: '10px',
            backgroundColor: '#C0C0C0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>MY ID:</span>
              <span className="mono" style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #808080',
                padding: '1px 5px',
                fontWeight: 'bold',
                color: '#000080',
              }}>
                {activeUserId}@RAGEWARE
              </span>
            </div>

            <div style={{ fontWeight: 'bold', color: '#000080', margin: '4px 0 2px 0' }}>
              ONLINE USERS ({onlineUsers.length}):
            </div>

            <div className="sunken" style={{
              backgroundColor: '#FFFFFF',
              maxHeight: '75px',
              overflowY: 'auto',
              padding: '2px 4px',
              fontSize: '10px',
            }}>
              {onlineUsers.length === 0 ? (
                <div style={{ color: '#808080', fontStyle: 'italic' }}>No other users connected</div>
              ) : (
                onlineUsers.map((u) => {
                  const isMe = u.toUpperCase() === activeUserId.toUpperCase();
                  return (
                    <div 
                      key={u}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1px 0',
                        color: isMe ? '#000080' : '#000000',
                        fontWeight: isMe ? 'bold' : 'normal',
                      }}
                    >
                      <span>&#9679; {u} {isMe ? '(You)' : ''}</span>
                      {!isMe && (
                        <button
                          type="button"
                          className="win95-btn btn-sm"
                          style={{ fontSize: '9px', padding: '0 4px', height: '16px' }}
                          onClick={() => handleOpenCompose(`${u}@RAGEWARE`)}
                          title={`Send mail to ${u}`}
                        >
                          Mail
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Split View (Message List on Top, Reading Pane on Bottom) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: '#FFFFFF',
        }}>
          {/* Top: Message Table Listview */}
          <div className="sunken" style={{
            flex: '0 0 45%',
            minHeight: '110px',
            overflowY: 'auto',
            borderBottom: '2px solid #808080',
            backgroundColor: '#FFFFFF',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{
                  backgroundColor: '#D4D0C8',
                  borderBottom: '1px solid #808080',
                  textAlign: 'left',
                  position: 'sticky',
                  top: 0,
                }}>
                  <th style={{ padding: '3px 6px', width: '24px', borderRight: '1px solid #808080' }}>!</th>
                  <th style={{ padding: '3px 6px', width: '130px', borderRight: '1px solid #808080' }}>
                    {currentFolder === 'sent' ? 'To' : 'From'}
                  </th>
                  <th style={{ padding: '3px 6px', borderRight: '1px solid #808080' }}>Subject</th>
                  <th style={{ padding: '3px 6px', width: '120px' }}>Received/Sent</th>
                </tr>
              </thead>
              <tbody>
                {activeMessages.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#808080', fontStyle: 'italic' }}>
                      There are no messages in this folder.
                    </td>
                  </tr>
                ) : (
                  activeMessages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    const peer = currentFolder === 'sent' ? msg.recipient : msg.sender;
                    const isThread = msg.subject.startsWith('Re:');

                    return (
                      <tr
                        key={msg.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedMessageId(msg.id);
                        }}
                        style={{
                          backgroundColor: isSelected ? '#000080' : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#000000',
                          cursor: 'pointer',
                          borderBottom: '1px solid #EFEFEF',
                        }}
                      >
                        <td style={{ padding: '2px 6px', textAlign: 'center' }}>
                          <IconMail size={12} />
                        </td>
                        <td style={{ padding: '2px 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {peer}@RAGEWARE
                        </td>
                        <td style={{ padding: '2px 6px', fontWeight: !isSelected && currentFolder === 'inbox' ? 'bold' : 'normal' }}>
                          {isThread && <span style={{ opacity: 0.7, marginRight: '4px' }}>&#8627;</span>}
                          {msg.subject || '(No Subject)'}
                        </td>
                        <td style={{ padding: '2px 6px', whiteSpace: 'nowrap', fontSize: '10px' }}>
                          {formatTime(msg.timestamp)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom: Reading Pane */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
            minHeight: 0,
          }}>
            {selectedMessage ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Message Header */}
                <div style={{
                  padding: '6px 10px',
                  backgroundColor: '#EBE9ED',
                  borderBottom: '1px solid #808080',
                  fontSize: '11px',
                  lineHeight: '1.4',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>From:</strong> {selectedMessage.sender}@RAGEWARE<br />
                      <strong>To:</strong> {selectedMessage.recipient}@RAGEWARE<br />
                      <strong>Date:</strong> {formatTime(selectedMessage.timestamp)}<br />
                      <strong>Subject:</strong> <span style={{ color: '#000080', fontWeight: 'bold' }}>{selectedMessage.subject}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="win95-btn btn-sm"
                        onClick={() => handleReplyToMessage(selectedMessage)}
                      >
                        Reply
                      </button>
                      <button
                        className="win95-btn btn-sm"
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{
                  flex: 1,
                  padding: '10px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-win95)',
                  fontSize: '12px',
                  lineHeight: '1.45',
                  color: '#000000',
                  backgroundColor: '#FFFFFF',
                }}>
                  {selectedMessage.body}
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#808080',
                fontStyle: 'italic',
                fontSize: '11px',
              }}>
                Select a message to view its contents.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Classic Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '2px 6px',
        backgroundColor: '#C0C0C0',
        borderTop: '2px solid #808080',
        fontSize: '11px',
        gap: '8px',
      }}>
        <div className="sunken" style={{
          padding: '1px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: connectionStatus === 'CONNECTED' ? '#008000' : connectionStatus === 'CONNECTING' ? '#855000' : '#C00000',
          fontWeight: 'bold',
        }}>
          <span>&#9679;</span>
          <span>
            {connectionStatus === 'CONNECTED' 
              ? (connectionMode === 'PEER_MESH' ? 'ONLINE (PEER MESH)' : 'ONLINE (SERVER)') 
              : connectionStatus}
          </span>
        </div>

        {connectionStatus === 'DISCONNECTED' && (
          <button
            className="win95-btn btn-sm"
            style={{ fontSize: '10px', padding: '0 6px', color: '#C00000', fontWeight: 'bold' }}
            onClick={() => ragewareMailService.retryConnection()}
          >
            RETRY
          </button>
        )}

        <div className="sunken" style={{ flex: 1, padding: '1px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            My Address: <strong style={{ color: '#000080' }}>{activeUserId}@RAGEWARE</strong>
          </span>
          <button
            className="win95-btn btn-sm"
            style={{ fontSize: '10px', padding: '0 6px', height: '18px', marginLeft: '6px', cursor: 'pointer' }}
            onClick={handleChangeId}
            title="Change your temporary ID"
          >
            Change ID...
          </button>
        </div>

        <div className="sunken" style={{ padding: '1px 6px', whiteSpace: 'nowrap', color: '#000080' }}>
          Peers: <strong>{onlineUsers.length}</strong>
        </div>

        <div className="sunken" style={{ padding: '1px 6px', whiteSpace: 'nowrap' }}>
          {activeMessages.length} message(s)
        </div>
      </div>

      {/* -------------------------------------------------------------
          MODAL: COMPOSE NEW MESSAGE
          ------------------------------------------------------------- */}
      {isComposeOpen && (
        <div className="os-dialog-backdrop" onClick={() => setIsComposeOpen(false)}>
          <div 
            className="os-dialog-box" 
            onClick={(e) => e.stopPropagation()} 
            style={{ width: '480px', maxWidth: '92vw', display: 'flex', flexDirection: 'column' }}
          >
            {/* Titlebar */}
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">New Message — RAGEWARE MAIL</span>
              <button className="dialog-close-btn" onClick={() => setIsComposeOpen(false)}>&#10005;</button>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleSendMessage} style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '60px', fontWeight: 'bold', fontSize: '11px' }}>From:</span>
                <div className="sunken" style={{ flex: 1, padding: '2px 6px', backgroundColor: '#EBE9ED', fontSize: '11px', color: '#000080', fontWeight: 'bold' }}>
                  {activeUserId}@RAGEWARE
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '60px', fontWeight: 'bold', fontSize: '11px' }}>To:</span>
                <input
                  type="text"
                  className="win95-input"
                  style={{ flex: 1, textTransform: 'uppercase' }}
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value.toUpperCase())}
                  placeholder="e.g. username@rageware"
                  required
                />
              </div>

              {/* Quick Online Peer Hints */}
              {onlineUsers.filter((u) => u.toUpperCase() !== activeUserId.toUpperCase()).length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '66px', fontSize: '10px' }}>
                  <span style={{ color: '#666' }}>Active in session:</span>
                  {onlineUsers
                    .filter((u) => u.toUpperCase() !== activeUserId.toUpperCase())
                    .map((u) => (
                      <button
                        key={u}
                        type="button"
                        className="win95-btn btn-sm"
                        style={{ fontSize: '9px', padding: '0 4px' }}
                        onClick={() => setComposeTo(`${u}@RAGEWARE`)}
                      >
                        {u}
                      </button>
                    ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '60px', fontWeight: 'bold', fontSize: '11px' }}>Subject:</span>
                <input
                  type="text"
                  className="win95-input"
                  style={{ flex: 1 }}
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject of message"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '11px' }}>Message:</span>
                <textarea
                  className="win95-input"
                  style={{
                    height: '140px',
                    width: '100%',
                    fontFamily: 'var(--font-win95)',
                    fontSize: '12px',
                    resize: 'vertical',
                    padding: '6px',
                  }}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="win95-btn"
                  onClick={handleSaveDraft}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  className="win95-btn"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="win95-btn default-btn"
                  style={{ fontWeight: 'bold', minWidth: '70px' }}
                >
                  SEND
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ABOUT RAGEWARE MAIL
          ------------------------------------------------------------- */}
      {isAboutOpen && (
        <div className="os-dialog-backdrop" onClick={() => setIsAboutOpen(false)}>
          <div className="os-dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">About RAGEWARE Mail</span>
              <button className="dialog-close-btn" onClick={() => setIsAboutOpen(false)}>&#10005;</button>
            </div>
            <div className="os-dialog-content">
              <IconMail size={36} />
              <div className="os-dialog-msg" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                <strong>RAGEWARE Mail v1.0 (Win98 Edition)</strong><br />
                Simulated Real-Time Communication Environment<br /><br />
                <em>"RAGEWARE Mail is a temporary communication environment. Messages and identities exist only during the active session."</em><br /><br />
                Zero persistent databases. Memory-only message buffer. Real WebSocket peer delivery.
              </div>
            </div>
            <div className="os-dialog-actions">
              <button
                className="win95-btn default-btn"
                onClick={() => setIsAboutOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ERROR DIALOG
          ------------------------------------------------------------- */}
      {dialogError && (
        <div className="os-dialog-backdrop" onClick={() => setDialogError(null)}>
          <div className="os-dialog-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">{dialogError.title}</span>
              <button className="dialog-close-btn" onClick={() => setDialogError(null)}>&#10005;</button>
            </div>
            <div className="os-dialog-content">
              <IconWarning size={32} />
              <div className="os-dialog-msg" style={{ whiteSpace: 'pre-line' }}>
                {dialogError.message}
              </div>
            </div>
            <div className="os-dialog-actions">
              <button
                className="win95-btn default-btn"
                onClick={() => setDialogError(null)}
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
