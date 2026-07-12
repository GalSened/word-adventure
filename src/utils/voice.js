import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for voice recognition with proper error handling
 * @returns {Object} Voice recognition state and controls
 */
const getSpeechRecognitionAPI = () =>
    typeof window !== 'undefined'
        ? (window.SpeechRecognition || window.webkitSpeechRecognition)
        : undefined;

export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    // Support is known synchronously — no effect round-trip needed
    const [isSupported, setIsSupported] = useState(() => !!getSpeechRecognitionAPI());
    // The recognizer never drives rendering — keep it in a ref, not state
    const recognitionRef = useRef(null);
    const [error, setError] = useState(null);

    // Lazily construct the recognizer on first use (startListening is always
    // a user gesture). Keeps the mount effect side-effect-free except cleanup.
    const ensureRecognizer = useCallback(() => {
        if (recognitionRef.current) return recognitionRef.current;

        const SpeechRecognitionAPI = getSpeechRecognitionAPI();
        if (!SpeechRecognitionAPI) return null;

        try {
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

            recognitionRef.current = recognizer;
            return recognizer;
        } catch (err) {
            console.error('[VoiceRecognition] Failed to initialize:', err);
            setIsSupported(false);
            return null;
        }
    }, []);

    // Abort any in-flight recognition on unmount
    useEffect(() => {
        return () => {
            const recognizer = recognitionRef.current;
            recognitionRef.current = null;
            try {
                recognizer?.abort();
            } catch {
                // already stopped
            }
        };
    }, []);

    const startListening = useCallback(() => {
        const recognizer = ensureRecognizer();
        if (!recognizer || isListening) return;

        try {
            setTranscript('');
            setError(null);
            recognizer.start();
        } catch (err) {
            // Handle case where recognition is already started
            console.warn('[VoiceRecognition] Start failed:', err);
            setError('start-failed');
        }
    }, [isListening, ensureRecognizer]);

    const stopListening = useCallback(() => {
        if (!recognitionRef.current || !isListening) return;

        try {
            recognitionRef.current.stop();
        } catch (err) {
            console.warn('[VoiceRecognition] Stop failed:', err);
        }
    }, [isListening]);

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
