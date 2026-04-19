import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface TourStep {
    target?: string;        // CSS selector or data-tour value  e.g. '[data-tour="upload-btn"]'
    title: string;
    description: string;
    position?: "top" | "bottom" | "left" | "right" | "center";
}

interface TourContextType {
    active: boolean;
    steps: TourStep[];
    currentStep: number;
    startTour: (steps: TourStep[]) => void;
    next: () => void;
    prev: () => void;
    end: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
    const [active, setActive] = useState(false);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [currentStep, setCurrentStep] = useState(0);

    const startTour = useCallback((s: TourStep[]) => {
        setSteps(s);
        setCurrentStep(0);
        setActive(true);
    }, []);

    const next = useCallback(() => {
        setCurrentStep(prev => {
            if (prev >= steps.length - 1) { setActive(false); return 0; }
            return prev + 1;
        });
    }, [steps.length]);

    const prev = useCallback(() => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    }, []);

    const end = useCallback(() => {
        setActive(false);
        setCurrentStep(0);
    }, []);

    return (
        <TourContext.Provider value={{ active, steps, currentStep, startTour, next, prev, end }}>
            {children}
        </TourContext.Provider>
    );
}

export function useTour() {
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error("useTour must be used within TourProvider");
    return ctx;
}
