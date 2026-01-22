const messagesEl = document.querySelector(".flex-1.overflow-y-auto");
const inputEl = document.querySelector('input[type="text"]');
const sendBtn = document.querySelector('button[type="submit"]');
const listenBtn = document.querySelector("button:has(svg.Zap)");
const storyBtn = document.querySelector("button:contains('Bedtime Story')");
const cameraBtn = document.querySelector("button:contains('Vision Analysis')");
const muteBtn = document.querySelector("button:has(svg.Volume2), button:has(svg.VolumeX)");
const videoEl = document.querySelector("video");
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
};
const responses = Array.from({length:100}, (_,i)=>`Response ${i+1}: Echo says hello and processes your input.`);

function renderMessages(){
  messagesEl.innerHTML="";
  messages.forEach(msg=>{
    const div=document.createElement("div");
    div.className=msg.role==="user"?"justify-end":"justify-start";
    div.innerHTML=`<div class="${msg.role==="user"?"bg-indigo-600 text-white rounded-tr-none":"bg-white/5 text-slate-300 border border-white/10 rounded-tl-none"} max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed">${msg.content}</div>`;
    messagesEl.appendChild(div);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

const messages=[{role:"assistant",content:"System online. I am Echo. How can I assist your neural pathways today?"}];

function speak(text){
  if(isMuted) return;
  synth.cancel();
  const utter=new SpeechSynthesisUtterance(text);
  utter.voice=synth.getVoices().find(v=>v.name.includes("Female")||v.name.includes("Google"))||synth.getVoices()[0];
  utter.rate=0.95;utter.pitch=1.05;
  synth.speak(utter);
}

function processInput(text){
  if(!text.trim()) return;
  messages.push({role:"user",content:text});
  renderMessages();
  status="thinking";
  setTimeout(()=>{
    let response="";
    const lower=text.toLowerCase();
    if(lower.includes("story")||lower.includes("bedtime")){
      ambientAudio.src=soundEffects.wind.src;
      ambientAudio.play();
      response="Close your eyes. Imagine a forest where leaves whisper in the wind, rain patters softly, and stars hum a calming tune. You drift through a dreamscape, floating among digital clouds. Every step echoes with tranquility as the moonlight dances across a crystal river. The wind swirls around you, carrying the scent of pine and wildflowers. Creatures of light flutter past, singing melodies that resonate with your heartbeat. Deep in the forest, you discover a glowing tree that radiates warmth. Streams of stardust flow from its branches, illuminating the path forward. Distant chimes signal the beginning of your journey deeper into serenity. Your senses harmonize with the universe, each breath syncing with the gentle rhythm of the cosmos. The journey continues as the night sky stretches infinitely above, each star a guardian of your dreams...";
    } else if(lower.includes("music")||lower.includes("ambient")){
      ambientAudio.src=soundEffects.forest.src;
      ambientAudio.play();
      response="Initializing ambient frequencies. Feel the rhythm sync with your mind.";
    } else if(lower.includes("camera")||lower.includes("analyze")){
      response="Activate the camera to analyze surroundings.";
    } else if(lower.includes("hello")||lower.includes("hi")){
      response=responses[Math.floor(Math.random()*20)];
    } else if(lower.includes("time")){
      response=`The current time is ${new Date().toLocaleTimeString()}.`;
    } else {
      response=responses[Math.floor(Math.random()*responses.length)];
    }
    messages.push({role:"assistant",content:response});
    renderMessages();
    speak(response);
    status="idle";
  },1200);
}

sendBtn.addEventListener("click",e=>{
  e.preventDefault();
  const val=inputEl.value;
  inputEl.value="";
  processInput(val);
});

storyBtn.addEventListener("click",()=>processInput("Tell me a bedtime story"));

listenBtn.addEventListener("click",()=>{
  if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)) return alert("Speech Recognition not supported");
  if(!recognition){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    recognition=new SR();
    recognition.continuous=false;
    recognition.interimResults=false;
    recognition.lang="en-US";
    recognition.onresult=e=>processInput(e.results[0][0].transcript);
    recognition.onend=()=>{isListening=false;listenBtn.classList.remove("listening");};
  }
  if(!isListening){ recognition.start(); isListening=true; listenBtn.classList.add("listening"); } 
  else{ recognition.stop(); isListening=false; listenBtn.classList.remove("listening"); }
});

muteBtn.addEventListener("click",()=>{ isMuted=!isMuted; muteBtn.classList.toggle("muted"); });

cameraBtn.addEventListener("click",async ()=>{
  if(isCameraOpen){cameraStream.getTracks().forEach(t=>t.stop()); videoEl.srcObject=null; isCameraOpen=false; return;}
  try{
    cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    videoEl.srcObject=cameraStream;
    isCameraOpen=true;
    setTimeout(()=>processInput("Camera analysis complete: human-centric environment, optimal lighting."),3000);
  }catch{alert("Camera access is required.");}
});

renderMessages();
