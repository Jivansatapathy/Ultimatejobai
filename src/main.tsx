import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CHUNK_RELOAD_KEY } from "./lib/chunkReload";

// A new deployment invalidates the hashed chunk URLs an already-open tab is
// still referencing. Recover with a single hard reload instead of leaving
// the user on a dead "Failed to fetch dynamically imported module" error.
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
  sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
  window.location.reload();
});

// Clear the guard once the app has been running for a while, so a later,
// unrelated deploy can still trigger its own one-time auto-reload.
setTimeout(() => sessionStorage.removeItem(CHUNK_RELOAD_KEY), 10000);

createRoot(document.getElementById("root")!).render(<App />);
