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

const detailedStats = [
  { date: "Today",     applications: 12, views: 45, responses: 2 },
  { date: "Yesterday", applications: 8,  views: 32, responses: 1 },
  { date: "Jan 08",    applications: 15, views: 50, responses: 3 },
  { date: "Jan 07",    applications: 5,  views: 20, responses: 0 },
  { date: "Jan 06",    applications: 10, views: 40, responses: 1 },
  { date: "Jan 05",    applications: 12, views: 42, responses: 2 },
];

export function ActivityDetailsDialog({ open, onOpenChange }: ActivityDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-0 bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl gap-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-7 py-5 border-b border-zinc-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <DialogTitle className="text-base font-extrabold text-black tracking-tight">
              Activity Details
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-0.5 font-medium">
              Breakdown of your job search activity over the last week.
            </DialogDescription>
          </div>
        </div>

        {/* Column headings */}
        <div className="grid grid-cols-4 gap-4 px-7 py-3 bg-zinc-50 border-b border-zinc-100">
          {["Date", "Applications", "Profile Views", "Responses"].map((h) => (
            <p key={h} className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{h}</p>
          ))}
        </div>

        <ScrollArea className="h-[340px]">
          <div className="px-7 py-3 divide-y divide-zinc-100">
            {detailedStats.map((stat, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 py-4 items-center">
                <p className="text-sm font-semibold text-black">{stat.date}</p>
                <p className="text-sm font-bold text-black">{stat.applications}</p>
                <p className="text-sm font-bold text-zinc-500">{stat.views}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-black">{stat.responses}</span>
                  {stat.responses > 0 && (
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      +{stat.responses}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer summary */}
        <div className="px-7 py-4 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center gap-6">
            {[
              { label: "Total Applications", value: detailedStats.reduce((s, d) => s + d.applications, 0) },
              { label: "Total Responses",    value: detailedStats.reduce((s, d) => s + d.responses, 0) },
              { label: "Response Rate",      value: `${Math.round((detailedStats.reduce((s, d) => s + d.responses, 0) / detailedStats.reduce((s, d) => s + d.applications, 0)) * 100)}%` },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
                <p className="text-lg font-extrabold text-black">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
