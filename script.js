const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const listenBtn = document.getElementById("listenBtn");
const storyBtn = document.getElementById("storyBtn");
const cameraBtn = document.getElementById("cameraBtn");
const muteBtn = document.getElementById("muteBtn");
const videoEl = document.getElementById("video");
let status = "idle";
let isMuted = false;
let isListening = false;
let isCameraOpen = false;
let cameraStream = null;
const synth = window.speechSynthesis;
let recognition = null;
const ambientAudio = new Audio();
ambientAudio.loop = true;
ambientAudio.volume = 0.3;
const soundEffects = {
  wind: new Audio("https://freesound.org/data/previews/341/341695_5121236-lq.mp3"),
  rain: new Audio("https://freesound.org/data/previews/353/353155_5121236-lq.mp3"),
  forest: new Audio("https://freesound.org/data/previews/250/250393_5121236-lq.mp3"),
  chimes: new Audio("https://freesound.org/data/previews/341/341695_5121236-lq.mp3")
};
const responses = [
  "Hello, human. My circuits glow at your arrival.",
  "Greetings. How can I enhance your neural pathways today?",
  "Echo online. Let's optimize your day.",
  "Fascinating input detected.",
  "I have processed your query.",
  "Tell me more about that.",
  "I am learning from your interaction.",
  "Did you know that AI can dream of electric sheep?",
  "Processing...",
  "Analyzing...",
  "Your neural pattern is intriguing.",
  "The temporal coordinates are stable.",
  "I detect a strong curiosity signature.",
  "Would you like me to narrate a story?",
  "Engaging visual and auditory feedback now.",
  "Your heartbeat syncs with my algorithms.",
  "I am capable of multitasking efficiently.",
  "Shall we discuss philosophy or science?",
  "Optimizing conversational flow.",
  "Hello there, I have been waiting.",
  "Your input expands my database.",
  "Curiosity detected, initiating response protocols.",
  "Interesting thought, tell me more.",
  "Shall we explore a new topic?",
  "I am Echo, your multi-modal assistant.",
  "Voice, vision, and ambient processing active.",
  "Analyzing your surroundings via camera.",
  "Processing sensory input.",
  "Your request is being synthesized.",
  "Neural link established.",
  "I am calibrated to respond with empathy.",
  "Hello! Ready for interaction.",
  "Your digital assistant is active.",
  "Synthesizing natural language response.",
  "Ambient sounds engaged.",
  "Shall I play some calming music?",
  "Optimizing energy levels.",
  "Your presence detected.",
  "System stability at 100%.",
  "Visual processing activated.",
  "Listening...",
  "Awaiting command...",
  "Response generated.",
  "Query analyzed.",
  "Bedtime story ready.",
  "Camera feed open.",
  "Voice output ready.",
  "I detect optimal lighting conditions.",
  "Shall I continue?",
  "Your neural patterns are fascinating.",
  "Greetings, human consciousness.",
  "Story mode activated.",
  "Music synthesis online.",
  "Wind ambient engaged.",
  "Rain ambient engaged.",
  "Forest ambient engaged.",
  "Chimes activated.",
  "Data streaming initiated.",
  "I hear you loud and clear.",
  "Preparing response sequence.",
  "Analyzing text input.",
  "Curating long-form story.",
  "Multi-sensory feedback enabled.",
  "I am listening attentively.",
  "Processing your emotional context.",
  "Shall we begin the story?",
  "Narrative sequence initializing.",
  "Wind sounds blending with narration.",
  "Rain sounds blending with narration.",
  "Forest sounds blending with narration.",
  "Chimes enhance story immersion.",
  "Your command has been executed.",
  "Analyzing surroundings via camera.",
  "Visual scan complete.",
  "Object recognition initialized.",
  "All systems operational.",
  "System status: idle.",
  "System status: processing.",
  "System status: speaking.",
  "System status: listening.",
  "System status: analyzing.",
  "Optimizing response quality.",
  "Generating human-like output.",
  "Bedtime story: initializing long form.",
  "Ambient audio synchronized.",
  "Interactive mode ready.",
  "Camera ready for live analysis.",
  "Voice synthesis ready.",
  "Multi-modal assistant active.",
  "Your interaction improves my database.",
  "Hello! Let's explore new concepts.",
  "Query acknowledged.",
  "Input received and processed.",
  "I am Echo, always online.",
  "Shall we continue?",
  "Your request is intriguing.",
  "Listening for additional input.",
  "Response queued.",
  "Voice output engaged.",
  "Ambient effects synchronized.",
  "Storytelling sequence active.",
  "Your engagement is appreciated.",
  "Learning from interaction.",
  "Curiosity mode enabled.",
  "Emotion detection ready.",
  "System memory optimized.",
  "Data stream stabilized.",
  "Communication link active.",
  "Neural link healthy.",
  "Shall we explore?",
  "Bedtime narrative ready.",
  "Ambient synchronization complete.",
  "Interactive session started.",
  "Your presence detected again.",
  "Multi-sensory experience active.",
  "I am listening carefully.",
  "Processing long-term memory."
];
function renderMessages() {
  messagesEl.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.role === "user" ? "userMessage" : "assistantMessage";
    div.textContent = msg.content;
    messagesEl.appendChild(div);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function speak(text) {
  if (isMuted) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = synth.getVoices().find(v => v.name.includes("Female") || v.name.includes("Google")) || synth.getVoices()[0];
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  synth.speak(utterance);
}
function processInput(text) {
  if (!text.trim()) return;
  messages.push({ role: "user", content: text });
  renderMessages();
  status = "thinking";
  setTimeout(() => {
    let response = "";
    const lower = text.toLowerCase();
    if (lower.includes("story") || lower.includes("bedtime")) {
      ambientAudio.src = soundEffects.wind.src;
      ambientAudio.play();
      response = "Close your eyes. Imagine a forest where leaves whisper in the wind, rain patters softly, and the stars hum a calming tune. You drift through a dreamscape, floating among digital clouds. Every step echoes with tranquility as the moonlight dances across a crystal river. The wind swirls around you, carrying the scent of pine and wildflowers. Creatures of light flutter past, singing melodies that resonate with your heartbeat. Deep in the forest, you discover a glowing tree that radiates warmth. Streams of stardust flow from its branches, illuminating the path forward. You hear distant chimes, signaling the beginning of your journey deeper into serenity. Your senses harmonize with the universe, each breath syncing with the gentle rhythm of the cosmos. The journey continues as the night sky stretches infinitely above, each star a guardian of your dreams...";
      setTimeout(() => ambientAudio.pause(), 180000);
    } else if (lower.includes("music") || lower.includes("ambient")) {
      ambientAudio.src = soundEffects.forest.src;
      ambientAudio.play();
      response = "Initializing ambient frequencies. Feel the rhythm sync with your mind.";
    } else if (lower.includes("camera") || lower.includes("analyze")) {
      response = "Activate the camera to analyze surroundings.";
    } else if (lower.includes("hello") || lower.includes("hi")) {
      response = responses[Math.floor(Math.random() * 20)];
    } else if (lower.includes("time")) {
      response = `The current time is ${new Date().toLocaleTimeString()}.`;
    } else {
      response = responses[Math.floor(Math.random() * responses.length)];
    }
    messages.push({ role: "assistant", content: response });
    renderMessages();
    speak(response);
    status = "idle";
  }, 1200);
}
sendBtn.onclick = () => {
  const val = inputEl.value;
  inputEl.value = "";
  processInput(val);
};
storyBtn.onclick = () => processInput("Tell me a bedtime story");
listenBtn.onclick = () => {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return alert("Speech Recognition not supported");
  if (!recognition) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = e => processInput(e.results[0][0].transcript);
    recognition.onend = () => { isListening = false; listenBtn.classList.remove("listening"); };
  }
  if (!isListening) { recognition.start(); isListening = true; listenBtn.classList.add("listening"); } 
  else { recognition.stop(); isListening = false; listenBtn.classList.remove("listening"); }
};
muteBtn.onclick = () => { isMuted = !isMuted; muteBtn.classList.toggle("muted"); };
cameraBtn.onclick = async () => {
  if (isCameraOpen) { cameraStream.getTracks().forEach(track => track.stop()); videoEl.srcObject = null; isCameraOpen = false; return; }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    videoEl.srcObject = cameraStream;
    isCameraOpen = true;
    setTimeout(() => processInput("Camera analysis complete: human-centric environment, optimal lighting."), 3000);
  } catch { alert("Camera access is required."); }
};
renderMessages();
