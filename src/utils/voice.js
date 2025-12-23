import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for voice recognition with proper error handling
 * @returns {Object} Voice recognition state and controls
 */
export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            return;
        }

        try {
            setIsSupported(true);
            const recognizer = new SpeechRecognitionAPI();
            recognizer.continuous = false;
            recognizer.interimResults = false;
            recognizer.lang = 'en-US';

            recognizer.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognizer.onend = () => {
                setIsListening(false);
            };

            recognizer.onresult = (event) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
            };

            recognizer.onerror = (event) => {
                setError(event.error);
                setIsListening(false);

                // Log error for debugging but don't crash
                console.warn('[VoiceRecognition] Error:', event.error);
            };

            recognizer.onnomatch = () => {
                setError('no-match');
            };

            setRecognition(recognizer);
        } catch (err) {
            console.error('[VoiceRecognition] Failed to initialize:', err);
            setIsSupported(false);
        }
    }, []);

    const startListening = useCallback(() => {
        if (!recognition || isListening) return;

        try {
            setTranscript('');
            setError(null);
            recognition.start();
        } catch (err) {
            // Handle case where recognition is already started
            console.warn('[VoiceRecognition] Start failed:', err);
            setError('start-failed');
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (!recognition || !isListening) return;

        try {
            recognition.stop();
        } catch (err) {
            console.warn('[VoiceRecognition] Stop failed:', err);
        }
    }, [recognition, isListening]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        isSupported,
        setTranscript,
        error,
        clearError
    };
};
