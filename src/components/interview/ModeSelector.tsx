import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Video, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
    onSelect: (mode: "text" | "audio") => void;
}

export const ModeSelector = ({ onSelect }: ModeSelectorProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            <div className="text-center space-y-4 mb-12">
                <h2 className="text-4xl font-bold tracking-tight">Choose Interview Mode</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Practice your skills with a traditional text-based interface or an immersive AI voice interview.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                <Card
                    className="cursor-pointer transition-all hover:scale-105 hover:border-primary/50"
                    onClick={() => onSelect("text")}
                >
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Text Interview</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            A classic chat-based interface. Practice formulating your answers at your own pace without the pressure of speaking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-primary flex items-center gap-2 mt-4">
                            Select Mode →
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer transition-all hover:scale-105 hover:border-primary/50 relative overflow-hidden"
                    onClick={() => onSelect("audio")}
                >
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-bold">
                        NEW
                    </div>
                    <CardHeader>
                        <div className="flex gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Volume2 className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Audio Interview</CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                            An immersive experience powered by GROQ. Speak naturally and hear the AI recruiter talk back!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-primary flex items-center gap-2 mt-4">
                            Select Voice Mode →
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
