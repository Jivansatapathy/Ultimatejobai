import { HelpCircle } from "lucide-react";
import { useTour, TourStep } from "./TourContext";

interface TourButtonProps {
    steps: TourStep[];
    className?: string;
    label?: string;
}

export default function TourButton({ steps, className = "", label = "Take a tour" }: TourButtonProps) {
    const { startTour } = useTour();
    return (
        <button
            onClick={() => startTour(steps)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold text-violet-500 hover:text-violet-400 bg-violet-500/10 hover:bg-violet-500/15 border border-violet-500/20 px-3 py-1.5 rounded-full transition-colors ${className}`}
        >
            <HelpCircle className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}
