
import React, { useState, useRef } from 'react';
import { Button, Input } from 'antd';

// Voice output (text-to-speech)
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Text-to-speech not supported');
    return;
  }
  const utter = new window.SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

const agents = ['supervisor', 'worker', 'critic'];

export default function SupervisorOrchestrationPanel() {
  const [messages, setMessages] = useState<any[]>([]);
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const sendMessage = async (from: string, to: string, content: string) => {
    const res = await fetch('/api/agents/orchestrate/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, content }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, data]);
  };

  // Voice input (speech-to-text)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return alert('SpeechRecognition not supported');
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      setVoiceInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };



// Voice output (text-to-speech)


// Voice output (text-to-speech)
// Move to top-level scope to satisfy linter and ensure correct usage
function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Text-to-speech not supported');
    return;
  }
  const utter = new window.SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utter);
}

  return (
    <div>
      <h3>Supervisor Agent Orchestration</h3>
      <div>
        {agents.map((from) => (
          agents.map((to) => (
            from !== to && (
              <Button key={from + to} type="primary" onClick={() => sendMessage(from, to, `Hello from ${from} to ${to}`)}>
                {`Send from ${from} to ${to}`}
              </Button>
            )
          ))
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <h4>Voice Command to Supervisor</h4>
        <Button type="primary" onClick={startListening} disabled={isListening} style={{ marginRight: 8 }}>
          {isListening ? 'Listening...' : 'Start Voice Command'}
        </Button>
        <Input
          placeholder="Or type your command"
          value={voiceInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoiceInput(e.target.value)}
          style={{ width: 320, marginRight: 8 }}
        />
        <Button
          type="default"
          onClick={() => {
            if (voiceInput) sendMessage('user', 'supervisor', voiceInput);
            setVoiceInput('');
          }}
        >
          Send to Supervisor
        </Button>
      </div>
      <div style={{ marginTop: 16 }}>
        <h4>Messages</h4>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>
              {msg.from} → {msg.to}: {msg.content}
              {msg.to === 'user' && (
                <Button type="link" onClick={() => speak(msg.content)} style={{ marginLeft: 8 }}>
                  🔊 Listen
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
