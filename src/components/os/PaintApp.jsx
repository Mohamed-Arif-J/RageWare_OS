import React, { useRef, useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../../engine/soundEngine';
import { virtualFs } from '../../services/virtualFs';

// Authentic 28-color Windows 95 palette
const PALETTE_COLORS = [
  // Row 1
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080FF', '#004080', '#8000FF', '#804000',
  // Row 2
  '#FFFFFF', '#C0C0C0', '#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF',
  '#FFFF80', '#00FF80', '#80FFFF', '#8080FF', '#FF0080', '#FF8040',
];

const ART_CRITIQUES = [
  'Critique: The line quality suggests profound internal anguish. Estimated value: -$4.50.',
  'Critique: Derivative of late-90s dial-up anxiety. Suitable for C:\\Recycle Bin.',
  'Critique: Our neural network classifies this drawing as "A desperate attempt to avoid real work".',
  'Critique: The algorithm detected 3 attempts to draw something coherent and failed.',
  'Critique: Masterpiece detected. Downgrading resolution to prevent copyright strikes.',
  'Critique: Suitable for placement directly into the Louvre\'s basement incinerator.',
  'Critique: The brush stroke suggests deep resistance to productivity. We admire the commitment.',
  'Critique: A bold exploration of what happens when hand-eye coordination surrenders.',
  'Critique: 0/10 technical skill, 10/10 pure unadulterated chaotic energy.',
  'Critique: Impressionist? No, more like depressionist.',
  'Critique: Modern art is dead and this drawing performed the autopsy.',
  'Critique: Clippy evaluated this artwork and decided to retire.',
];

const TOOL_HELP = {
  'select-free': 'Selects a free-form part of the picture to move, copy, or edit.',
  'select-rect': 'Selects a rectangular part of the picture to move, copy, or edit.',
  'eraser': 'Erases a portion of the picture using the selected eraser shape.',
  'bucket': 'Fills an area with the current drawing color.',
  'picker': 'Picks up a color from the picture for drawing.',
  'magnifier': 'Changes the magnification.',
  'pencil': 'Draws a free-form line one pixel wide.',
  'brush': 'Draws using a brush with the selected shape and size.',
  'airbrush': 'Draws using an airbrush of the selected spray size.',
  'text': 'Inserts text into the picture.',
  'line': 'Draws a straight line with the selected line width.',
  'curve': 'Draws a curved line with the selected line width.',
  'rect': 'Draws a rectangle with the selected fill style.',
  'polygon': 'Draws a polygon with the selected fill style.',
  'ellipse': 'Draws an ellipse or circle with the selected fill style.',
  'round-rect': 'Draws a rounded rectangle with the selected fill style.',
};

export default function PaintApp({ isChaosMode = true, onClose, onRageUpdate }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  // Tools & Colors
  const [currentTool, setCurrentTool] = useState('pencil');
  const [color1, setColor1] = useState('#000000'); // Foreground
  const [color2, setColor2] = useState('#FFFFFF'); // Background
  const [brushSize, setBrushSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(14);
  const [sprayRadius, setSprayRadius] = useState(14);
  const [lineWidth, setLineWidth] = useState(2);
  const [shapeMode, setShapeMode] = useState('outline'); // 'outline' | 'outline-fill' | 'fill'
  const [zoomLevel, setZoomLevel] = useState(1);

  // Menus & UI Modals
  const [activeMenu, setActiveMenu] = useState(null);
  const [critique, setCritique] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveProgress, setSaveProgress] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveFileName, setSaveFileName] = useState('Masterpiece.bmp');
  const [saveFileType, setSaveFileType] = useState('bmp');
  const [saveFolderId, setSaveFolderId] = useState('pictures');
  const [aboutOpen, setAboutOpen] = useState(false);

  // Status readout
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [canvasDimensions] = useState({ width: 560, height: 340 });
  const [statusText, setStatusText] = useState('For Help, click Help Topics on the Help Menu.');

  // Drawing state
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const strokeCounterRef = useRef(0);
  const sprayIntervalRef = useRef(null);

  // Undo / Redo history
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // Push current canvas state to history stack
  const saveStateToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Truncate any future redo states
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(imgData);
    if (newHistory.length > 25) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, []);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveStateToHistory();
  }, [saveStateToHistory]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      soundEngine.playClick();
      historyIndexRef.current -= 1;
      const state = historyRef.current[historyIndexRef.current];
      const ctx = canvasRef.current.getContext('2d');
      ctx.putImageData(state, 0, 0);
      setStatusText('Restored previous canvas state.');
    } else {
      soundEngine.playExclamation();
      setStatusText('Cannot undo further.');
    }
  }, []);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      soundEngine.playClick();
      historyIndexRef.current += 1;
      const state = historyRef.current[historyIndexRef.current];
      const ctx = canvasRef.current.getContext('2d');
      ctx.putImageData(state, 0, 0);
      setStatusText('Redid canvas action.');
    } else {
      soundEngine.playExclamation();
      setStatusText('Cannot redo further.');
    }
  }, []);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          setSaveModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    return {
      x: Math.max(0, Math.min(canvas.width, x)),
      y: Math.max(0, Math.min(canvas.height, y)),
    };
  };

  // 4-Way BFS Flood Fill with Chaos Surface Tension Breach
  const performFloodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // In Chaos Mode: 35% chance to trigger the "Surface Tension Breach" leaky bucket!
    if (isChaosMode && Math.random() < 0.35) {
      soundEngine.playBoing();
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, width, height);
      setCritique('⚠️ Surface Tension Breach: 1-pixel micro-gap detected in line geometry. Paint flooded entire canvas! (Press Ctrl+Z to undo)');
      setStatusText('Surface tension failure. 100% canvas coverage.');
      saveStateToHistory();
      if (onRageUpdate) onRageUpdate();
      return;
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Convert hex fillColor to RGB
    const tempDiv = document.createElement('div');
    tempDiv.style.color = fillColor;
    document.body.appendChild(tempDiv);
    const rgbStr = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    const match = rgbStr.match(/\d+/g);
    const [fr, fg, fb] = match ? match.map(Number) : [0, 0, 0];

    const targetIdx = (startY * width + startX) * 4;
    const tr = data[targetIdx];
    const tg = data[targetIdx + 1];
    const tb = data[targetIdx + 2];
    const ta = data[targetIdx + 3];

    // Same color check
    if (tr === fr && tg === fg && tb === fb && ta === 255) return;

    const colorMatch = (idx) => {
      return (
        Math.abs(data[idx] - tr) <= 22 &&
        Math.abs(data[idx + 1] - tg) <= 22 &&
        Math.abs(data[idx + 2] - tb) <= 22 &&
        Math.abs(data[idx + 3] - ta) <= 22
      );
    };

    const queue = [startX, startY];
    const visited = new Uint8Array(width * height);
    visited[startY * width + startX] = 1;

    while (queue.length > 0) {
      const y = queue.pop();
      const x = queue.pop();
      const idx = (y * width + x) * 4;

      data[idx] = fr;
      data[idx + 1] = fg;
      data[idx + 2] = fb;
      data[idx + 3] = 255;

      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nPos = ny * width + nx;
          if (!visited[nPos]) {
            visited[nPos] = 1;
            if (colorMatch(nPos * 4)) {
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    saveStateToHistory();
    soundEngine.playClick();
  };

  // Eyedropper Color Pick
  const pickColorFromCanvas = (x, y, isRightClick = false) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
    soundEngine.playDing();
    if (isRightClick) {
      setColor2(hex);
      setStatusText(`Picked Background Color (Color 2): ${hex}`);
    } else {
      setColor1(hex);
      setStatusText(`Picked Foreground Color (Color 1): ${hex}`);
    }
  };

  // Text Tool Prompt
  const handleTextTool = (x, y) => {
    const text = prompt('Enter text to stamp on canvas:');
    if (!text) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.font = 'bold 16px "MS Sans Serif", Tahoma, sans-serif';
    ctx.fillStyle = color1;
    ctx.fillText(text, x, y);
    saveStateToHistory();
    soundEngine.playDing();
  };

  // Mouse Down / Start Action
  const handleMouseDown = (e) => {
    if (e.button === 2) return; // handled by contextMenu
    const { x, y } = getCanvasCoords(e);
    isDrawingRef.current = true;
    startPosRef.current = { x, y };

    if (currentTool === 'picker') {
      pickColorFromCanvas(x, y, false);
      return;
    }

    if (currentTool === 'bucket') {
      performFloodFill(x, y, color1);
      return;
    }

    if (currentTool === 'text') {
      handleTextTool(x, y);
      return;
    }

    if (currentTool === 'airbrush') {
      sprayAt(x, y);
      sprayIntervalRef.current = setInterval(() => {
        if (isDrawingRef.current) {
          sprayAt(cursorPos.x, cursorPos.y);
        }
      }, 40);
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Initial dot for pencil, brush, eraser
    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      handleContinuousDraw(x, y);
    }
  };

  // Airbrush Spray Dot Dispersion
  const sprayAt = (cx, cy) => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = color1;
    const density = sprayRadius * 2;
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * sprayRadius;
      const sx = Math.round(cx + Math.cos(angle) * radius);
      const sy = Math.round(cy + Math.sin(angle) * radius);
      ctx.fillRect(sx, sy, 1, 1);
    }
  };

  // Continuous Drawing (Pencil, Brush, Eraser)
  const handleContinuousDraw = (x, y) => {
    const ctx = canvasRef.current.getContext('2d');
    strokeCounterRef.current += 1;

    let targetX = x;
    let targetY = y;
    let strokeColor = currentTool === 'eraser' ? color2 : color1;

    // Chaos Mode Ragebaits:
    if (isChaosMode) {
      // 1. Rogue Color Calibration Shift
      if (currentTool !== 'eraser' && strokeCounterRef.current % 42 === 0) {
        const weirdColors = ['#FF007F', '#39FF14', '#FF4500', '#7F00FF', '#00FFFF'];
        const rogue = weirdColors[Math.floor(Math.random() * weirdColors.length)];
        setColor1(rogue);
        strokeColor = rogue;
        soundEngine.playDing();
        setStatusText('⚠️ RGB Calibration Notice: Primary toner recalibrated.');
      }

      // 2. The Sneeze / Twitch Micro-Jitter
      if (strokeCounterRef.current % 55 === 0) {
        targetX += (Math.random() > 0.5 ? 1 : -1) * 12;
        targetY += (Math.random() > 0.5 ? 1 : -1) * 10;
        setStatusText('Optical sensor drift detected (+9px compensated).');
      }

      // 3. Vintage Eraser Graphite Smudge
      if (currentTool === 'eraser' && Math.random() < 0.22) {
        strokeColor = '#A0A0A0';
        setStatusText('Notice: Vintage eraser contains 14% graphite residue.');
      }
    }

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;

    if (currentTool === 'pencil') {
      ctx.lineWidth = 1;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    } else if (currentTool === 'brush') {
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      // Square eraser block
      const half = Math.round(eraserSize / 2);
      ctx.fillRect(targetX - half, targetY - half, eraserSize, eraserSize);
    }
  };

  // Rubber-band Overlay Preview (Shapes, Lines)
  const drawOverlayPreview = (currentX, currentY) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;
    const width = currentX - startX;
    const height = currentY - startY;

    ctx.strokeStyle = color1;
    ctx.fillStyle = color2;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([]);

    if (currentTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
    } else if (currentTool === 'rect') {
      if (shapeMode === 'outline') {
        ctx.strokeRect(startX, startY, width, height);
      } else if (shapeMode === 'outline-fill') {
        ctx.fillRect(startX, startY, width, height);
        ctx.strokeRect(startX, startY, width, height);
      } else {
        ctx.fillStyle = color2;
        ctx.fillRect(startX, startY, width, height);
      }
    } else if (currentTool === 'ellipse') {
      ctx.beginPath();
      const rx = Math.abs(width / 2);
      const ry = Math.abs(height / 2);
      const cx = startX + width / 2;
      const cy = startY + height / 2;
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      if (shapeMode === 'outline') {
        ctx.stroke();
      } else if (shapeMode === 'outline-fill') {
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = color2;
        ctx.fill();
      }
    } else if (currentTool === 'round-rect') {
      drawRoundedRect(ctx, startX, startY, width, height, 10, shapeMode);
    } else if (currentTool === 'select-rect') {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#000080';
      ctx.strokeRect(startX, startY, width, height);
    }
  };

  const drawRoundedRect = (ctx, x, y, w, h, r, mode) => {
    const rx = Math.min(r, Math.abs(w) / 2);
    const ry = Math.min(r, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [rx, ry]);
    if (mode === 'outline') {
      ctx.stroke();
    } else if (mode === 'outline-fill') {
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = color2;
      ctx.fill();
    }
  };

  // Mouse Move
  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoords(e);
    setCursorPos({ x, y });

    if (!isDrawingRef.current) return;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
      handleContinuousDraw(x, y);
    } else if (
      currentTool === 'line' ||
      currentTool === 'rect' ||
      currentTool === 'ellipse' ||
      currentTool === 'round-rect' ||
      currentTool === 'select-rect'
    ) {
      drawOverlayPreview(x, y);
    }
  };

  // Mouse Up / Commit Shape
  const handleMouseUp = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (sprayIntervalRef.current) {
      clearInterval(sprayIntervalRef.current);
      sprayIntervalRef.current = null;
    }

    const { x, y } = getCanvasCoords(e);
    const overlay = overlayRef.current;
    if (overlay) {
      const oCtx = overlay.getContext('2d');
      oCtx.clearRect(0, 0, overlay.width, overlay.height);
    }

    const startX = startPosRef.current.x;
    const startY = startPosRef.current.y;
    let endX = x;
    let endY = y;

    // Chaos Mode: Lopsided Shape Distortion
    if (isChaosMode && (currentTool === 'rect' || currentTool === 'ellipse' || currentTool === 'round-rect')) {
      if (Math.random() < 0.28) {
        endX += 6;
        endY -= 4;
        setStatusText('Geometry optimization: +2.5° artistic slant applied.');
      }
    }

    const ctx = canvasRef.current.getContext('2d');
    const width = endX - startX;
    const height = endY - startY;

    if (currentTool === 'line') {
      ctx.strokeStyle = color1;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (currentTool === 'rect') {
      ctx.strokeStyle = color1;
      ctx.fillStyle = color2;
      ctx.lineWidth = lineWidth;
      if (shapeMode === 'outline') {
        ctx.strokeRect(startX, startY, width, height);
      } else if (shapeMode === 'outline-fill') {
        ctx.fillRect(startX, startY, width, height);
        ctx.strokeRect(startX, startY, width, height);
      } else {
        ctx.fillStyle = color2;
        ctx.fillRect(startX, startY, width, height);
      }
    } else if (currentTool === 'ellipse') {
      ctx.strokeStyle = color1;
      ctx.fillStyle = color2;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      const rx = Math.abs(width / 2);
      const ry = Math.abs(height / 2);
      const cx = startX + width / 2;
      const cy = startY + height / 2;
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      if (shapeMode === 'outline') {
        ctx.stroke();
      } else if (shapeMode === 'outline-fill') {
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = color2;
        ctx.fill();
      }
    } else if (currentTool === 'round-rect') {
      ctx.strokeStyle = color1;
      ctx.fillStyle = color2;
      ctx.lineWidth = lineWidth;
      drawRoundedRect(ctx, startX, startY, width, height, 10, shapeMode);
    }

    saveStateToHistory();
  };

  // Image manipulation: Clear, Invert, Flip
  const clearCanvas = () => {
    soundEngine.playBoing();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveStateToHistory();
    setCritique('Canvas wiped clean.');
    setStatusText('New picture created.');
  };

  const invertColors = () => {
    soundEngine.playChord();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
    saveStateToHistory();
    setStatusText('Colors inverted.');
  };

  const flipHorizontal = () => {
    soundEngine.playClick();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(canvas, 0, 0);

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
    saveStateToHistory();
    setStatusText('Flipped horizontally.');
  };

  // AI Art Critic
  const handleArtCritic = () => {
    soundEngine.playExclamation();
    const review = ART_CRITIQUES[Math.floor(Math.random() * ART_CRITIQUES.length)];
    setCritique(review);
    setStatusText('AI Art appraisal complete.');
  };

  // Save Modal Action - Saves into RageWare OS Virtual File System (never downloads to host laptop)
  const handleSaveConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundEngine.playDing();
    const dataUrl = canvas.toDataURL('image/png');
    let cleanName = saveFileName.trim() || 'Masterpiece.bmp';
    if (!cleanName.includes('.')) {
      cleanName += saveFileType === 'cry' ? '.cry' : saveFileType === 'png' ? '.png' : '.bmp';
    }

    const newFile = {
      id: `paint_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      type: 'image',
      size: `${Math.round((canvas.width * canvas.height * 3) / 1024)} KB`,
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      url: dataUrl,
      caption: `Paint 95 Drawing: ${cleanName}`,
      dimensions: `${canvas.width} x ${canvas.height}`,
    };

    virtualFs.addFile(saveFolderId, newFile);
    setSaveModalOpen(false);
    const folderObj = virtualFs.getFolder(saveFolderId);
    setStatusText(`Saved to ${folderObj?.name || 'folder'} (${cleanName})`);
  };

  return (
    <div className="win95-paint-shell" id="app-paint" onClick={() => setActiveMenu(null)}>
      {/* Authentic Windows 95 Menu Bar */}
      <div className="paint-menubar">
        {/* File Menu */}
        <div className="paint-menu-wrap">
          <button
            className={`paint-menu-btn ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
          >
            <u>F</u>ile
          </button>
          {activeMenu === 'file' && (
            <div className="paint-dropdown win95-dropdown">
              <div className="paint-dropdown-item" onClick={clearCanvas}>
                New <span className="paint-shortcut">Ctrl+N</span>
              </div>
              <div
                className="paint-dropdown-item"
                onClick={() => {
                  setSaveModalOpen(true);
                  setActiveMenu(null);
                }}
              >
                Save <span className="paint-shortcut">Ctrl+S</span>
              </div>
              <div
                className="paint-dropdown-item"
                onClick={() => {
                  setSaveModalOpen(true);
                  setActiveMenu(null);
                }}
              >
                Save As...
              </div>
              <div className="paint-dropdown-divider" />
              <div
                className="paint-dropdown-item"
                onClick={() => {
                  soundEngine.playError();
                  alert('Printer spooler offline. Laser cartridge missing cyan toner.');
                  setActiveMenu(null);
                }}
              >
                Print...
              </div>
              <div className="paint-dropdown-divider" />
              <div
                className="paint-dropdown-item"
                onClick={() => {
                  if (onClose) onClose();
                }}
              >
                Exit
              </div>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="paint-menu-wrap">
          <button
            className={`paint-menu-btn ${activeMenu === 'edit' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'edit' ? null : 'edit');
            }}
          >
            <u>E</u>dit
          </button>
          {activeMenu === 'edit' && (
            <div className="paint-dropdown win95-dropdown">
              <div className="paint-dropdown-item" onClick={handleUndo}>
                Undo <span className="paint-shortcut">Ctrl+Z</span>
              </div>
              <div className="paint-dropdown-item" onClick={handleRedo}>
                Redo <span className="paint-shortcut">Ctrl+Y</span>
              </div>
              <div className="paint-dropdown-divider" />
              <div className="paint-dropdown-item" onClick={clearCanvas}>
                Clear Selection
              </div>
            </div>
          )}
        </div>

        {/* Image Menu */}
        <div className="paint-menu-wrap">
          <button
            className={`paint-menu-btn ${activeMenu === 'image' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'image' ? null : 'image');
            }}
          >
            <u>I</u>mage
          </button>
          {activeMenu === 'image' && (
            <div className="paint-dropdown win95-dropdown">
              <div className="paint-dropdown-item" onClick={flipHorizontal}>
                Flip Horizontal
              </div>
              <div className="paint-dropdown-item" onClick={invertColors}>
                Invert Colors <span className="paint-shortcut">Ctrl+I</span>
              </div>
              <div className="paint-dropdown-item" onClick={clearCanvas}>
                Clear Image <span className="paint-shortcut">Ctrl+Shift+N</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="paint-menu-wrap">
          <button
            className={`paint-menu-btn ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
          >
            <u>H</u>elp
          </button>
          {activeMenu === 'help' && (
            <div className="paint-dropdown win95-dropdown">
              <div
                className="paint-dropdown-item"
                onClick={() => {
                  handleArtCritic();
                  setActiveMenu(null);
                }}
              >
                AI Art Critic Evaluation
              </div>
              <div className="paint-dropdown-divider" />
              <div
                className="paint-dropdown-item"
                onClick={() => {
                  setAboutOpen(true);
                  setActiveMenu(null);
                }}
              >
                About Paint 95...
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />
        <button
          className="win95-btn btn-sm paint-critic-top-btn"
          onClick={handleArtCritic}
          title="Get AI feedback on your art"
        >
          🎨 AI Art Critic
        </button>
      </div>

      {/* AI Art Critic Toast Banner */}
      {critique && (
        <div className="paint-critique-banner">
          <div className="paint-critique-text">{critique}</div>
          <button className="win95-btn btn-sm" onClick={() => setCritique('')}>
            ✕
          </button>
        </div>
      )}

      {/* Workspace Area: Left Toolbox + Center Canvas */}
      <div className="paint-workspace">
        {/* Left Toolbar (2 Columns of 8 Classic Win95 Tools) */}
        <div className="paint-toolbox-column">
          <div className="paint-toolbox-grid">
            {/* 1. Free-form select */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'select-free' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('select-free'); }}
              title="Free-Form Select"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M4 2C2 4 1 8 3 11C5 14 9 15 13 13C15 11 15 6 12 4C9 2 6 1 4 2Z" fill="none" stroke="#000" strokeDasharray="2,2" />
              </svg>
            </button>

            {/* 2. Select */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'select-rect' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('select-rect'); }}
              title="Select"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="2" width="12" height="12" fill="none" stroke="#000" strokeDasharray="2,2" />
              </svg>
            </button>

            {/* 3. Eraser */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'eraser' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('eraser'); }}
              title="Eraser/Color Eraser"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="4,13 1,10 8,3 13,8 7,14" fill="#FFAACC" stroke="#000" />
                <polygon points="7,14 13,8 15,10 9,16" fill="#DDD" stroke="#000" />
              </svg>
            </button>

            {/* 4. Fill With Color (Bucket) */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'bucket' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('bucket'); }}
              title="Fill With Color"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="2,8 7,3 12,8 9,13 4,13" fill="#000080" stroke="#000" />
                <path d="M12 9C12 9 14 11 14 13C14 14.5 13 15 12 15C11 15 10 14.5 10 13C10 11 12 9 12 9Z" fill="#0080FF" />
              </svg>
            </button>

            {/* 5. Pick Color (Eyedropper) */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'picker' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('picker'); }}
              title="Pick Color"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <line x1="2" y1="14" x2="11" y2="5" stroke="#000" strokeWidth="2" />
                <polygon points="11,5 14,2 15,3 12,6" fill="#888" stroke="#000" />
                <polygon points="1,15 2,13 4,14" fill="#000" />
              </svg>
            </button>

            {/* 6. Magnifier */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'magnifier' ? 'sunken active' : ''}`}
              onClick={() => {
                soundEngine.playClick();
                setCurrentTool('magnifier');
                setZoomLevel((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1));
              }}
              title="Magnifier"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="6" cy="6" r="4.5" fill="none" stroke="#000" strokeWidth="1.5" />
                <line x1="9.5" y1="9.5" x2="14" y2="14" stroke="#000" strokeWidth="2.5" />
              </svg>
            </button>

            {/* 7. Pencil */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'pencil' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('pencil'); }}
              title="Pencil"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="11,2 14,5 5,14 2,14 2,11" fill="#FFCC00" stroke="#000" />
                <polygon points="2,14 4,14 2,12" fill="#000" />
              </svg>
            </button>

            {/* 8. Brush */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'brush' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('brush'); }}
              title="Brush"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="10,2 14,6 9,11 6,8" fill="#804000" stroke="#000" />
                <path d="M6 8L2 14C2 14 5 15 7 11Z" fill="#000080" />
              </svg>
            </button>

            {/* 9. Airbrush (Spray Can) */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'airbrush' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('airbrush'); }}
              title="Airbrush"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="5" y="6" width="7" height="9" fill="#C0C0C0" stroke="#000" />
                <rect x="7" y="3" width="3" height="3" fill="#FF0000" stroke="#000" />
                <circle cx="3" cy="2" r="0.8" fill="#000" />
                <circle cx="2" cy="4" r="0.8" fill="#000" />
                <circle cx="4" cy="5" r="0.8" fill="#000" />
              </svg>
            </button>

            {/* 10. Text */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'text' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('text'); }}
              title="Text"
            >
              <span style={{ fontWeight: 'bold', fontSize: '13px', fontFamily: 'serif' }}>A</span>
            </button>

            {/* 11. Line */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'line' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('line'); }}
              title="Line"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <line x1="2" y1="14" x2="14" y2="2" stroke="#000" strokeWidth="2" />
              </svg>
            </button>

            {/* 12. Curve */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'curve' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('curve'); }}
              title="Curve"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d="M2 13C6 13 4 3 14 3" fill="none" stroke="#000" strokeWidth="1.5" />
              </svg>
            </button>

            {/* 13. Rectangle */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'rect' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('rect'); }}
              title="Rectangle"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="3" width="12" height="10" fill="none" stroke="#000" strokeWidth="1.5" />
              </svg>
            </button>

            {/* 14. Polygon */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'polygon' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('rect'); }}
              title="Polygon"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <polygon points="8,2 14,7 12,14 4,14 2,7" fill="none" stroke="#000" strokeWidth="1.5" />
              </svg>
            </button>

            {/* 15. Ellipse */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'ellipse' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('ellipse'); }}
              title="Ellipse"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <ellipse cx="8" cy="8" rx="6" ry="5" fill="none" stroke="#000" strokeWidth="1.5" />
              </svg>
            </button>

            {/* 16. Rounded Rectangle */}
            <button
              className={`paint-tool-icon-btn ${currentTool === 'round-rect' ? 'sunken active' : ''}`}
              onClick={() => { soundEngine.playClick(); setCurrentTool('round-rect'); }}
              title="Rounded Rectangle"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="2" y="3" width="12" height="10" rx="3" fill="none" stroke="#000" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {/* Sub-tool Options Box (Classic Win95 Dynamic Options) */}
          <div className="paint-tool-options-box sunken">
            {/* Brush Sizes */}
            {currentTool === 'brush' && (
              <div className="paint-options-brush">
                {[2, 4, 8, 14].map((sz) => (
                  <div
                    key={sz}
                    className={`paint-opt-dot-wrap ${brushSize === sz ? 'active' : ''}`}
                    onClick={() => setBrushSize(sz)}
                  >
                    <div className="paint-opt-dot" style={{ width: sz, height: sz }} />
                  </div>
                ))}
              </div>
            )}

            {/* Eraser Sizes */}
            {currentTool === 'eraser' && (
              <div className="paint-options-eraser">
                {[6, 12, 18, 24].map((sz) => (
                  <div
                    key={sz}
                    className={`paint-opt-square-wrap ${eraserSize === sz ? 'active' : ''}`}
                    onClick={() => setEraserSize(sz)}
                  >
                    <div className="paint-opt-square" style={{ width: sz / 1.5, height: sz / 1.5 }} />
                  </div>
                ))}
              </div>
            )}

            {/* Airbrush Radii */}
            {currentTool === 'airbrush' && (
              <div className="paint-options-spray">
                {[8, 14, 22].map((r) => (
                  <div
                    key={r}
                    className={`paint-opt-spray-wrap ${sprayRadius === r ? 'active' : ''}`}
                    onClick={() => setSprayRadius(r)}
                  >
                    <div className="paint-opt-spray-circle" style={{ width: r, height: r }} />
                  </div>
                ))}
              </div>
            )}

            {/* Line Widths */}
            {(currentTool === 'line' || currentTool === 'curve' || currentTool === 'pencil') && (
              <div className="paint-options-line">
                {[1, 2, 3, 5].map((w) => (
                  <div
                    key={w}
                    className={`paint-opt-line-wrap ${lineWidth === w ? 'active' : ''}`}
                    onClick={() => setLineWidth(w)}
                  >
                    <div className="paint-opt-line-bar" style={{ height: w }} />
                  </div>
                ))}
              </div>
            )}

            {/* Shape Fill Modes */}
            {(currentTool === 'rect' || currentTool === 'ellipse' || currentTool === 'round-rect') && (
              <div className="paint-options-shapes">
                <div
                  className={`paint-opt-shape-mode ${shapeMode === 'outline' ? 'active' : ''}`}
                  onClick={() => setShapeMode('outline')}
                  title="Outline Only"
                >
                  <div className="paint-opt-shape-box outline" />
                </div>
                <div
                  className={`paint-opt-shape-mode ${shapeMode === 'outline-fill' ? 'active' : ''}`}
                  onClick={() => setShapeMode('outline-fill')}
                  title="Outline and Fill"
                >
                  <div className="paint-opt-shape-box outline-fill" />
                </div>
                <div
                  className={`paint-opt-shape-mode ${shapeMode === 'fill' ? 'active' : ''}`}
                  onClick={() => setShapeMode('fill')}
                  title="Fill Only"
                >
                  <div className="paint-opt-shape-box fill-only" />
                </div>
              </div>
            )}

            {/* Magnifier Zoom */}
            {currentTool === 'magnifier' && (
              <div className="paint-options-zoom">
                {[1, 2, 4, 8].map((z) => (
                  <button
                    key={z}
                    className={`win95-btn btn-sm ${zoomLevel === z ? 'sunken' : ''}`}
                    onClick={() => setZoomLevel(z)}
                  >
                    {z}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Drawing Canvas Workspace */}
        <div className="paint-canvas-area sunken">
          <div
            className="paint-canvas-container"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
            }}
          >
            {/* Main Drawing Canvas */}
            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className="paint-main-canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onContextMenu={(e) => {
                e.preventDefault();
                const { x, y } = getCanvasCoords(e);
                pickColorFromCanvas(x, y, true);
              }}
            />

            {/* Overlay Canvas for Live Shape Rubber-Banding */}
            <canvas
              ref={overlayRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className="paint-overlay-canvas"
            />

            {/* Sizing Handles */}
            <div className="paint-resize-handle handle-right" />
            <div className="paint-resize-handle handle-bottom" />
            <div className="paint-resize-handle handle-corner" />
          </div>
        </div>
      </div>

      {/* Classic Dual Color Palette Bar (Bottom) */}
      <div className="paint-palette-dock">
        {/* Overlapping Foreground / Background Color Box */}
        <div className="paint-swatch-box sunken">
          <div
            className="paint-swatch-bg sunken"
            style={{ backgroundColor: color2 }}
            title="Color 2 (Background - Right Click)"
          />
          <div
            className="paint-swatch-fg sunken"
            style={{ backgroundColor: color1 }}
            title="Color 1 (Foreground - Left Click)"
          />
        </div>

        {/* 28 Swatches (2 Rows of 14) */}
        <div className="paint-swatch-grid">
          {PALETTE_COLORS.map((c, i) => (
            <div
              key={i}
              className="paint-color-swatch-chip sunken"
              style={{ backgroundColor: c }}
              onClick={() => {
                soundEngine.playClick();
                setColor1(c);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                soundEngine.playClick();
                setColor2(c);
              }}
              title={`Left-click: Color 1 | Right-click: Color 2 (${c})`}
            />
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="paint-statusbar">
        <div className="paint-status-col help-col sunken">
          {TOOL_HELP[currentTool] || statusText}
        </div>
        <div className="paint-status-col coord-col sunken">
          {cursorPos.x}, {cursorPos.y}px
        </div>
        <div className="paint-status-col size-col sunken">
          {canvasDimensions.width} x {canvasDimensions.height}px
        </div>
      </div>

      {/* Authentic Windows 95 Save Modal / Virtual FS Location Selector */}
      {saveModalOpen && (
        <div className="os-dialog-backdrop" onClick={() => setSaveModalOpen(false)}>
          <div className="os-dialog-box paint-save-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">Save As</span>
              <button
                className="dialog-close-btn"
                onClick={() => setSaveModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="paint-save-body">
              {/* Save In folder row */}
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

              {/* Folder contents preview list */}
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

              {/* File name input */}
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

              {/* Save as type select */}
              <div className="paint-save-row">
                <label>Save as <u>t</u>ype:</label>
                <select
                  className="win95-select"
                  value={saveFileType}
                  onChange={(e) => setSaveFileType(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="bmp">24-bit Bitmap (*.bmp)</option>
                  <option value="png">Portable Network Graphics (*.png)</option>
                  <option value="cry">Lossy Emotional Vector (*.cry)</option>
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
                  onClick={() => setSaveModalOpen(false)}
                  style={{ minWidth: '75px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Paint Dialog */}
      {aboutOpen && (
        <div className="os-dialog-backdrop" onClick={() => setAboutOpen(false)}>
          <div className="os-dialog-box paint-about-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div className="os-dialog-titlebar">
              <span className="os-dialog-title">About Paint 95</span>
              <button
                className="dialog-close-btn"
                onClick={() => setAboutOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="paint-save-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '32px' }}>🎨</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                    Microsoft Paint for RageWare 95
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '4px', color: '#555' }}>
                    Version 4.0.950 (Chaos Edition)
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '8px', lineHeight: '1.4' }}>
                    Featuring leaky buckets, vintage eraser smudges, and unsparing AI criticism.
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <button
                  className="win95-btn btn-default"
                  onClick={() => setAboutOpen(false)}
                  style={{ minWidth: '70px' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
