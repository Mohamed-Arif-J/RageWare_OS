import React, { useEffect, useState } from 'react';
import { IconWarning, IconInfo } from './OSIcons';

export default function SystemNotification({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 150);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={`win95-notification-balloon ${isVisible ? 'open' : 'closed'}`} id="system-notification">
      <div className="notif-titlebar">
        <div className="notif-titlebar-left">
          <IconWarning size={14} />
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
        <p className="notif-message">{notification.message}</p>
      </div>
      <div className="notif-footer">
        <span className="notif-tag">RAGEWARE 98 COGNITIVE LABS</span>
      </div>
    </div>
  );
}
