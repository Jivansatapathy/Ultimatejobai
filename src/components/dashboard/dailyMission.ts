export interface DailyMissionTask {
  id: number;
  label: string;
  helper: string;
  autoCompleted: boolean;
  isManual: boolean;
  completed: boolean;
}

export const getDailyMissionStorageKey = () => {
  const today = new Date().toISOString().slice(0, 10);
  return `daily_goal_manual_tasks:${today}`;
};

export const readDailyMissionManualTaskIds = () => {
  try {
    const saved = sessionStorage.getItem(getDailyMissionStorageKey());
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value) => typeof value === "number");
  } catch (error) {
    console.error("Failed to read daily mission state:", error);
    return [];
  }
};

export const writeDailyMissionManualTaskIds = (taskIds: number[]) => {
  sessionStorage.setItem(getDailyMissionStorageKey(), JSON.stringify(taskIds));
};

export const buildDailyMissionTasks = (currentCount: number, targetCount: number, manualTaskIds: number[]): DailyMissionTask[] => {
  const isGoalMet = currentCount >= targetCount;

  return [
    {
      id: 1,
      label: "Review fresh job matches",
      helper: "Start by scanning the newest roles that fit your target profile.",
      autoCompleted: currentCount > 0,
    },
    {
      id: 2,
      label: "Tailor your resume for today's best-fit roles",
      helper: "Tighten the summary, keywords, and impact points before applying.",
      autoCompleted: currentCount > 1,
    },
    {
      id: 3,
      label: `Reach your daily application target of ${targetCount}`,
      helper: "Steady, high-quality applications build stronger momentum than rushed volume.",
      autoCompleted: isGoalMet,
    },
    {
      id: 4,
      label: "Make one networking or follow-up move",
      helper: "Message a recruiter, reconnect with a contact, or follow up on an active lead.",
      autoCompleted: currentCount > 3,
    },
  ].map((task) => ({
    ...task,
    isManual: !task.autoCompleted && manualTaskIds.includes(task.id),
    completed: task.autoCompleted || manualTaskIds.includes(task.id),
  }));
};
