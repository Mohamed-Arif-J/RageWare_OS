import React from 'react';

export default function DesktopIcon({
  id,
  name,
  icon: IconComponent,
  isSelected = false,
  onSelect,
  onOpen,
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      if (onOpen) onOpen(id);
    } else {
      if (onSelect) onSelect(id);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onOpen) onOpen(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      if (onOpen) onOpen(id);
    }
  };

  return (
    <div
      id={`desktop-icon-${id}`}
      tabIndex={0}
      className={`win95-desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      title={`${name} (Double-click to open)`}
    >
      <div className="win95-icon-graphic">
        {IconComponent && <IconComponent size={32} />}
      </div>
      <div className="win95-icon-label-wrap">
        <span className="win95-icon-label">{name}</span>
      </div>
    </div>
  );
}
