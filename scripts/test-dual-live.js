import { WebSocket } from 'ws';

const wsA = new WebSocket('ws://localhost:8000');
const wsB = new WebSocket('ws://localhost:8000');

await Promise.all([
  new Promise((r) => wsA.on('open', r)),
  new Promise((r) => wsB.on('open', r)),
]);

console.log('Both WebSockets connected to ws://localhost:8000');

// A joins ROOM99 as ADHIL95
wsA.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: 'ROOM99', ragewareId: 'ADHIL95' }));

// B joins ROOM99 as ALEX95
wsB.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: 'ROOM99', ragewareId: 'ALEX95' }));

await new Promise((r) => setTimeout(r, 500));

// Set up listeners
const bReceivedPromise = new Promise((resolve) => {
  wsB.on('message', (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.type === 'NEW_MESSAGE') {
      console.log('ALEX95 received real-time mail from ADHIL95:', data.message);
      resolve(data.message);
    }
  });
});

const aReceivedPromise = new Promise((resolve) => {
  wsA.on('message', (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.type === 'NEW_MESSAGE') {
      console.log('ADHIL95 received real-time reply from ALEX95:', data.message);
      resolve(data.message);
    }
  });
});

// ADHIL95 sends message to ALEX95
console.log('ADHIL95 sending mail to ALEX95@RAGEWARE...');
wsA.send(JSON.stringify({
  type: 'SEND_MESSAGE',
  to: 'ALEX95@RAGEWARE',
  subject: 'Lab Meeting',
  body: 'Are you coming to the lab?'
}));

const msgB = await bReceivedPromise;

// ALEX95 replies to ADHIL95
console.log('ALEX95 sending reply to ADHIL95@RAGEWARE...');
wsB.send(JSON.stringify({
  type: 'SEND_MESSAGE',
  to: 'ADHIL95@RAGEWARE',
  subject: 'Re: Lab Meeting',
  body: "Yes, I'll be there."
}));

const msgA = await aReceivedPromise;

console.log('--- TWO-CLIENT INTERACTION TEST COMPLETE: 100% SUCCESS ---');
wsA.close();
wsB.close();
process.exit(0);
