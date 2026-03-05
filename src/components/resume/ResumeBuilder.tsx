import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Download, FileText, CheckCircle2 } from "lucide-react";
import { ResumeForm } from "./form/ResumeForm";
import { ResumePreview } from "./preview/ResumePreview";
import { useResume } from "@/hooks/useResume";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";

export function ResumeBuilder() {
    const { activeResume, saveResume, loadResume, resumes } = useResume();
    const navigate = useNavigate();
    const { id } = useParams();
    const [activePercentage, setActivePercentage] = useState(0);

    useEffect(() => {
        if (id && (!activeResume || activeResume.id !== id)) {
            loadResume(id);
        }
    }, [id, activeResume, loadResume]);

    // If ID is present but no activeResume found in context (after loading), wait a bit or show loading.
    // We need to handle the case where resumes list might be empty initially if just loaded.
    // But context loads from localStorage in useEffect, which might be async-ish (renders once empty).

    if (!activeResume) {
        if (resumes.length === 0) {
            // still loading resumes from localstorage potentially
            return <div className="h-screen flex items-center justify-center">Loading...</div>;
        }
        // If we have resumes but activeResume is null, it means ID invalid
        // navigate("/resume");
        // return null;
        return <div className="h-screen flex items-center justify-center">Resume not found</div>;
    }

    const handleSave = () => {
        saveResume();
        toast.success("Resume saved successfully");
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/resume")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="font-semibold">{activeResume.name || "Untitled Resume"}</h1>
                        <span className="text-xs text-muted-foreground">ATS Score: {activeResume.score}%</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                    <Button size="sm" className="gap-2" onClick={() => window.print()}>
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    {/* Form Side */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <ScrollArea className="h-full">
                            <div className="p-6">
                                <ResumeForm />
                            </div>
                        </ScrollArea>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Preview Side */}
                    <ResizablePanel defaultSize={50} minSize={30}>
                        <div className="h-full bg-secondary/30 p-8 flex justify-center overflow-auto print:p-0 print:bg-white">
                            <div className="w-full max-w-[210mm] shadow-xl print:shadow-none">
                                <ResumePreview data={activeResume} />
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}
