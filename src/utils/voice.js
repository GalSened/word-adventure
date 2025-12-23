import { useState, useEffect, useCallback } from 'react';

export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognizer = new SpeechRecognition();
            recognizer.continuous = false;
            recognizer.interimResults = false;
            recognizer.lang = 'en-US';

            recognizer.onstart = () => setIsListening(true);
            recognizer.onend = () => setIsListening(false);
            recognizer.onresult = (event) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
            };

            setRecognition(recognizer);
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            setTranscript('');
            recognition.start();
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
        }
    }, [recognition, isListening]);

    return { isListening, transcript, startListening, stopListening, isSupported, setTranscript };
};
