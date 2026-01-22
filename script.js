// ================================
// State & DOM Elements
// ================================
const chatHistory = document.getElementById('chatHistory');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const muteBtn = document.getElementById('muteBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelp = document.getElementById('closeHelp');
const understoodHelp = document.getElementById('understoodHelp');
const cameraOverlay = document.getElementById('cameraOverlay');
const videoFeed = document.getElementById('videoFeed');
const detectionCanvas = document.getElementById('detectionCanvas');
const closeCamera = document.getElementById('closeCamera');
const orb = document.getElementById('orb');
const statusLabel = document.getElementById('statusLabel');
const statusDesc = document.getElementById('statusDesc');

let messages = [
  { role: 'assistant', content: "System online. I am Echo. How can I assist your neural pathways today?" }
];
let status = 'idle'; // idle, listening, thinking, speaking, analyzing
let isMuted = false;
let recognition = null;
let synth = window.speechSynthesis;
let cameraStream = null;
let model = null;

// ================================
// Visualizer Bars
// ================================
const visualizerBars = document.getElementById('visualizerBars');
for (let i = 0; i < 12; i++) {
  const bar = document.createElement('div');
  bar.classList.add('visual-bar');
  visualizerBars.appendChild(bar);
}

// ================================
// Speech Synthesis (Male Voice)
// ================================
function speak(text) {
  if (isMuted || !synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  utter.voice = voices.find(v => v.name.includes('Male') || v.name.includes('Google US English')) || voices[0];
  utter.pitch = 1.0;
  utter.rate = 0.95;
  utter.onstart = () => setStatus('speaking');
  utter.onend = () => setStatus('idle');
  synth.speak(utter);
}

// ================================
// Update Status
// ================================
function setStatus(newStatus) {
  status = newStatus;
  orb.className = '';
  orb.classList.add(newStatus);
  statusLabel.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1) + '...';

  switch(newStatus){
    case 'idle':
      statusDesc.textContent = "Tap the bolt or type below to interact";
      break;
    case 'listening':
      statusDesc.textContent = "I am capturing your voice frequencies";
      break;
    case 'speaking':
      statusDesc.textContent = "Synthesizing natural language response";
      break;
    case 'analyzing':
      statusDesc.textContent = "Processing visual data streams";
      break;
    case 'thinking':
      statusDesc.textContent = "Formulating a response";
      break;
  }
}

// ================================
// Chat System
// ================================
function addMessage(role, content){
  messages.push({role, content});
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', role);
  msgDiv.textContent = content;
  chatHistory.appendChild(msgDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// ================================
// AI Logic / Responses
// ================================
function processInput(input){
  if(!input.trim()) return;
  addMessage('user', input);
  setStatus('thinking');

  setTimeout(() => {
    let response = "";
    const txt = input.toLowerCase();

    if(txt.includes('story') || txt.includes('bedtime')){
      response = `Close your eyes. Imagine a forest where the leaves shimmer with silver light and every sound is a soft echo of your heartbeat. The streams sing gentle melodies, and the wind carries whispers of ancient knowledge. Stars drift lazily above, illuminating hidden paths. You are safe, floating between reality and imagination, where every dream is a universe waiting to unfold. Breathe slowly and let the adventure guide your mind.`;
    } else if(txt.includes('analyze') || txt.includes('see') || txt.includes('camera')){
      response = "I'm ready to analyze. Please activate the camera to begin object detection in your environment.";
    } else if(txt.includes('music') || txt.includes('ambient')){
      response = "Initializing ambient soundscapes. Lo-fi rhythms are now aligned to your current mood. Feel the resonance.";
    } else if(txt.includes('help') || txt.includes('what can you do')){
      response = "I am Echo, your multi-modal neural assistant. I can narrate immersive bedtime stories, analyze surroundings via video, play ambient music, or engage in deep conversations.";
    } else if(txt.includes('time')){
      response = `The current time is ${new Date().toLocaleTimeString()}. Perfect moment to interact with me.`;
    } else if(txt.includes('hello') || txt.includes('hi')){
      const greetings = [
        "Hello there. My circuits light up seeing you.",
        "Greetings, human. Ready to assist your journey.",
        "Echo is online and fully operational. What shall we explore today?"
      ];
      response = greetings[Math.floor(Math.random()*greetings.length)];
    } else {
      response = "That's intriguing. Tell me more about that.";
    }

    addMessage('assistant', response);
    speak(response);
    setStatus('idle');
  }, 1200);
}

// ================================
// Form & Quick Buttons
// ================================
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = chatInput.value;
  chatInput.value = '';
  processInput(val);
});

document.querySelectorAll('.quickBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if(action === 'story') processInput('Tell me a bedtime story');
    if(action === 'music') processInput('Play ambient music');
    if(action === 'camera') toggleCamera();
  });
});

// ================================
// Speech Recognition
// ================================
if(window.SpeechRecognition || window.webkitSpeechRecognition){
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (e)=>{
    const transcript = e.results[0][0].transcript;
    processInput(transcript);
  };
  recognition.onend = ()=>{
    if(status==='listening') setStatus('idle');
  };
}

voiceBtn.addEventListener('click', ()=>{
  if(status==='listening'){ recognition.stop(); setStatus('idle'); }
  else { recognition.start(); setStatus('listening'); }
});

muteBtn.addEventListener('click', ()=>{
  isMuted = !isMuted;
  muteBtn.querySelector('i').dataset.lucide = isMuted ? 'volume-x':'volume-2';
  lucide.createIcons();
});

// ================================
// Help Modal
// ================================
helpBtn.addEventListener('click', ()=> helpModal.style.display='flex');
closeHelp.addEventListener('click', ()=> helpModal.style.display='none');
understoodHelp.addEventListener('click', ()=> helpModal.style.display='none');

// ================================
// Camera & Object Detection
// ================================
async function toggleCamera(){
  if(cameraOverlay.style.display==='flex'){
    cameraStream.getTracks().forEach(track=>track.stop());
    cameraOverlay.style.display='none';
    setStatus('idle');
    return;
  }
  try{
    cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    videoFeed.srcObject = cameraStream;
    cameraOverlay.style.display='flex';
    setStatus('analyzing');

    // Load model if not already
    if(!model) model = await cocoSsd.load();

    // Detection loop
    const ctx = detectionCanvas.getContext('2d');
    detectionCanvas.width = videoFeed.videoWidth || 640;
    detectionCanvas.height = videoFeed.videoHeight || 480;

    async function detectFrame(){
      if(!cameraOverlay.style.display==='flex') return;
      const predictions = await model.detect(videoFeed);
      ctx.clearRect(0,0,detectionCanvas.width,detectionCanvas.height);
      predictions.forEach(pred=>{
        ctx.strokeStyle='cyan';
        ctx.lineWidth=2;
        ctx.font='16px sans-serif';
        ctx.fillStyle='cyan';
        ctx.beginPath();
        ctx.rect(pred.bbox[0], pred.bbox[1], pred.bbox[2], pred.bbox[3]);
        ctx.stroke();
        ctx.fillText(`${pred.class} (${(pred.score*100).toFixed(1)}%)`, pred.bbox[0], pred.bbox[1]-5);
      });
      requestAnimationFrame(detectFrame);
    }
    detectFrame();

  }catch(err){
    console.error(err);
    alert('Camera access required for analysis.');
    setStatus('idle');
  }
}

closeCamera.addEventListener('click', toggleCamera);

// ================================
// Initialize First Message
// ================================
addMessage('assistant', messages[0].content);
lucide.createIcons();
