const MESSAGES= 'liveChatMessages';
const USERNAME = 'username';
const messagesEl = document.getElementById('messages');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const changeNameBtn = document.getElementById('changeName');
const nameBadge = document.getElementById('nameBadge');
const statusText = document.getElementById('statusText');

function getname() {
  let name = localStorage.getItem(USERNAME);
  if (!name) {
    name = prompt("Enter your name:", "Guest-" + Math.floor(Math.random()*1000));
    localStorage.setItem(USERNAME, name);
  }
  return name;
}
let myName = getname();
nameBadge.textContent = myName;

let bc = null;
if ('BroadcastChannel' in window) {
  bc = new BroadcastChannel("live-chat");
  bc.onmessage = handleBroadcast;
  statusText.textContent = "connected";
} else {
  statusText.textContent = "fallback";
}

function readMessages() {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES)) || [];
  } catch {
    return [];
  }
}

function saveMessages(msgs, broadcast=true) {
  localStorage.setItem(MESSAGES, JSON.stringify(msgs));
  if (broadcast && bc) bc.postMessage({type:"sync", payload:msgs});
}

function renderMessages() {
  const msgs = readMessages();
  messagesEl.innerHTML = "";
  if (msgs.length === 0) {
    messagesEl.innerHTML = "<div style='color:gray;text-align:center;font-size:19px;font-weight:bold'>No messages</div>";
    return;
  }
  msgs.forEach(m => {
    const wrapper = document.createElement("div");
    wrapper.className = "msg " + (m.name===myName ? "me":"other");
    wrapper.innerHTML = `<div class="meta">${m.name} • ${new Date(m.time).toLocaleTimeString()}</div>${m.text}`;
    messagesEl.appendChild(wrapper);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const msgs = readMessages();
  msgs.push({name:myName, text:trimmed, time:Date.now()});
  saveMessages(msgs, true);
  renderMessages();
  input.value = "";
}

function handleBroadcast(e) {
  if (!e.data) return;
  if (e.data.type==="sync") {
    localStorage.setItem(MESSAGES, JSON.stringify(e.data.payload));
    renderMessages();
  }
}

sendBtn.onclick = () => sendMessage(input.value);

input.onkeydown = (e) => {
  if (e.key==="Enter") {
    e.preventDefault();
    sendMessage(input.value);
  }
};
clearBtn.onclick = () => {
  localStorage.removeItem(MESSAGES);
  if (bc) bc.postMessage({type:"sync", payload:[]});
  renderMessages();
};
changeNameBtn.onclick = () => {
  const newName = prompt("Enter new name:", myName);
  if (newName) {
    myName = newName;
    localStorage.setItem(USERNAME, myName);
    nameBadge.textContent = myName;
  }
};

renderMessages();

