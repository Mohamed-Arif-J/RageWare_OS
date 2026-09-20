import { WebSocket } from 'ws';
import { spawn } from 'child_process';

console.log('--- Starting RAGEWARE Mail Real-Time Test Suite ---');

// 1. Launch server
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: '8088' },
  stdio: 'inherit'
});

await new Promise((r) => setTimeout(r, 1200));

const WS_URL = 'ws://localhost:8088';

function createClient(name) {
  const ws = new WebSocket(WS_URL);
  const queue = [];
  const listeners = [];

  ws.on('message', (raw) => {
    const data = JSON.parse(raw.toString());
    if (listeners.length > 0) {
      const fn = listeners.shift();
      fn(data);
    } else {
      queue.push(data);
    }
  });

  return {
    ws,
    name,
    send(obj) {
      ws.send(JSON.stringify(obj));
    },
    waitForMessage() {
      if (queue.length > 0) {
        return Promise.resolve(queue.shift());
      }
      return new Promise((resolve) => {
        listeners.push(resolve);
      });
    },
    close() {
      ws.close();
    }
  };
}

try {
  console.log('Connecting Client A (ADHIL95)...');
  const clientA = createClient('ADHIL95');
  await new Promise((r) => clientA.ws.on('open', r));

  console.log('Client A joining room TEST1 as ADHIL95...');
  clientA.send({ type: 'JOIN_ROOM', roomId: 'TEST1', ragewareId: 'ADHIL95' });
  const joinA = await clientA.waitForMessage();
  console.log('Client A join response:', joinA.type, joinA.ragewareId);
  if (joinA.type !== 'JOIN_SUCCESS' || joinA.ragewareId !== 'ADHIL95') {
    throw new Error('Client A failed to join');
  }

  console.log('Connecting duplicate Client A2 (ADHIL95) to same room TEST1...');
  const clientA2 = createClient('ADHIL95_DUP');
  await new Promise((r) => clientA2.ws.on('open', r));
  clientA2.send({ type: 'JOIN_ROOM', roomId: 'TEST1', ragewareId: 'ADHIL95' });
  const dupResp = await clientA2.waitForMessage();
  console.log('Duplicate ID response:', dupResp.code, dupResp.message);
  if (dupResp.code !== 'ID_TAKEN') {
    throw new Error('Server should have rejected duplicate ID');
  }
  clientA2.close();

  console.log('Connecting Client B (ALEX95)...');
  const clientB = createClient('ALEX95');
  await new Promise((r) => clientB.ws.on('open', r));

  console.log('Client B joining room TEST1 as ALEX95...');
  clientB.send({ type: 'JOIN_ROOM', roomId: 'TEST1', ragewareId: 'ALEX95' });

  // Client A should get USER_JOINED
  const userJoinedOnA = await clientA.waitForMessage();
  console.log('Client A saw user joined:', userJoinedOnA.ragewareId, userJoinedOnA.users);

  const joinB = await clientB.waitForMessage();
  console.log('Client B join response:', joinB.type, joinB.ragewareId);

  // Test 1: ADHIL95 -> ALEX95
  console.log('Client A sending message to ALEX95...');
  clientA.send({
    type: 'SEND_MESSAGE',
    to: 'ALEX95@RAGEWARE',
    subject: 'Lab Meeting',
    body: 'Are you coming to the lab?'
  });

  const [msgSentA, newMsgB] = await Promise.all([
    clientA.waitForMessage(),
    clientB.waitForMessage()
  ]);

  console.log('Client A got confirmation:', msgSentA.type, msgSentA.message?.subject);
  console.log('Client B received message:', newMsgB.type, 'From:', newMsgB.message?.sender, 'Subject:', newMsgB.message?.subject, 'Body:', newMsgB.message?.body);

  if (newMsgB.message?.body !== 'Are you coming to the lab?' || newMsgB.message?.sender !== 'ADHIL95') {
    throw new Error('Message content or sender mismatch on delivery');
  }

  // Test 2: ALEX95 -> ADHIL95 (Reply)
  console.log('Client B replying to ADHIL95...');
  clientB.send({
    type: 'SEND_MESSAGE',
    to: 'ADHIL95@RAGEWARE',
    subject: 'Re: Lab Meeting',
    body: "Yes, I'll be there.",
    threadId: newMsgB.message?.id
  });

  const [msgSentB, newMsgA] = await Promise.all([
    clientB.waitForMessage(),
    clientA.waitForMessage()
  ]);

  console.log('Client B got confirmation:', msgSentB.type);
  console.log('Client A received reply:', newMsgA.type, 'From:', newMsgA.message?.sender, 'Body:', newMsgA.message?.body);

  if (newMsgA.message?.body !== "Yes, I'll be there." || newMsgA.message?.sender !== 'ALEX95') {
    throw new Error('Reply content or sender mismatch on delivery');
  }

  // Test 3: Invalid recipient
  console.log('Testing sending to non-existent user...');
  clientA.send({
    type: 'SEND_MESSAGE',
    to: 'GHOST_USER@RAGEWARE',
    subject: 'Ghost',
    body: 'Hello?'
  });

  const errResp = await clientA.waitForMessage();
  console.log('Non-existent recipient error:', errResp.code, errResp.message);
  if (errResp.code !== 'RECIPIENT_NOT_FOUND') {
    throw new Error('Expected RECIPIENT_NOT_FOUND error');
  }

  console.log('All WebSocket server tests PASSED with 100% fidelity!');
  clientA.close();
  clientB.close();
} catch (err) {
  console.error('TEST FAILED:', err);
  process.exitCode = 1;
} finally {
  serverProcess.kill();
  process.exit();
}
