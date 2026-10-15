import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';

export interface UseVoiceReturn {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  audioData: Uint8Array;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
  error: string | null;
  isSupported: boolean;
}

export const useVoice = (): UseVoiceReturn => {
  const { voice, setRecording, setTranscript, setAudioLevel } = useStore();
  const [transcript, setLocalTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(32));
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Audio waveform animation loop
  const updateAudioData = useCallback(() => {
    if (!analyserRef.current) return;

    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    setAudioData(data);

    // Compute average audio level (0-100)
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = Math.round((sum / data.length) * (100 / 255));
    setAudioLevel(avg);

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [setAudioLevel]);

  // Clean up audio context & recognition
  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioData(new Uint8Array(32));
    setAudioLevel(0);
  }, [setAudioLevel]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
    cleanupAudio();
    setRecording(false);
  }, [cleanupAudio, setRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setInterimTranscript('');

    // 1. Initialize Microphone Audio Stream for Visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: voice.voiceConfig.echoCancellation,
          noiseSuppression: voice.voiceConfig.noiseSuppression,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      updateAudioData();
    } catch (err: any) {
      console.warn('[useVoice] AudioContext access denied or failed:', err);
      // Still proceed with speech recognition even if visualizer fails
    }

    // 2. Initialize Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setRecording(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voice.voiceConfig.language || 'en-US';

      recognition.onstart = () => {
        setRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          setLocalTranscript((prev) => {
            const updated = prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim();
            setTranscript(updated);
            return updated;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        console.error('[useVoice] Speech recognition error:', event.error);
        setError(`Speech error: ${event.error}`);
      };

      recognition.onend = () => {
        // If still supposed to be recording, restart or stop
        if (voice.isRecording) {
          stopRecording();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('[useVoice] Failed to start recognition:', err);
      setError(`Speech recognition failed: ${err?.message || String(err)}`);
      stopRecording();
    }
  }, [
    voice.voiceConfig,
    voice.isRecording,
    setRecording,
    setTranscript,
    updateAudioData,
    stopRecording,
  ]);

  const resetTranscript = useCallback(() => {
    setLocalTranscript('');
    setInterimTranscript('');
    setTranscript('');
  }, [setTranscript]);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [cleanupAudio]);

  return {
    isRecording: voice.isRecording,
    transcript: transcript || voice.transcript,
    interimTranscript,
    audioData,
    audioLevel: voice.audioLevel,
    startRecording,
    stopRecording,
    resetTranscript,
    error,
    isSupported,
  };
};
