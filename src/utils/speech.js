// CONT-05: Audio pronunciation via Web Speech API
let voicesLoaded = false;
let voices = [];

function initVoices() {
  if (voicesLoaded) return;
  voices = window.speechSynthesis?.getVoices() || [];
  if (voices.length > 0) {
    voicesLoaded = true;
  } else if (window.speechSynthesis?.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
    };
  }
}

export function speakWord(text) {
  const synth = window.speechSynthesis;
  if (!synth) return false;
  synth.cancel();
  initVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.8; // Slightly slower for children
  const englishVoice = voices.find(v => v.lang.startsWith('en') && v.localService);
  if (englishVoice) utterance.voice = englishVoice;
  synth.speak(utterance);
  return true;
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
