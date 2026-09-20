import React, { useEffect, useState } from 'react';
import { IconWarning, IconInfo, IconMail } from './OSIcons';

export default function SystemNotification({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 150);
      }, notification.duration || 8000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const isMail = notification.type === 'mail' || notification.icon === 'mail';

  return (
    <div className={`win95-notification-balloon ${isVisible ? 'open' : 'closed'}`} id="system-notification">
      <div className="notif-titlebar">
        <div className="notif-titlebar-left">
          {isMail ? <IconMail size={14} /> : <IconWarning size={14} />}
          <span className="notif-title-text">{notification.title || 'RAGEWARE NOTIFICATION'}</span>
        </div>
        <button
          className="win95-ctrl-btn notif-close-btn"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 150);
          }}
          title="Close notification"
        >
          &#10005;
        </button>
      </div>
      <div className="notif-body">
        <p className="notif-message" style={{ whiteSpace: 'pre-line' }}>{notification.message}</p>
        {notification.actionLabel && (
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button
              className="win95-btn btn-sm"
              style={{ fontWeight: 'bold', minWidth: '60px' }}
              onClick={() => {
                if (notification.onAction) notification.onAction();
                setIsVisible(false);
                setTimeout(onClose, 150);
              }}
            >
              {notification.actionLabel}
            </button>
          </div>
        )}
      </div>
      <div className="notif-footer">
        <span className="notif-tag">{isMail ? 'RAGEWARE REAL-TIME MAIL' : 'RAGEWARE 98 COGNITIVE LABS'}</span>
      </div>
    </div>
  );
}
