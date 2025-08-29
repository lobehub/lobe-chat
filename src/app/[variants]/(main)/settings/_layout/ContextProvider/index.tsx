'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface SettingsContextType {
    showOpenAIApiKey?: boolean;
    showOpenAIProxyUrl?: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettingsContext must be used within SettingsContextProvider');
    }
    return context;
};

export const SettingsContextProvider = ({
    children,
    value,
}: {
    children: ReactNode,
    value: SettingsContextType
}) => {
    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContextProvider;