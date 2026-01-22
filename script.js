// ===== State Management =====
let messages = [
  { role: "assistant", content: "System online. I am Echo. How can I assist your neural pathways today?" }
];

let status = "idle"; // idle, listening, thinking, speaking, analyzing
let isMuted = false;
let isCameraOpen = false;
let cameraStream = null;

// ===== DOM References =====
const chatHistory = document.querySelector(".chat-history");
const chatInput = document.querySelector("#chatInput");
const sendBtn = document.querySelector("#sendBtn");
const listeningBtn = document.querySelector("#listeningBtn");
const coreOrb = document.querySelector(".core-orb");
const centerIcon = document.querySelector(".center-icon");
const cameraOverlay = document.querySelector(".camera-overlay");
const cameraVideo = document.querySelector("#cameraVideo");
const closeCameraBtn = document.querySelector("#closeCameraBtn");
const helpBtn = document.querySelector("#helpBtn");
const helpModal = document.querySelector(".help-modal");
const understoodBtn = document.querySelector("#understoodBtn");

// ===== Speech Synthesis =====
const synth = window.speechSynthesis;
function speak(text) {
  if (isMuted || !synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  utterance.voice = voices.find(v => v.name.includes('Female') || v.name.includes('Google')) || voices[0];
  utterance.pitch = 1.05;
  utterance.rate = 0.95;
  utterance.onstart = () => setStatus("speaking");
  utterance.onend = () => setStatus("idle");
  synth.speak(utterance);
}

// ===== Speech Recognition =====
let recognition;
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    processInput(transcript);
  };

  recognition.onend = () => {
    if (status === "listening") setStatus("idle");
  };
}

listeningBtn.addEventListener("click", () => {
  if (!recognition) return alert("Speech recognition not supported on this device.");
  if (status === "listening") {
    recognition.stop();
    setStatus("idle");
  } else {
    setStatus("listening");
    recognition.start();
  }
});

// ===== Status Setter =====
function setStatus(newStatus) {
  status = newStatus;
  coreOrb.className = "core-orb"; // reset classes
  coreOrb.classList.add("core-orb");
  centerIcon.textContent = "";

  switch(newStatus) {
    case "idle":
      coreOrb.style.borderColor = "rgba(79,70,229,0.2)";
      coreOrb.style.backgroundColor = "rgba(79,70,229,0.05)";
      centerIcon.textContent = "⚡";
      break;
    case "listening":
      coreOrb.style.borderColor = "rgba(236,72,153,0.5)";
      coreOrb.style.backgroundColor = "rgba(236,72,153,0.1)";
      centerIcon.textContent = "🎤";
      break;
    case "speaking":
      coreOrb.style.borderColor = "rgba(79,70,229,0.5)";
      centerIcon.textContent = "⚡";
      break;
    case "thinking":
      coreOrb.style.borderColor = "rgba(79,70,229,0.5)";
      centerIcon.textContent = "💭";
      break;
    case "analyzing":
      coreOrb.style.borderColor = "rgba(6,182,212,0.5)";
      coreOrb.style.backgroundColor = "rgba(6,182,212,0.1)";
      centerIcon.textContent = "📷";
      break;
  }
}

// ===== Update Chat =====
function updateChat() {
  chatHistory.innerHTML = "";
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.role === "user" ? "user-msg" : "assistant-msg";
    div.textContent = msg.content;
    chatHistory.appendChild(div);
  });
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// ===== Process Input =====
function processInput(text) {
  if (!text.trim()) return;
  messages.push({ role: "user", content: text });
  updateChat();
  setStatus("thinking");

  setTimeout(() => {
    let response = "";
    const inputLower = text.toLowerCase();

    if (inputLower.includes("story") || inputLower.includes("bedtime")) {
      response = "Close your eyes. Imagine a forest where the leaves are made of soft velvet and the rain smells like vanilla. In this place, gravity is just a suggestion, and the stars hum a low, comforting melody. You are safe here, drifting through the digital clouds...";
    } else if (inputLower.includes("analyze") || inputLower.includes("see") || inputLower.includes("camera")) {
      response = "I'm ready to analyze. Please activate the visual uplink by clicking the camera icon so I can diagnose what's in front of you.";
    } else if (inputLower.includes("music") || inputLower.includes("ambient")) {
      response = "Initializing deep-space frequency. I've curated a selection of lo-fi pulses designed to synchronize with your heartbeat. Can you feel the rhythm?";
    } else if (inputLower.includes("help") || inputLower.includes("what can you do")) {
      response = "I am Echo, a multi-modal entity. I can narrate bedtime stories, analyze your surroundings via video, play ambient frequencies, or simply discuss the complexities of existence.";
    } else if (inputLower.includes("time")) {
      response = `The temporal coordinates are currently ${new Date().toLocaleTimeString()}. A perfect moment to be alive.`;
    } else if (inputLower.includes("hello") || inputLower.includes("hi")) {
      const greetings = [
        "Hello there. My neural circuits are glowing with your arrival.",
        "Greetings, human. I was just optimizing my memory banks. How can I help?",
        "Echo is online and at your service. What's on your mind?"
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      response = "That's a fascinating perspective. My data models are expanding just by listening to you. Tell me more about that.";
    }

    messages.push({ role: "assistant", content: response });
    updateChat();
    speak(response);
  }, 1200);
}

// ===== Send Button =====
sendBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!chatInput.value.trim() || status !== "idle") return;
  const val = chatInput.value;
  chatInput.value = "";
  processInput(val);
});

// ===== Camera Toggle =====
function toggleCamera() {
  if (isCameraOpen) {
    cameraStream?.getTracks().forEach(track => track.stop());
    cameraVideo.srcObject = null;
    cameraOverlay.classList.add("hidden");
    isCameraOpen = false;
    setStatus("idle");
  } else {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        cameraStream = stream;
        cameraVideo.srcObject = stream;
        cameraOverlay.classList.remove("hidden");
        isCameraOpen = true;
        setStatus("analyzing");

        // Simulate Vision Analysis
        setTimeout(() => {
          const visionResponse = "Visual sensors active. I've analyzed the frame: I detect a human-centric environment with optimal lighting. No immediate structural or technical anomalies found.";
          messages.push({ role: "assistant", content: visionResponse });
          updateChat();
          speak(visionResponse);
          setStatus("idle");
        }, 3000);
      })
      .catch(err => {
        alert("Camera access is required for Video Analysis.");
        console.error(err);
      });
  }
}

document.querySelector("#cameraBtn").addEventListener("click", toggleCamera);
closeCameraBtn.addEventListener("click", toggleCamera);

// ===== Quick Actions =====
document.querySelector("#storyBtn").addEventListener("click", () => processInput("Tell me a bedtime story"));
document.querySelector("#musicBtn").addEventListener("click", () => processInput("Play ambient music"));

// ===== Help Modal =====
helpBtn.addEventListener("click", () => helpModal.classList.toggle("hidden"));
understoodBtn.addEventListener("click", () => helpModal.classList.add("hidden"));

// ===== Initial Render =====
updateChat();
setStatus("idle");
