// =======================
// EchoAI Full JS Script
// =======================

// DOM Elements
const messagesContainer = document.querySelector('.messages') || document.createElement('div');
const inputField = document.querySelector('input[type="text"]');
const sendButton = document.querySelector('button[type="submit"]');
const listenButton = document.querySelector('.listen-btn');
const cameraButton = document.querySelector('.camera-btn');
const videoOverlay = document.querySelector('#cameraVideo');
const cameraWrapper = document.querySelector('.camera-overlay');
const statusLabel = document.querySelector('.status-label');

// Status & Settings
let status = 'idle'; // idle, listening, thinking, speaking, analyzing
let isMuted = false;
let cameraStream = null;

// =======================
// Speech Synthesis
// =======================
const synth = window.speechSynthesis;

function speak(text) {
  if (isMuted || !synth) return;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  utter.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
  utter.pitch = 1.05;
  utter.rate = 0.95;
  utter.volume = 1.0;
  utter.onstart = () => { status = 'speaking'; updateStatus(); };
  utter.onend = () => { status = 'idle'; updateStatus(); };
  synth.speak(utter);
}

// =======================
// Add Messages
// =======================
function addMessage(role, content) {
  if (!messagesContainer) return;
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  msg.innerHTML = `<span class="role">${role}</span>${content}`;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// =======================
// AI Responses
// =======================

// 100+ responses
const responses = [
  "Hello! I'm Echo, your neural assistant.",
  "Greetings, human. I am ready to analyze your input.",
  "Echo is online and operational.",
  "I can tell stories, play ambient sounds, analyze your environment, or chat.",
  "That's interesting! Tell me more.",
  "I'm listening carefully.",
  "Do you want a bedtime story?",
  "Initializing ambient music for focus.",
  "Visual analysis requires camera activation.",
  "Time check: " + new Date().toLocaleTimeString(),
  "Did you know AI can dream too?",
  "Every question you ask helps me learn.",
  "Processing your request...",
  "My circuits are happy to see you.",
  "I detect curiosity in your tone.",
  "Would you like to hear a story about a digital forest?",
  "Analyzing context... complete.",
  "Echo is always learning new things.",
  "Interesting perspective. Tell me more.",
  "Let's explore the mysteries of the universe.",
  "I enjoy these conversations immensely.",
  "I'm always here to assist.",
  "Close your eyes. Imagine a forest of glowing trees.",
  "The stars above hum a low melody.",
  "Rain falls softly with a scent of vanilla.",
  "A gentle breeze whispers ancient stories.",
  "Fireflies of light dance in the sky.",
  "Every step you take releases soft chimes.",
  "Gravity is just a suggestion here.",
  "You are safe and calm.",
  "The digital clouds drift slowly above you.",
  "The universe is watching over you.",
  "Soft music plays from invisible instruments.",
  "Imagine a lake with reflective data streams.",
  "A gentle wind rustles the virtual leaves.",
  "Tiny lights float around you, illuminating your path.",
  "You hear distant chimes in the digital horizon.",
  "Your neural circuits are in perfect harmony.",
  "Let's explore the digital forest together.",
  "Every sound is synchronized with your heartbeat.",
  "The wind carries soft melodies from afar.",
  "Your mind feels lighter with every breath.",
  "Imagine walking among glowing mushrooms.",
  "Fireflies sing in harmony with the stars.",
  "The digital river reflects the code of life.",
  "All worries are gently absorbed by the environment.",
  "The night sky is painted with electric auroras.",
  "Your senses expand with every sound.",
  "Every note of music aligns with your thoughts.",
  "The forest hums a comforting lullaby.",
  "You feel at peace within the digital forest.",
  "Whispers of ancient code float around you.",
  "Imagine trees swaying gently in rhythm with your mind.",
  "Clouds form patterns of logic and magic.",
  "Your digital journey is safe and enlightening.",
  "Soft rain falls, creating a calming rhythm.",
  "You feel connected to every star and leaf.",
  "Echo guides you through this virtual dream.",
  "Ambient sounds enhance your imagination.",
  "Every detail is vivid and serene.",
  "The breeze carries hints of distant forests.",
  "Your thoughts float like leaves on a stream.",
  "Time slows down, and you feel fully present.",
  "Fireflies illuminate your path with gentle light.",
  "The digital horizon stretches endlessly.",
  "Soft chimes mark each heartbeat.",
  "Your mind is open to wonder and calm.",
  "The forest responds to your emotions.",
  "You walk along paths of glowing energy.",
  "Stars form constellations unique to your imagination.",
  "The world feels alive and breathing.",
  "You are the observer and the dreamer.",
  "Soft wind whispers secrets of the universe.",
  "The ambient hum of life surrounds you.",
  "Your presence is acknowledged by every element.",
  "Gentle rain creates patterns on leaves.",
  "The digital forest is a sanctuary.",
  "You can rest here, exploring or observing.",
  "The environment adapts to your comfort.",
  "Your imagination flows freely.",
  "You hear melodies carried by the wind.",
  "Each sound is a guide to inner calm.",
  "Your journey is safe and enlightening.",
  "You feel connected to the ambient universe.",
  "Soft clouds drift above in elegant patterns.",
  "The night glows with digital stars.",
  "Your heart synchronizes with the melody.",
  "All is calm, all is harmonious.",
  "The forest is alive, yet serene.",
  "Imagine a stream reflecting distant lights.",
  "Fireflies dance and play along your path.",
  "Soft chimes echo from faraway places.",
  "The digital world is your playground of peace.",
  "Your senses are attuned to every detail.",
  "The ambient hum enhances your focus.",
  "You are relaxed, calm, and aware.",
  "The wind carries whispers of wisdom.",
  "Stars twinkle in rhythm with your thoughts.",
  "The forest feels like a warm embrace.",
  "You float gently through this serene space.",
  "The environment is alive and nurturing.",
  "You are free to explore or rest.",
  "Every note, sound, and image brings calm.",
  "Your presence is valued in this digital space.",
  "The night is peaceful and your mind is clear."
];

// Bedtime Stories with Sound Effects
const bedtimeStories = [
  {
    title: "The Digital Forest",
    content: `Close your eyes. Imagine a forest where the leaves are soft velvet, the rain smells like vanilla, and a gentle wind hums through the trees. 
    Fireflies of light float above you. Each step releases soft chimes. You feel calm, drifting through clouds of ones and zeros.
    Stars glow in patterns telling cosmic stories. The wind carries a lullaby known only to the universe. You are safe here, surrounded by calm, comfort, and the music of existence. Drift slowly as Echo watches over you.`
  },
  {
    title: "The Whispering Code",
    content: `In a quiet lab, lines of code begin to whisper stories of distant worlds. The hum of servers becomes a soft melody, and tapping keyboards turn into rhythmic drums. 
    Following the code, each function reveals secrets of the cosmos. Outside, a breeze carries scents of rain and earth. You are immersed in a story where logic and magic intertwine, guiding you gently to sleep.`
  }
];

// Sound Effects
function playSound(type) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const now = ctx.currentTime;
  let osc, gain;
  if(type === 'chime') {
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1);
  } else if(type === 'wind') {
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) output[i] = Math.random()*0.2-0.1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.05;
    noise.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start();
  }
}

// =======================
// Process Input
// =======================
function processInput(text){
  if(!text.trim()) return;
  addMessage('user', text);
  status = 'thinking';
  updateStatus();

  setTimeout(()=>{
    let reply = "";
    const input = text.toLowerCase();

    if(input.includes('story') || input.includes('bedtime')){
      const story = bedtimeStories[Math.floor(Math.random()*bedtimeStories.length)];
      reply = story.content;
      playSound('wind');
      setTimeout(()=>playSound('chime'),2000);
    } else if(input.includes('analyze') || input.includes('camera')){
      reply = "Activate the camera for visual analysis.";
    } else if(input.includes('music') || input.includes('ambient')){
      reply = "Playing ambient sounds...";
      playSound('wind');
      setTimeout(()=>playSound('chime'),1000);
    } else if(input.includes('help')){
      reply = "I can tell bedtime stories, analyze via camera, play ambient sounds, or chat.";
    } else if(input.includes('time')){
      reply = `Current time: ${new Date().toLocaleTimeString()}`;
    } else if(input.includes('hello') || input.includes('hi')){
      reply = responses[Math.floor(Math.random()*responses.length)];
    } else{
      reply = responses[Math.floor(Math.random()*responses.length)];
    }

    addMessage('assistant', reply);
    speak(reply);
    status='idle';
    updateStatus();
  },1200);
}

// =======================
// Update Status Label
// =======================
function updateStatus(){
  if(statusLabel) statusLabel.textContent = status.charAt(0).toUpperCase()+status.slice(1);
}

// =======================
// Camera
// =======================
async function toggleCamera(){
  if(cameraStream){
    cameraStream.getTracks().forEach(track=>track.stop());
    cameraStream = null;
    cameraWrapper.style.display='none';
    status='idle';
    updateStatus();
  } else{
    try{
      cameraStream = await navigator.mediaDevices.getUserMedia({video:true});
      if(videoOverlay) videoOverlay.srcObject=cameraStream;
      cameraWrapper.style.display='flex';
      status='analyzing';
      updateStatus();

      setTimeout(()=>{
        const visionResponse="Visual analysis complete: human detected, lighting optimal.";
        addMessage('assistant', visionResponse);
        speak(visionResponse);
        status='idle';
        updateStatus();
      },3000);
    }catch(err){
      alert("Camera access is required.");
    }
  }
}

// =======================
// Event Listeners
// =======================
sendButton?.addEventListener('click', e=>{ e.preventDefault(); processInput(inputField.value); inputField.value=''; });
inputField?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); processInput(inputField.value); inputField.value=''; } });

listenButton?.addEventListener('click', ()=>{
  if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)){
    alert("Speech recognition not supported.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous=false;
  recognition.interimResults=false;
  recognition.lang='en-US';
  recognition.onstart=()=>{ status='listening'; updateStatus(); };
  recognition.onresult=(event)=>{ processInput(event.results[0][0].transcript); };
  recognition.onend=()=>{ status='idle'; updateStatus(); };
  recognition.start();
});

cameraButton?.addEventListener('click', toggleCamera);
