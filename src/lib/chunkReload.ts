export const CHUNK_RELOAD_KEY = "chunk-reload-attempted";

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

export function isChunkLoadError(error: Error): boolean {
  return CHUNK_ERROR_PATTERN.test(error.message);
}
