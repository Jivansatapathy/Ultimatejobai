
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface AutoApplySettingsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AutoApplySettingsSheet({
    open,
    onOpenChange,
}: AutoApplySettingsSheetProps) {
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onOpenChange(false);
            toast.success("Settings saved successfully", {
                description: "Your auto-apply preferences have been updated.",
            });
        }, 1000);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Auto-Apply Settings</SheetTitle>
                    <SheetDescription>
                        Configure your automated job application preferences.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="grid gap-2">
                        <Label htmlFor="daily-limit">Daily Application Limit</Label>
                        <Input id="daily-limit" type="number" defaultValue="50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="keywords">Keywords (comma separated)</Label>
                        <Input
                            id="keywords"
                            defaultValue="React, TypeScript, Frontend, Remote"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="locations">Preferred Locations</Label>
                        <Input id="locations" defaultValue="San Francisco, New York, Remote" />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Remote Only</Label>
                            <div className="text-sm text-muted-foreground">
                                Only apply to remote positions
                            </div>
                        </div>
                        <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">Quick Apply</Label>
                            <div className="text-sm text-muted-foreground">
                                Skip jobs requiring cover letters
                            </div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? "Saving..." : "Save Preferences"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
