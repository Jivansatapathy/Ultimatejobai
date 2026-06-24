import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, FolderOpen, FolderPlus, Loader2, Mail, Plus, Trash2, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Panel } from "@/components/employer/Panel";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import {
  createTalentFolder,
  deleteTalentFolder,
  getTalentFolders,
  getTalentPool,
  moveCandidateToFolder,
  removeBookmark,
} from "@/services/employerService";
import { TalentPoolCandidate, TalentPoolFolder } from "@/types/employer";

export default function EmployerTalentPool() {
  const { user, isEmployer } = useEmployerAuth();
  const [folders, setFolders] = useState<TalentPoolFolder[]>([]);
  const [candidates, setCandidates] = useState<TalentPoolCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);

  const loadData = async (folderId?: string) => {
    try {
      setLoading(true);
      const [folderList, candidateList] = await Promise.all([
        getTalentFolders().catch(() => []),
        getTalentPool(folderId === "all" ? undefined : folderId).catch(() => []),
      ]);
      setFolders(folderList);
      setCandidates(candidateList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isEmployer) return;
    loadData(selectedFolder);
  }, [isEmployer, user, selectedFolder]);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) { toast.error("Enter a folder name."); return; }
    try {
      setCreatingFolder(true);
      const folder = await createTalentFolder(name);
      setFolders((current) => [...current, folder]);
      setNewFolderName("");
      setShowFolderInput(false);
      toast.success(`Folder "${name}" created.`);
    } catch { toast.error("Unable to create folder."); }
    finally { setCreatingFolder(false); }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteTalentFolder(folderId);
      setFolders((current) => current.filter((f) => f.id !== folderId));
      if (selectedFolder === folderId) setSelectedFolder("all");
      toast.success("Folder deleted.");
    } catch { toast.error("Unable to delete folder."); }
  };

  const handleMoveToFolder = async (candidate: TalentPoolCandidate, folderId: string | null) => {
    try {
      await moveCandidateToFolder(candidate.application_id, folderId);
      await loadData(selectedFolder);
      toast.success("Candidate moved.");
    } catch { toast.error("Unable to move candidate."); }
  };

  const handleRemoveBookmark = async (candidate: TalentPoolCandidate) => {
    try {
      await removeBookmark(candidate.application_id);
      setCandidates((current) => current.filter((c) => c.id !== candidate.id));
      toast.success("Removed from talent pool.");
    } catch { toast.error("Unable to remove bookmark."); }
  };

  if (loading) return <LoadingState label="Loading talent pool..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Talent Pool"
        title="Saved Candidates"
        description="Organize bookmarked candidates in folders for quick reuse across future job openings."
        actions={(
          <button
            type="button"
            onClick={() => setShowFolderInput(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors shadow-sm"
          >
            <FolderPlus className="h-4 w-4" />
            New folder
          </button>
        )}
      />

      {/* Folder bar */}
      <Panel noPad>
        <div className="flex flex-wrap items-center gap-2 p-4">
          <button
            type="button"
            onClick={() => setSelectedFolder("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              selectedFolder === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            All saved ({candidates.length})
          </button>
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedFolder(folder.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedFolder === folder.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                {folder.name} ({folder.candidate_count})
              </button>
              <button
                type="button"
                aria-label="Delete folder"
                onClick={() => handleDeleteFolder(folder.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {showFolderInput ? (
            <div className="flex items-center gap-2">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g., Frontend)"
                className="h-9 w-48 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={creatingFolder}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors"
              >
                {creatingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setShowFolderInput(false)}
                className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      </Panel>

      {/* Candidate grid */}
      {candidates.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3">

                {/* Header row */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-sm font-bold text-teal-700">
                    {(candidate.candidate_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{candidate.candidate_name}</h3>
                      <span className="shrink-0 inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                        {candidate.match_score}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0" />
                      {candidate.candidate_email}
                    </p>
                  </div>
                </div>

                {/* Applied for */}
                {candidate.job_title ? (
                  <p className="text-xs text-gray-500">
                    Applied for <span className="font-semibold text-gray-700">{candidate.job_title}</span>
                  </p>
                ) : null}

                {/* Skills */}
                {candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 5 ? (
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        +{candidate.skills.length - 5}
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Folder badge */}
                {candidate.folder_name ? (
                  <span className="self-start inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-600">
                    <FolderOpen className="h-3 w-3" />
                    {candidate.folder_name}
                  </span>
                ) : null}

                {/* Actions */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                  {folders.length ? (
                    <select
                      aria-label="Move to folder"
                      value={candidate.folder || "none"}
                      onChange={(e) => handleMoveToFolder(candidate, e.target.value === "none" ? null : e.target.value)}
                      className="h-8 flex-1 max-w-[160px] rounded-xl border border-gray-200 bg-white px-2.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="none">Move to folder…</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-400">No folders yet</span>
                  )}

                  <div className="flex gap-1 shrink-0">
                    {candidate.resume_link ? (
                      <button
                        type="button"
                        onClick={() => window.open(candidate.resume_link!, "_blank")}
                        className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-1.5 transition-colors"
                      >
                        Resume
                      </button>
                    ) : null}
                    <button
                      type="button"
                      aria-label="Remove from talent pool"
                      onClick={() => handleRemoveBookmark(candidate)}
                      className="p-1.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400">
                  Saved {candidate.bookmarked_at ? new Date(candidate.bookmarked_at).toLocaleDateString() : "recently"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UserRoundSearch className="h-6 w-6" />}
          title="No saved candidates"
          description={selectedFolder !== "all"
            ? "This folder is empty. Bookmark candidates from the Candidates page to add them here."
            : "Bookmark candidates from the Candidates page to build your talent pool."}
        />
      )}
    </div>
  );
}
