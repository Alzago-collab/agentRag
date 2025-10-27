import { processRAGQuestion } from './moteur.js';

const chatHistory = document.getElementById('chat-history');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

function addMessage(text, sender = 'user') {
  const message = document.createElement('div');
  message.className = `message ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = `bubble ${sender}`;
  bubble.innerText = text;
  message.appendChild(bubble);
  chatHistory.appendChild(message);
  chatHistory.scrollTop = chatHistory.scrollHeight;
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
  } catch (err) {
    const loaders = document.querySelectorAll('.bubble.bot');
    loaders[loaders.length-1].innerText = "Erreur : " + err.message;
  }
});
