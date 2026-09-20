import React, { useState, useRef } from 'react';
import { soundEngine } from '../../engine/soundEngine';
import { virtualFs } from '../../services/virtualFs';

const INSULT_CORRECTIONS = {
  the: 'teh',
  work: 'procrastination',
  please: 'suffer',
  help: 'no',
  code: 'spaghetti',
  smart: 'clueless',
  save: 'delete',
  good: 'mediocre',
  fast: 'glacial',
  human: 'clicker',
  ready: 'unprepared',
  done: 'giving up',
  system: 'rageware',
};

const CHAOTIC_CHARS = ['q', 'x', 'z', '!', '¿', '#', 'ß', '§', '?', '7'];

export default function NotepadApp({ isChaosMode = true, onClose }) {
  const [content, setContent] = useState(
    'Welcome to Notepad 98 AI Edition.\nStart typing your profound thoughts below...\n'
  );
  const [wordCount, setWordCount] = useState(10);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saveFolderId, setSaveFolderId] = useState('documents');
  const [saveFileName, setSaveFileName] = useState('notes.txt');
  const [saveFileType, setSaveFileType] = useState('txt');
  const [wordCounterForAutoCorrect, setWordCounterForAutoCorrect] = useState(0);
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    // Intercept Ctrl+S for custom Save dialog
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      soundEngine.playDing();
      setShowSaveDialog(true);
      return;
    }

    if (!isChaosMode) return; // Completely normal in Safe Mode!

    // Backspace Ragebait in Chaos Mode: ~30% chance backspace types random characters
    if (e.key === 'Backspace' && Math.random() < 0.32) {
      e.preventDefault();
      soundEngine.playKeyboardClick?.() || soundEngine.playClick();
      const randomChar = CHAOTIC_CHARS[Math.floor(Math.random() * CHAOTIC_CHARS.length)];
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = content.substring(0, start) + randomChar + content.substring(end);
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
      return;
    }

    // Key Sticking / Spamming in Chaos Mode: ~14% chance normal keypress repeats 2-3 times
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && e.key !== ' ' && Math.random() < 0.14) {
      e.preventDefault();
      soundEngine.playKeyboardClick?.() || soundEngine.playClick();
      const repeatCount = Math.floor(Math.random() * 2) + 2; // 2 or 3 times
      const spammed = e.key.repeat(repeatCount);
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newText = content.substring(0, start) + spammed + content.substring(end);
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spammed.length;
        }
      }, 0);
      return;
    }

    // Space key auto-correction injection
    if (e.key === ' ' || e.key === 'Enter') {
      const nextCount = wordCounterForAutoCorrect + 1;
      setWordCounterForAutoCorrect(nextCount);

      if (nextCount % 5 === 0 && Math.random() < 0.75) {
        // Find last word and replace if possible
        const words = content.trim().split(/\s+/);
        if (words.length > 0) {
          const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
          if (INSULT_CORRECTIONS[lastWord]) {
            const replaced = INSULT_CORRECTIONS[lastWord];
            const lastIndex = content.lastIndexOf(words[words.length - 1]);
            if (lastIndex !== -1) {
              const updated =
                content.substring(0, lastIndex) +
                replaced +
                content.substring(lastIndex + words[words.length - 1].length);
              setContent(updated);
            }
          }
        }
      }
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    const count = e.target.value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  };

  const handleSaveConfirm = () => {
    soundEngine.playDing();
    let cleanName = saveFileName.trim() || 'notes.txt';
    if (!cleanName.includes('.')) {
      cleanName += saveFileType === 'trash' ? '.trash' : '.txt';
    }

    const newFile = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      type: 'file',
      size: `${Math.max(1, Math.round(content.length / 1024))} KB`,
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      content: content,
    };

    virtualFs.addFile(saveFolderId, newFile);
    setShowSaveDialog(false);
  };

  const handleSaveToTrash = () => {
    soundEngine.playError();
    setSaveStatus('saved-to-trash');
    setTimeout(() => {
      setShowSaveDialog(false);
      setSaveStatus('');
    }, 2800);
  };

  return (
    <div className="notepad-shell" id="app-notepad" onClick={() => setActiveMenu(null)}>
      {/* Retro Win95 Menu Bar */}
      <div className="notepad-menubar">
        <div className="notepad-menu-item-wrap">
          <button
            className={`notepad-menu-btn ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
          >
            <u>F</u>ile
          </button>
          {activeMenu === 'file' && (
            <div className="notepad-dropdown win95-dropdown">
              <div
                className="notepad-dropdown-item"
                onClick={() => {
                  setContent('');
                  setActiveMenu(null);
                }}
              >
                New
              </div>
              <div
                className="notepad-dropdown-item"
                onClick={() => {
                  soundEngine.playDing();
                  setShowSaveDialog(true);
                  setActiveMenu(null);
                }}
              >
                Save... <span className="notepad-shortcut">Ctrl+S</span>
              </div>
              <div className="notepad-dropdown-divider" />
              <div
                className="notepad-dropdown-item"
                onClick={() => {
                  setActiveMenu(null);
                  if (onClose) onClose();
                }}
              >
                Exit
              </div>
            </div>
          )}
        </div>

        <div className="notepad-menu-item-wrap">
          <button
            className={`notepad-menu-btn ${activeMenu === 'edit' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'edit' ? null : 'edit');
            }}
          >
            <u>E</u>dit
          </button>
          {activeMenu === 'edit' && (
            <div className="notepad-dropdown win95-dropdown">
              <div
                className="notepad-dropdown-item"
                onClick={() => {
                  soundEngine.playExclamation();
                  alert('Undo is currently uncooperative.');
                  setActiveMenu(null);
                }}
              >
                Undo <span className="notepad-shortcut">Ctrl+Z</span>
              </div>
              <div className="notepad-dropdown-divider" />
              <div
                className="notepad-dropdown-item"
                onClick={() => {
                  if (textareaRef.current) textareaRef.current.select();
                  setActiveMenu(null);
                }}
              >
                Select All
              </div>
            </div>
          )}
        </div>

        <div className="notepad-menu-item-wrap">
          <button
            className={`notepad-menu-btn ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
          >
            <u>H</u>elp
          </button>
          {activeMenu === 'help' && (
            <div className="notepad-dropdown win95-dropdown">
              <div
                className="notepad-dropdown-item"
                onClick={() => {
                  alert(
                    'Notepad 98 (AI Proofreading Edition)\nFeature: Backspace adds character depth.\nFeature: Save places files directly in Recycle Bin.'
                  );
                  setActiveMenu(null);
                }}
              >
                About Notepad 98...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="notepad-content-sunken">
        <textarea
          ref={textareaRef}
          className="notepad-textarea"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoFocus
        />
      </div>

      {/* Retro Status Bar */}
      <div className="notepad-statusbar">
        <div className="notepad-status-col sunken">
          {isChaosMode ? '⚠️ AI Auto-Correct: HOSTILE' : '🛡️ Safe Mode: Normal Editor'}
        </div>
        <div className="notepad-status-col sunken">Words: {wordCount}</div>
        <div className="notepad-status-col sunken">Windows (CRLF)</div>
        <div className="notepad-status-col sunken">UTF-RAGE-8</div>
      </div>

      {/* Save As Dialog */}
      {showSaveDialog && (
        <div className="os-dialog-backdrop" onClick={() => setShowSaveDialog(false)}>
          <div className="os-dialog-box notepad-save-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">Save As</span>
              <button
                className="dialog-close-btn"
                onClick={() => setShowSaveDialog(false)}
              >
                ✕
              </button>
            </div>
            <div className="paint-save-body">
              {/* Save in folder */}
              <div className="paint-save-row">
                <label>Save <u>i</u>n:</label>
                <select
                  className="win95-select"
                  value={saveFolderId}
                  onChange={(e) => setSaveFolderId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {virtualFs.getFolderList().map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      📁 {folder.name} ({folder.path})
                    </option>
                  ))}
                </select>
              </div>

              {/* Folder file preview list */}
              <div className="paint-save-folder-preview">
                {(virtualFs.getFolder(saveFolderId)?.items || []).map((it) => (
                  <div
                    key={it.id}
                    className={`paint-folder-item ${saveFileName === it.name ? 'selected' : ''}`}
                    onClick={() => setSaveFileName(it.name)}
                    title={it.name}
                  >
                    <span>{it.type === 'folder' ? '📁' : it.type === 'image' ? '🖼️' : it.type === 'video' ? '🎬' : it.type === 'audio' ? '🎵' : '📄'}</span>
                    <span style={{ fontWeight: it.type === 'folder' ? 'bold' : 'normal' }}>{it.name}</span>
                    <span style={{ marginLeft: 'auto', color: '#666', fontSize: '10px' }}>{it.size}</span>
                  </div>
                ))}
                {(virtualFs.getFolder(saveFolderId)?.items || []).length === 0 && (
                  <div style={{ color: '#888', fontStyle: 'italic', padding: '12px', textAlign: 'center' }}>
                    (Folder is empty)
                  </div>
                )}
              </div>

              {/* File name */}
              <div className="paint-save-row">
                <label>File <u>n</u>ame:</label>
                <input
                  type="text"
                  className="win95-input"
                  value={saveFileName}
                  onChange={(e) => setSaveFileName(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>

              {/* Save as type */}
              <div className="paint-save-row">
                <label>Save as <u>t</u>ype:</label>
                <select
                  className="win95-select"
                  value={saveFileType}
                  onChange={(e) => setSaveFileType(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="txt">Text Documents (*.txt)</option>
                  <option value="trash">Recycle Bin Dump (*.trash)</option>
                  <option value="all">All Files (*.*)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="paint-save-actions">
                <button
                  className="win95-btn btn-default"
                  onClick={handleSaveConfirm}
                  style={{ minWidth: '75px' }}
                >
                  Save
                </button>
                <button
                  className="win95-btn"
                  onClick={() => setShowSaveDialog(false)}
                  style={{ minWidth: '75px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
