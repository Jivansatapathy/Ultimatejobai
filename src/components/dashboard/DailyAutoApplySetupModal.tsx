import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

interface DailyAutoApplySetupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    registeredEmail: string;
    currentNotifEmail: string;
    onConfirm: (notifEmail: string) => Promise<void>;
}

export function DailyAutoApplySetupModal({
    open,
    onOpenChange,
    registeredEmail,
    currentNotifEmail,
    onConfirm,
}: DailyAutoApplySetupModalProps) {
    const isOther = currentNotifEmail && currentNotifEmail !== registeredEmail;
    const [emailChoice, setEmailChoice] = useState<"registered" | "other">(isOther ? "other" : "registered");
    const [otherEmail, setOtherEmail] = useState(isOther ? currentNotifEmail : "");
    const [saving, setSaving] = useState(false);

    // Re-sync when the modal is opened with fresh props
    useEffect(() => {
        if (open) {
            const other = currentNotifEmail && currentNotifEmail !== registeredEmail;
            setEmailChoice(other ? "other" : "registered");
            setOtherEmail(other ? currentNotifEmail : "");
        }
    }, [open, currentNotifEmail, registeredEmail]);

    const finalEmail = emailChoice === "registered" ? registeredEmail : otherEmail.trim();
    const canConfirm = emailChoice === "registered" || !!otherEmail.trim();

    const handleConfirm = async () => {
        if (!canConfirm) return;
        setSaving(true);
        try {
            await onConfirm(finalEmail);
            onOpenChange(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Mail className="h-5 w-5 text-teal-500" />
                        Daily Apply Update Emails
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Apex™ will send you a morning summary every time it applies to jobs on your behalf. Where should those updates go?
                    </p>

                    <div className="space-y-2.5">
                        {/* Registered email option */}
                        <button
                            type="button"
                            onClick={() => setEmailChoice("registered")}
                            className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-colors ${
                                emailChoice === "registered"
                                    ? "border-teal-500 bg-teal-50/60"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                            <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                emailChoice === "registered" ? "border-teal-500" : "border-gray-300"
                            }`}>
                                {emailChoice === "registered" && (
                                    <div className="h-2 w-2 rounded-full bg-teal-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{registeredEmail}</p>
                                <p className="text-xs text-gray-400 mt-0.5">Your registered email</p>
                            </div>
                            {emailChoice === "registered" && (
                                <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            )}
                        </button>

                        {/* Other email option */}
                        <button
                            type="button"
                            onClick={() => setEmailChoice("other")}
                            className={`w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-colors ${
                                emailChoice === "other"
                                    ? "border-teal-500 bg-teal-50/60"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                            <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                emailChoice === "other" ? "border-teal-500" : "border-gray-300"
                            }`}>
                                {emailChoice === "other" && (
                                    <div className="h-2 w-2 rounded-full bg-teal-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Use a different email</p>
                                {emailChoice === "other" && (
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={otherEmail}
                                        onChange={(e) => setOtherEmail(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleConfirm(); }}
                                        className="mt-2 text-sm h-8 bg-white"
                                        autoFocus
                                    />
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-2 pt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving} className="text-gray-500">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={saving || !canConfirm}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {saving ? "Saving…" : "Enable Auto-Apply"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
