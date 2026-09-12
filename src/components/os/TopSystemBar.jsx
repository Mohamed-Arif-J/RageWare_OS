import React, { useState, useEffect } from 'react';

export default function TopSystemBar({ rageLevel = 0, rageStatus = 'CALM' }) {
  const [timeStr, setTimeStr] = useState('');
  const [cpuVal, setCpuVal] = useState(18);
  const [memVal, setMemVal] = useState(42);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}:${secs}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Subtle natural CPU/MEM fluctuation
    const perfTimer = setInterval(() => {
      setCpuVal(Math.floor(15 + Math.random() * 9));
      setMemVal(Math.floor(41 + Math.random() * 3));
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(perfTimer);
    };
  }, []);

  return (
    <header className="top-system-bar" id="top-system-bar">
      <div className="top-bar-left">
        <span className="os-kernel-label mono">RAGEWARE OS // v0.9.4-PROD</span>
        <span className="system-online-badge">
          <span className="beacon-pulse" />
          SYSTEM ONLINE
        </span>
      </div>

      <div className="top-bar-right mono">
        <div className="telemetry-item">
          <span className="telemetry-label">CPU:</span>
          <span className="telemetry-val cyan">{cpuVal}%</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">MEM:</span>
          <span className="telemetry-val cyan">{memVal}%</span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-label">RAGE:</span>
          <span className={`telemetry-val ${rageLevel > 50 ? 'danger' : 'amber'}`}>
            {rageLevel}% [{rageStatus}]
          </span>
        </div>
        <div className="telemetry-item clock-item">
          <span className="telemetry-val">{timeStr}</span>
        </div>
      </div>
    </header>
  );
}
