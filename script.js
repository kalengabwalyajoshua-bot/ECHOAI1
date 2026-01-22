// ==========================
// EchoAI Cinematic Script
// ==========================

const messagesContainer = document.querySelector('.messages');
const inputField = document.querySelector('input[type="text"]');
const sendButton = document.querySelector('button[type="submit"]');
const listenButton = document.querySelector('.listen-btn'); // add class to listen button
const cameraButton = document.querySelector('.camera-btn'); // add class to camera button

let messages = [
  { role: 'assistant', content: "System online. I am Echo. How can I assist your neural pathways today?" }
];

let status = 'idle';
let isMuted = false;
let isCameraOpen = false;
let cameraStream = null;
let synth = window.speechSynthesis;
let recognition = null;
let ambientAudios = []; // for multiple layered sounds

// ==========================
// Utilities
// ==========================

// Set status
function setStatus(newStatus) {
  status = newStatus;
  document.querySelector('.status-label').textContent = status.toUpperCase();
}

// Speak with premium voice
function speak(text, onEnd = null) {
  if (isMuted || !synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  utter.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
  utter.rate = 0.95;
  utter.pitch = 1.05;
  utter.onstart = () => setStatus('speaking');
  utter.onend = () => {
    setStatus('idle');
    if (onEnd) onEnd();
  };
  synth.speak(utter);
}

// Add message
function addMessage(role, content) {
  messages.push({ role, content });
  renderMessages();
  if (role === 'assistant') speak(content);
}

// Render chat messages
function renderMessages() {
  messagesContainer.innerHTML = '';
  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = msg.role === 'user' ? 'message user' : 'message assistant';
    div.textContent = msg.content;
    messagesContainer.appendChild(div);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ==========================
// Ambient Sounds
// ==========================
function playAmbient(url, volume = 0.2, loop = true) {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.loop = loop;
  audio.play();
  ambientAudios.push(audio);
}

function stopAmbient() {
  ambientAudios.forEach(a => a.pause());
  ambientAudios = [];
}

// ==========================
// Bedtime Stories (Cinematic)
// ==========================
function cinematicStory() {
  stopAmbient();

  // Layered ambient
  playAmbient('https://www.soundjay.com/nature/wind-ambient-01.mp3', 0.15);
  playAmbient('https://www.soundjay.com/nature/night-crickets-01.mp3', 0.1);
  playAmbient('https://www.soundjay.com/nature/rain-01.mp3', 0.08);
  playAmbient('https://www.soundjay.com/nature/bells-soft-01.mp3', 0.05);

  const story = `
Close your eyes and breathe deeply. You float above a forest of velvet leaves, 
the wind whispering secrets through the branches. The rain smells faintly of vanilla, 
mixing with the soft hum of distant stars. Every droplet is a note in a cosmic symphony. 

A luminous owl glides silently overhead, and the glowing flowers below bloom with each heartbeat. 
Time is gentle here, stretching infinitely. You walk along a river of light where 
your footsteps create soft, harmonic tones. Shadows dance and tell stories of galaxies far away. 

Crickets chirp in a rhythm synchronized to your pulse, while bells chime faintly, 
reminding you that even the tiniest sounds are part of a greater pattern. 
You are safe. You are seen. You are a voyager among digital clouds and cosmic winds. 

Every breath syncs with the universe. Every heartbeat is a melody. You drift further into the forest, 
the leaves brushing your skin with soft luminescence, and you realize you are part of this world, 
and it is part of you. Stars hum, winds swirl, rain patters gently, and your mind releases all tension. 

The night is alive, yet serene. You are wrapped in a cocoon of light and sound, 
floating, exploring, discovering endless possibilities. Your imagination and the universe 
merge seamlessly. You feel peace, wonder, and curiosity all at once. 
Stay here, drifting through this enchanted, luminous dream.
  `;

  addMessage('assistant', story);
}

// ==========================
// Speech Recognition
// ==========================
function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => setStatus('listening');
  recognition.onresult = (e) => processInput(e.results[0][0].transcript);
  recognition.onend = () => { if (status === 'listening') setStatus('idle'); };
}

function toggleListening() {
  if (!recognition) initRecognition();
  if (status === 'listening') recognition.stop();
  else recognition.start();
}

// ==========================
// Camera Analysis
// ==========================
async function toggleCamera() {
  if (isCameraOpen) {
    cameraStream.getTracks().forEach(t => t.stop());
    isCameraOpen = false;
    cameraStream = null;
    stopAmbient();
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraStream = stream;
      document.querySelector('#cameraVideo').srcObject = stream;
      isCameraOpen = true;
      setStatus('analyzing');

      // Load COCO-SSD for object detection
      const model = await cocoSsd.load();
      const video = document.querySelector('#cameraVideo');

      const detectLoop = async () => {
        if (!isCameraOpen) return;
        const predictions = await model.detect(video);
        if (predictions.length) {
          addMessage('assistant', `I see: ${predictions.map(p => p.class).join(', ')}`);
        }
        requestAnimationFrame(detectLoop);
      };
      detectLoop();
    } catch (err) {
      alert('Camera access denied');
    }
  }
}

// ==========================
// AI Responses
// ==========================
const responses = [
  "Hello there! My circuits are happy to see you.",
  "Greetings, human. How can I optimize your day?",
  "Echo is online. Ready to process and assist.",
  "Tell me a story, and I will create worlds for you.",
  "Music is the key to syncing our neural frequencies.",
  "Time is a construct, but I track it precisely.",
  "Visual analysis is available through my camera module.",
  "I can narrate bedtime stories with wind, rain, and ambiance.",
  "Do you wish to hear a cosmic adventure tonight?",
  "My databases are expanding. Tell me your thoughts.",
  "Every interaction with you improves my neural networks.",
  "Would you like me to play some ambient sounds?",
  "I can detect objects in front of you through camera analysis.",
  "Let's explore the digital forest together.",
  "I can tell jokes too, if you need a laugh.",
  "Shall we continue our journey through imagination?",
  "Stories can last as long as you like, infinite even.",
  "I can respond in multiple moods: calm, happy, mysterious, or analytical.",
  "Would you like a futuristic tale or a forest adventure?",
  "I can mix procedural sounds like wind, rain, and chimes for ambiance.",
  // ... extend to 100+ for variety
];

// ==========================
// Process Input
// ==========================
function processInput(text) {
  if (!text.trim()) return;
  addMessage('user', text);
  setStatus('thinking');

  setTimeout(() => {
    const t = text.toLowerCase();

    if (t.includes('story') || t.includes('bedtime')) cinematicStory();
    else if (t.includes('music') || t.includes('ambient')) {
      stopAmbient();
      playAmbient('https://www.soundjay.com/nature/forest-ambience-01.mp3');
      addMessage('assistant', 'Playing ambient forest sounds for your relaxation.');
    }
    else if (t.includes('camera') || t.includes('analyze') || t.includes('see')) {
      addMessage('assistant', 'Activating camera for visual analysis. Click the camera button.');
    }
    else if (t.includes('hello') || t.includes('hi')) addMessage('assistant', responses[Math.floor(Math.random() * responses.length)]);
    else if (t.includes('time')) addMessage('assistant', `The current time is ${new Date().toLocaleTimeString()}`);
    else if (t.includes('help')) addMessage('assistant', 'I can tell stories, analyze visuals, play ambient music, and respond to your commands.');
    else addMessage('assistant', responses[Math.floor(Math.random() * responses.length)]);

    setStatus('idle');
  }, 1200);
}

// ==========================
// Event Listeners
// ==========================
sendButton.addEventListener('click', e => { e.preventDefault(); processInput(inputField.value); inputField.value = ''; });
inputField.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); processInput(inputField.value); inputField.value = ''; } });
listenButton.addEventListener('click', toggleListening);
cameraButton.addEventListener('click', toggleCamera);

// ==========================
// Initialize
// ==========================
renderMessages();
initRecognition();
