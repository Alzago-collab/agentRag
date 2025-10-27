import { processRAGQuestion } from './moteur.js';

const chatHistoryDiv = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const LOCAL_STORAGE_KEY = 'ragbuilder-chat-history';

function loadHistory() {
  const hist = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  chatHistoryDiv.innerHTML = '';
  hist.forEach(msg => addMessage(msg.text, msg.sender, false));
}

function saveToHistory(text, sender) {
  const hist = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  hist.push({ text, sender });
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hist));
}

function addMessage(text, sender = 'user', save = true) {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = `bubble ${sender}`;
  bubble.innerText = text;
  message.appendChild(bubble);
  chatHistoryDiv.appendChild(message);
  chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
  if (save) saveToHistory(text, sender);
}

export function clearHistory() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  chatHistoryDiv.innerHTML = '';
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;
  addMessage(question, 'user');
  userInput.value = '';
  addMessage('… réflexion IA en cours …', 'bot');
  try {
    const { reponse } = await processRAGQuestion(question);
    // Supprime le loader
    const loaders = document.querySelectorAll('.bubble.bot');
    loaders[loaders.length-1].innerText = reponse;
    saveToHistory(reponse, 'bot');
  } catch (err) {
    const loaders = document.querySelectorAll('.bubble.bot');
    loaders[loaders.length-1].innerText = "Erreur : " + err.message;
    saveToHistory("Erreur : " + err.message, 'bot');
  }
});

window.addEventListener('DOMContentLoaded', loadHistory);
