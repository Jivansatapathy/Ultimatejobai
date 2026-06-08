import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Circle, Target, Sparkles, Send } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  buildDailyMissionTasks,
  readDailyMissionManualTaskIds,
  writeDailyMissionManualTaskIds,
} from "@/components/dashboard/dailyMission";

interface DailyGoalModalProps {
  currentCount: number;
  targetCount: number;
  isOpen?: boolean;
  onTasksChange?: (taskIds: number[]) => void;
}

export function DailyGoalModal({
  currentCount,
  targetCount,
  isOpen: forceOpen,
  onTasksChange,
}: DailyGoalModalProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const percentage = Math.min((currentCount / targetCount) * 100, 100);
  const isGoalMet = currentCount >= targetCount;
  const [manualTaskIds, setManualTaskIds] = useState<number[]>([]);

  useEffect(() => {
    const hasPrompted = localStorage.getItem("daily_goal_prompted");
    if (forceOpen) {
      setOpen(true);
    } else if (!hasPrompted && !isGoalMet) {
      setOpen(true);
      localStorage.setItem("daily_goal_prompted", "true");
    }
  }, [currentCount, targetCount, isGoalMet, forceOpen]);

  useEffect(() => {
    const taskIds = readDailyMissionManualTaskIds();
    setManualTaskIds(taskIds);
    onTasksChange?.(taskIds);
  }, [onTasksChange]);

  const tasks = buildDailyMissionTasks(currentCount, targetCount, manualTaskIds);

  const toggleTask = (taskId: number, autoCompleted: boolean) => {
    if (autoCompleted) return;
    setManualTaskIds((prev) => {
      const next = prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId];
      writeDailyMissionManualTaskIds(next);
      onTasksChange?.(next);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl gap-0">

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-zinc-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
                <Target className="h-4.5 w-4.5 text-white" />
              </div>
              <DialogTitle className="text-lg font-extrabold text-black tracking-tight">
                Daily Mission
              </DialogTitle>
            </div>
            <DialogDescription className="text-zinc-500 text-sm leading-relaxed">
              Stay focused on the few actions that actually move your search forward today.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-zinc-700">Today's application progress</span>
              <span className={isGoalMet ? "text-black font-bold" : "text-zinc-500"}>
                {currentCount} / {targetCount}
              </span>
            </div>
            {/* Progress bar */}
            <Progress
              value={percentage}
              className="h-2 bg-zinc-100 [&>div]:bg-black [&>div]:transition-all [&>div]:duration-500"
            />
            <p className={`text-xs flex items-center gap-1.5 font-medium ${isGoalMet ? "text-black" : "text-zinc-500"}`}>
              <Sparkles className="h-3 w-3 shrink-0" />
              {isGoalMet
                ? "Goal reached. Anything extra today is a bonus."
                : `${Math.max(targetCount - currentCount, 0)} more application${targetCount - currentCount === 1 ? "" : "s"} to hit today's target.`}
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
              Daily Checklist
            </h4>
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id, task.autoCompleted)}
                  disabled={task.autoCompleted}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    task.completed
                      ? "bg-zinc-50 border-zinc-200 opacity-70"
                      : "bg-white border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      {task.completed ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${task.completed ? "text-zinc-400 line-through" : "text-black"}`}>
                        {task.label}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                        {task.autoCompleted
                          ? "Completed automatically from your activity today."
                          : task.isManual
                          ? "Marked done for this session."
                          : task.helper}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-3 px-7 pb-7 sm:space-x-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold transition-all"
          >
            I'll do it later
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); navigate("/jobs"); }}
            className="flex-1 h-11 rounded-xl bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            Go To Job Search
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
