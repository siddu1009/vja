
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, VistaData, SystemStatus, VistaEvent } from './types';
import { getAiResponse, getAiSpeech } from './services/geminiService';
import { MOCK_VISTA_DATA, MOCK_SYSTEM_STATUS } from './constants';
import StatusPanel from './components/StatusPanel';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import { VjaCoreIcon } from './components/icons';
import { decode, decodeAudioData } from './utils/audio';

// Custom hook to get the previous value of a prop or state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [vistaData, setVistaData] = useState<VistaData>(MOCK_VISTA_DATA[0]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(MOCK_SYSTEM_STATUS[0]);

  const vistaIndex = useRef(0);
  const systemIndex = useRef(0);
  const prevVistaData = usePrevious(vistaData);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSpokenMessageIndex = useRef<number>(-1);

  // Initialize AudioContext
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        // FIX: Cast window to `any` to access vendor-prefixed `webkitAudioContext` without TypeScript errors.
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
      }
    }
  }, []);

  const playAudio = useCallback(async (text: string) => {
    if (!audioContextRef.current) return;
    try {
      const base64Audio = await getAiSpeech(text);
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          audioContextRef.current,
          24000,
          1,
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
    }
  }, []);
  
  // Effect to speak new model messages
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessageIndex = chatHistory.length - 1;
      const lastMessage = chatHistory[lastMessageIndex];

      if (lastMessage.role === 'model' && lastMessageIndex > lastSpokenMessageIndex.current) {
        lastSpokenMessageIndex.current = lastMessageIndex;
        playAudio(lastMessage.content);
      }
    }
  }, [chatHistory, playAudio]);


  useEffect(() => {
    // Initial greeting
    setChatHistory([{
      role: 'model',
      content: 'VJA-Core online. All systems nominal. How may I assist you?'
    }]);
  }, []);

  // Proactive response simulation
  useEffect(() => {
    if (!vistaData.new_events || !prevVistaData) return;

    // Define the trigger event
    const isWorkspaceTrigger = (event: VistaEvent) => 
      event.event === 'object_stationary' && 
      event.class === 'person' && 
      event.location_zone === 'desk_chair';

    const wasTriggeredPreviously = prevVistaData.new_events?.some(isWorkspaceTrigger) ?? false;
    const isTriggeredNow = vistaData.new_events.some(isWorkspaceTrigger);

    // If the trigger event is new, send a proactive message
    if (isTriggeredNow && !wasTriggeredPreviously) {
      const proactiveMessage: ChatMessage = {
        role: 'model',
        content: "Welcome. I've activated your workspace."
      };
      setChatHistory(prev => [...prev, proactiveMessage]);
    }
  }, [vistaData, prevVistaData]);


  useEffect(() => {
    const vistaInterval = setInterval(() => {
      vistaIndex.current = (vistaIndex.current + 1) % MOCK_VISTA_DATA.length;
      setVistaData(MOCK_VISTA_DATA[vistaIndex.current]);
    }, 7000);

    const systemInterval = setInterval(() => {
      systemIndex.current = (systemIndex.current + 1) % MOCK_SYSTEM_STATUS.length;
      setSystemStatus(MOCK_SYSTEM_STATUS[systemIndex.current]);
    }, 10000);

    return () => {
      clearInterval(vistaInterval);
      clearInterval(systemInterval);
    };
  }, []);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    setIsLoading(true);

    try {
      const response = await getAiResponse(userInput, vistaData, systemStatus, updatedChatHistory);
      const newAiMessage: ChatMessage = { role: 'model', content: response };
      setChatHistory(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Apologies, I am experiencing a communication issue with my core logic." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chatHistory, vistaData, systemStatus]);

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-200">
      <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg bg-slate-950/50 border-r border-cyan-500/10 p-4 lg:p-6 flex flex-col">
        <div className="flex items-center space-x-3 mb-6">
          <VjaCoreIcon className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">VJA-CORE</h1>
            <p className="text-xs text-cyan-400 font-mono">SYNTHESIS ENGINE</p>
          </div>
        </div>
        <StatusPanel vistaData={vistaData} systemStatus={systemStatus} />
      </div>
      <div className="flex flex-1 flex-col h-screen">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ChatWindow chatHistory={chatHistory} isLoading={isLoading} />
        </main>
        <footer className="p-4 md:p-6 border-t border-cyan-500/10">
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
        </footer>
      </div>
    </div>
  );
};

export default App;