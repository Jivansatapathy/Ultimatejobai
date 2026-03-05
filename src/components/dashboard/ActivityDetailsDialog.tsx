
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3 } from "lucide-react";

interface ActivityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDetailsDialog({
  open,
  onOpenChange,
}: ActivityDetailsDialogProps) {
  // Mock data for the detailed view
  const detailedStats = [
    { date: "Today", applications: 12, views: 45, responses: 2 },
    { date: "Yesterday", applications: 8, views: 32, responses: 1 },
    { date: "Jan 08", applications: 15, views: 50, responses: 3 },
    { date: "Jan 07", applications: 5, views: 20, responses: 0 },
    { date: "Jan 06", applications: 10, views: 40, responses: 1 },
    { date: "Jan 05", applications: 12, views: 42, responses: 2 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Activity Details
          </DialogTitle>
          <DialogDescription>
            A detailed breakdown of your job search activity over the last week.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {detailedStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="font-medium">{stat.date}</div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Applications</span>
                    <span className="font-bold">{stat.applications}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Profile Views</span>
                    <span className="font-bold">{stat.views}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Responses</span>
                    <span className="font-bold text-success">{stat.responses}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
