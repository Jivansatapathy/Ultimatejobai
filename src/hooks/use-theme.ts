import { useCallback } from "react";

export function useTheme() {
  const toggleTheme = useCallback(() => {}, []);
  return { theme: "light" as const, toggleTheme };
}
