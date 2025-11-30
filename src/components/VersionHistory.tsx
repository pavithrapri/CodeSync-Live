import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { History, RotateCcw, X } from "lucide-react";
import { getUserColor, getUserInitials } from "@/lib/avatarUtils";
import { toast } from "sonner";

interface Version {
  id: string;
  code_content: string;
  language: string;
  saved_by: string;
  created_at: string;
  version_name: string | null;
}

interface VersionHistoryProps {
  roomId: string;
  onRestore: (code: string, language: string) => void;
  onClose: () => void;
}

const VersionHistory = ({ roomId, onRestore, onClose }: VersionHistoryProps) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [roomId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from("code_versions")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (version: Version) => {
    onRestore(version.code_content, version.language);
    const timeAgo = formatDistanceToNow(new Date(version.created_at));
    toast.success(`Restored version from ${timeAgo} ago`);
  };

  const formatDistanceToNow = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months`;
    return `${Math.floor(diffInSeconds / 31536000)} years`;
  };

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Version History</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">Loading versions...</div>
        ) : versions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No saved versions yet. Save a version to see it here.
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {versions.map((version) => (
              <Card
                key={version.id}
                className="p-3 hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback
                      style={{ backgroundColor: getUserColor(version.saved_by) }}
                      className="text-white text-xs font-medium"
                    >
                      {getUserInitials(version.saved_by)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {version.version_name || "Untitled Version"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
                        title="Restore this version"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">by {version.saved_by}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(version.created_at))} ago
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {version.language} • {version.code_content.length} chars
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default VersionHistory;