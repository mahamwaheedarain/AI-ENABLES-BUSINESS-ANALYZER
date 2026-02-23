import React from "react";

const VoiceButton = ({ onCommand }) => {
  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support voice recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      console.log("Voice command:", text);

      if (text.includes("for")) {
        const filter = text.split("for")[1]?.trim();
        onCommand(filter);
      } else {
        onCommand();
      }
    };
  };

  return (
    <button onClick={handleVoice} style={{ padding: "10px", margin: "10px" }}>
      🎤 Speak
    </button>
  );
};

export default VoiceButton;
