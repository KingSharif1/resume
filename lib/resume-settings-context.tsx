'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SectionType } from '@/lib/resume-schema';

export type FontFamily = 'Inter' | 'Roboto' | 'Arial' | 'Times New Roman' | 'Helvetica' | 'Georgia' | 'Courier New' | 'Verdana';
export type DateFormat = 'MM/YYYY' | 'MMM YYYY' | 'Month YYYY' | 'YYYY';
export type SectionSpacing = 'compact' | 'normal' | 'spacious';

export interface ResumeSettings {
    template: 'Modern' | 'Professional' | 'Creative' | 'basic';
    theme: {
        accentColor: string;
    };
    font: {
        primary: FontFamily;
        secondary: FontFamily;
        headingSize: number; // percentage, e.g., 100
        bodySize: number; // percentage, e.g., 100
        lineSpacing: number; // percentage, e.g., 100
    };
    layout: {
        format: 'A4' | 'Letter';
        margins: {
            top: number; // inches
            bottom: number;
            left: number;
            right: number;
        };
        padding: {
            section: number; // px
            title: number; // px
            content: number; // px
        };
        headerAlignment: 'left' | 'center' | 'right';
        dateFormat: DateFormat;
        dateAlignment: 'left' | 'right';
        skillsLayout: 'comma' | 'columns' | 'grid';
        skillsSort: 'none' | 'asc' | 'desc';
        sectionOrder: SectionType[];
    };
}

const defaultSettings: ResumeSettings = {
    template: 'basic',
    theme: {
        accentColor: '#000000',
    },
    font: {
        primary: 'Inter',
        secondary: 'Inter',
        headingSize: 100,
        bodySize: 100,
        lineSpacing: 100,
    },
    layout: {
        format: 'Letter',
        margins: {
            top: 0.5,
            bottom: 0.5,
            left: 0.5,
            right: 0.5,
        },
        padding: {
            section: 24,
            title: 16,
            content: 8,
        },
        headerAlignment: 'left',
        dateFormat: 'MMM YYYY',
        dateAlignment: 'right',
        skillsLayout: 'comma',
        skillsSort: 'none',
        sectionOrder: [
            'contact',
            'summary',
            'experience',
            'education',
            'projects',
            'skills',
            'certifications',
            'volunteer',
            'awards',
            'publications',
            'languages',
            'references',
            'interests',
            'custom'
        ],
    },
};

interface ResumeSettingsContextType {
    settings: ResumeSettings;
    updateSettings: (updates: Partial<ResumeSettings> | ((prev: ResumeSettings) => Partial<ResumeSettings>)) => void;
    updateFontSettings: (updates: Partial<ResumeSettings['font']>) => void;
    updateLayoutSettings: (updates: Partial<ResumeSettings['layout']>) => void;
    updateThemeSettings: (updates: Partial<ResumeSettings['theme']>) => void;
    resetSettings: () => void;
}

const ResumeSettingsContext = createContext<ResumeSettingsContextType | undefined>(undefined);

export function ResumeSettingsProvider({ children, initialSettings }: { children: ReactNode; initialSettings?: ResumeSettings }) {
    const [settings, setSettings] = useState<ResumeSettings>(initialSettings || defaultSettings);

    // Update settings if initialSettings changes (e.g. on load)
    React.useEffect(() => {
        if (initialSettings) {
            setSettings(initialSettings);
        }
    }, [initialSettings]);

    const updateSettings = (updates: Partial<ResumeSettings> | ((prev: ResumeSettings) => Partial<ResumeSettings>)) => {
        setSettings((prev) => {
            const newValues = typeof updates === 'function' ? updates(prev) : updates;
            return { ...prev, ...newValues };
        });
    };

    const updateFontSettings = (updates: Partial<ResumeSettings['font']>) => {
        setSettings((prev) => ({
            ...prev,
            font: { ...prev.font, ...updates },
        }));
    };

    const updateLayoutSettings = (updates: Partial<ResumeSettings['layout']>) => {
        setSettings((prev) => ({
            ...prev,
            layout: { ...prev.layout, ...updates },
        }));
    };

    const updateThemeSettings = (updates: Partial<ResumeSettings['theme']>) => {
        setSettings((prev) => ({
            ...prev,
            theme: { ...(prev.theme || defaultSettings.theme), ...updates },
        }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    return (
        <ResumeSettingsContext.Provider
            value={{
                settings,
                updateSettings,
                updateFontSettings,
                updateLayoutSettings,
                updateThemeSettings,
                resetSettings,
            }}
        >
            {children}
        </ResumeSettingsContext.Provider>
    );
}

export function useResumeSettings() {
    const context = useContext(ResumeSettingsContext);
    if (context === undefined) {
        throw new Error('useResumeSettings must be used within a ResumeSettingsProvider');
    }
    return context;
}
