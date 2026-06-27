export const VENUS_BASE_PATHS = ["/hizorex-os"];

export function getVenusBasePath(pathname: string): string {
  return VENUS_BASE_PATHS.find((base) => pathname.startsWith(base)) ?? "/hizorex-os";
}
