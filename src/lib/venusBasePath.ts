// Venus is mounted at two base paths: the standalone /venus module, and
// embedded inline under /ai-mentor/venus (AI Insights tab). Internal links
// within Venus pages must resolve relative to whichever base is currently
// active so navigation never jumps out of the embedded context.
export const VENUS_BASE_PATHS = ["/venus", "/ai-mentor/venus"];

export function getVenusBasePath(pathname: string): string {
  return VENUS_BASE_PATHS.find((base) => pathname.startsWith(base)) ?? "/venus";
}
