import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

export const usePromptValues = () => {
    const { currentAppState } = useSession();
    const [systemValue, setSystemValue] = useState('');
    const [userValue, setUserValue] = useState('');
    const [continueValue, setContinueValue] = useState('');

    const currentSystemPromptText = currentAppState.systemPrompt.text;
    const currentUserPromptText = currentAppState.userPrompt.content[0].text;

    useEffect(() => {
        setSystemValue(currentSystemPromptText);
        setUserValue(currentUserPromptText);
    }, [currentSystemPromptText, currentUserPromptText]);

    return {
        systemValue,
        setSystemValue,
        userValue,
        setUserValue,
        continueValue,
        setContinueValue,
    };
};