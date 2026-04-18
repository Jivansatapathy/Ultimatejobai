import { useState, useEffect, useRef, useCallback } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { ResumeForm } from "./form/ResumeForm";
import { ResumePreview } from "./preview/ResumePreview";
import { useResume } from "@/hooks/useResume";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AtsOptimizationModal } from "./AtsOptimizationModal";
import { Zap } from "lucide-react";

const A4_WIDTH_PX = 794;

export function ResumeBuilder() {
    const { activeResume, loadResume, resumes } = useResume();
    const navigate = useNavigate();
    const { id } = useParams();
    const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id && (!activeResume || activeResume.id !== id)) {
            loadResume(id);
        }
    }, [id, activeResume, loadResume]);

    const updateScale = useCallback(() => {
        if (!panelRef.current) return;
        const available = panelRef.current.offsetWidth - 48;
        setScale(Math.min(1, available / A4_WIDTH_PX));
    }, []);

    useEffect(() => {
        updateScale();
        const obs = new ResizeObserver(updateScale);
        if (panelRef.current) obs.observe(panelRef.current);
        return () => obs.disconnect();
    }, [updateScale]);

    if (!activeResume) {
        if (resumes.length === 0)
            return <div className="h-screen flex items-center justify-center">Loading…</div>;
        return <div className="h-screen flex items-center justify-center">Resume not found</div>;
    }

    const handlePrint = useCallback(() => {
        const el = document.getElementById("resume-preview-content");
        if (!el) return;

        const css = `
            /* 🔥 REMOVE browser headers */
            @page {
                size: A4;
                margin: 0;
            }

            html, body {
                margin: 0;
                padding: 0;
                background: white;
                font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            }

            *, *::before, *::after {
                box-sizing: border-box;
            }

            /* ✅ KEY: internal padding instead of page margin */
            .resume-root {
                padding: 18mm 16mm 16mm 16mm;
            }

            .resume-a4-page {
                width: 100%;
                font-size: 13px;
                line-height: 1.6;
                color: #111;
            }

            .resume-section {
                break-inside: auto;
                page-break-inside: auto;
            }

            .resume-section-heading {
                margin-top: 6mm;
                break-after: avoid;
                page-break-after: avoid;
            }

            .resume-section-heading:first-child {
                margin-top: 0;
            }

            .entry-header {
                break-after: avoid;
                page-break-after: avoid;
            }

            .resume-entry {
                break-inside: auto;
                page-break-inside: auto;
            }

            ul {
                padding-left: 18px;
                margin: 0;
            }

            li {
                margin-bottom: 4px;
            }

            a {
                color: #1d4ed8;
                text-decoration: none;
                font-style: italic;
            }
        `;

        const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Resume</title>
<style>${css}</style>
</head>
<body>${el.outerHTML}</body>
</html>`;

        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) {
            toast.error("Allow pop-ups and try again.");
            return;
        }

        win.document.write(html);
        win.document.close();
        win.focus();

        setTimeout(() => {
            win.print();
            win.close();
        }, 400);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/resume")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-sm font-semibold">
                        {activeResume.name || "Untitled Resume"}
                    </h1>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => setIsAtsModalOpen(true)} size="sm">
                        <Zap className="h-4 w-4" />
                        Analyze
                    </Button>

                    <Button onClick={handlePrint} size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </header>

            <AtsOptimizationModal
                open={isAtsModalOpen}
                onOpenChange={setIsAtsModalOpen}
                onSuccess={() => {}}
            />

            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={45}>
                        <ScrollArea className="h-full p-6">
                            <ResumeForm />
                        </ScrollArea>
                    </ResizablePanel>

                    <ResizableHandle />

                    <ResizablePanel defaultSize={55}>
                        <div
                            ref={panelRef}
                            className="h-full overflow-y-auto bg-[#c8c8c8]"
                            style={{ padding: "28px 20px" }}
                        >
                            <div
                                style={{
                                    zoom: scale,
                                    width: `${A4_WIDTH_PX}px`,
                                    margin: "0 auto",
                                }}
                            >
                                <ResumePreview data={activeResume} />
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

export default ResumeBuilder;