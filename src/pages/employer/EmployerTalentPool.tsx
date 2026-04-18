import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, FolderOpen, FolderPlus, Loader2, Mail, Plus, Star, Trash2, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    if (!user || !isEmployer) {
      return;
    }
    loadData(selectedFolder);
  }, [isEmployer, user, selectedFolder]);

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      toast.error("Enter a folder name.");
      return;
    }
    try {
      setCreatingFolder(true);
      const folder = await createTalentFolder(name);
      setFolders((current) => [...current, folder]);
      setNewFolderName("");
      setShowFolderInput(false);
      toast.success(`Folder "${name}" created.`);
    } catch {
      toast.error("Unable to create folder.");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteTalentFolder(folderId);
      setFolders((current) => current.filter((f) => f.id !== folderId));
      if (selectedFolder === folderId) {
        setSelectedFolder("all");
      }
      toast.success("Folder deleted.");
    } catch {
      toast.error("Unable to delete folder.");
    }
  };

  const handleMoveToFolder = async (candidate: TalentPoolCandidate, folderId: string | null) => {
    try {
      await moveCandidateToFolder(candidate.application_id, folderId);
      await loadData(selectedFolder);
      toast.success("Candidate moved.");
    } catch {
      toast.error("Unable to move candidate.");
    }
  };

  const handleRemoveBookmark = async (candidate: TalentPoolCandidate) => {
    try {
      await removeBookmark(candidate.application_id);
      setCandidates((current) => current.filter((c) => c.id !== candidate.id));
      toast.success("Removed from talent pool.");
    } catch {
      toast.error("Unable to remove bookmark.");
    }
  };

  if (loading) {
    return <LoadingState label="Loading talent pool..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent Pool"
        title="Saved Candidates"
        description="Organize bookmarked candidates in folders for quick reuse across future job openings."
        actions={(
          <Button
            className="rounded-2xl"
            onClick={() => setShowFolderInput(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New folder
          </Button>
        )}
      />

      {/* Folder bar */}
      <Card className="rounded-3xl border-border/70">
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <Button
            variant={selectedFolder === "all" ? "default" : "outline"}
            className="rounded-2xl"
            onClick={() => setSelectedFolder("all")}
          >
            <Bookmark className="h-4 w-4" />
            All saved ({candidates.length})
          </Button>
          {folders.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <Button
                variant={selectedFolder === folder.id ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <FolderOpen className="h-4 w-4" />
                {folder.name} ({folder.candidate_count})
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteFolder(folder.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {showFolderInput ? (
            <div className="flex items-center gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g., Frontend)"
                className="h-9 w-48 rounded-xl text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <Button size="sm" className="rounded-xl" onClick={handleCreateFolder} disabled={creatingFolder}>
                {creatingFolder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowFolderInput(false)}>
                Cancel
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

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
              <Card className="h-full rounded-3xl border-border/70 hover:shadow-md transition-shadow">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{candidate.candidate_name}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {candidate.candidate_email}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                      {candidate.match_score}% match
                    </span>
                  </div>

                  {candidate.job_title ? (
                    <p className="text-sm text-muted-foreground">Applied for: {candidate.job_title}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary" className="rounded-full text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 6 ? (
                      <Badge variant="outline" className="rounded-full text-xs">
                        +{candidate.skills.length - 6}
                      </Badge>
                    ) : null}
                  </div>

                  {candidate.folder_name ? (
                    <Badge variant="outline" className="rounded-full">
                      <FolderOpen className="mr-1 h-3 w-3" />
                      {candidate.folder_name}
                    </Badge>
                  ) : null}

                  <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                    {folders.length ? (
                      <Select
                        value={candidate.folder || "none"}
                        onValueChange={(value) => handleMoveToFolder(candidate, value === "none" ? null : value)}
                      >
                        <SelectTrigger className="h-8 w-auto min-w-[140px] rounded-xl text-xs">
                          <SelectValue placeholder="Move to folder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No folder</SelectItem>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              {folder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">Create folders to organize</span>
                    )}

                    <div className="flex gap-1">
                      {candidate.resume_link ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs"
                          onClick={() => window.open(candidate.resume_link!, "_blank")}
                        >
                          Resume
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-destructive"
                        onClick={() => handleRemoveBookmark(candidate)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Bookmarked {candidate.bookmarked_at ? new Date(candidate.bookmarked_at).toLocaleDateString() : "recently"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<UserRoundSearch className="h-6 w-6" />}
          title="No saved candidates"
          description={selectedFolder !== "all" ? "This folder is empty. Bookmark candidates from the Candidates page to add them here." : "Bookmark candidates from the Candidates page to build your talent pool."}
        />
      )}
    </div>
  );
}
