import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Target, Sparkles, Send } from "lucide-react";
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

export function DailyGoalModal({ currentCount, targetCount, isOpen: forceOpen, onTasksChange }: DailyGoalModalProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const percentage = Math.min((currentCount / targetCount) * 100, 100);
  const isGoalMet = currentCount >= targetCount;
  const [manualTaskIds, setManualTaskIds] = useState<number[]>([]);

  useEffect(() => {
    // Check if we should show the modal
    // Show if goal is not met OR force open
    // Also use session storage to only show it once per session automatically
    const hasPrompted = sessionStorage.getItem("daily_goal_prompted");
    
    if (forceOpen) {
      setOpen(true);
    } else if (!hasPrompted && !isGoalMet) {
      setOpen(true);
      sessionStorage.setItem("daily_goal_prompted", "true");
    }
  }, [currentCount, targetCount, isGoalMet, forceOpen]);

  useEffect(() => {
    const taskIds = readDailyMissionManualTaskIds();
    setManualTaskIds(taskIds);
    onTasksChange?.(taskIds);
  }, [onTasksChange]);

  const tasks = buildDailyMissionTasks(currentCount, targetCount, manualTaskIds);

  const toggleTask = (taskId: number, autoCompleted: boolean) => {
    if (autoCompleted) {
      return;
    }

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
      <DialogContent className="sm:max-w-md bg-secondary/95 border-white/5 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-xl">Daily Mission</DialogTitle>
              <DialogDescription>Stay focused on the few actions that actually move your search forward today.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Today's application progress</span>
              <span className={isGoalMet ? "text-success" : "text-accent"}>
                {currentCount} / {targetCount}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <p className={`text-xs flex items-center gap-1 font-medium ${isGoalMet ? "text-success" : "text-muted-foreground"}`}>
              <Sparkles className="h-3 w-3" />
              {isGoalMet
                ? "Goal reached. Anything extra you do today is a bonus."
                : `${Math.max(targetCount - currentCount, 0)} more application${targetCount - currentCount === 1 ? "" : "s"} to hit today's target.`}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">Daily Checklist</h4>
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task.id} 
                  type="button"
                  onClick={() => toggleTask(task.id, task.autoCompleted)}
                  disabled={task.autoCompleted}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    task.completed 
                      ? "bg-success/5 border-success/20 text-success/80" 
                      : "bg-background/40 border-white/5 text-muted-foreground hover:border-accent/30 hover:bg-background/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 opacity-30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{task.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {task.autoCompleted
                          ? "Completed automatically from your live activity today."
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            I'll do it later
          </Button>
          <Button 
            className="flex-1 gap-2 bg-accent hover:bg-accent/90 text-white"
            onClick={() => {
              setOpen(false);
              navigate("/jobs");
            }}
          >
            <Send className="h-4 w-4" />
            Go To Job Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
