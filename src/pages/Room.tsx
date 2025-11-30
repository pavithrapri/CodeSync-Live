// src/pages/Room.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Users, ArrowLeft, Sparkles, MessageSquare, History, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";
import ChatSidebar from "@/components/ChatSidebar";
import UsernameDialog from "@/components/UsernameDialog";
import VersionHistory from "@/components/VersionHistory";
import { getUserColor, getUserInitials } from "@/lib/avatarUtils";

type Language = "python" | "javascript" | "typescript" | "java" | "cpp" | "c" | "csharp" | "php" | "ruby" | "go" | "rust" | "swift" | "kotlin" | "sql" | "html" | "css" | "json" | "xml" | "yaml" | "markdown";

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
];

interface PresenceState {
  username: string;
  online_at: string;
  cursor?: {
    line: number;
    column: number;
  };
}

interface RemoteUser {
  username: string;
  cursor?: {
    line: number;
    column: number;
  };
}

const Room = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState("# Loading...");
  const [language, setLanguage] = useState<Language>("python");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [autocompleteSuggestion, setAutocompleteSuggestion] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [showUsernameDialog, setShowUsernameDialog] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [versionName, setVersionName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cursorDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalChangeRef = useRef(false);
  const lastRemoteCodeRef = useRef<string>("");
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem(`username_${roomCode}`);
    if (storedUsername) {
      setUsername(storedUsername);
      setShowUsernameDialog(false);
    }
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || !username) return;

    loadRoom();
    setupRealtimeSync();
    setupPresence();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (cursorDebounceRef.current) {
        clearTimeout(cursorDebounceRef.current);
      }
    };
  }, [roomCode, username]);

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    localStorage.setItem(`username_${roomCode}`, name);
    setShowUsernameDialog(false);
    toast.success(`Welcome, ${name}!`);
  };

  const loadRoom = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select()
        .eq("room_code", roomCode)
        .single();

      if (error || !data) {
        toast.error("Room not found");
        navigate("/");
        return;
      }

      console.log("Room loaded:", data);
      setRoomId(data.id);
      const initialCode = data.code_content || "";
      setCode(initialCode);
      lastRemoteCodeRef.current = initialCode;
      setLanguage(data.language as Language);
    } catch (error) {
      console.error("Error loading room:", error);
      toast.error("Failed to load room");
    }
  };

  const setupPresence = () => {
    const channel = supabase.channel(`presence:${roomCode}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceState>();
        const allPresences = Object.values(state).flat();
        
        const users = allPresences.map((presence) => presence.username);
        console.log("Online users:", users);
        setOnlineUsers(users);
        
        const remote = allPresences
          .filter((p) => p.username !== username)
          .map((p) => ({
            username: p.username,
            cursor: p.cursor,
          }));
        setRemoteUsers(remote);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const newUsers = newPresences.map((p: any) => p.username);
        console.log("Users joined:", newUsers);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftUsers = leftPresences.map((p: any) => p.username);
        console.log("Users left:", leftUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            username: username,
            online_at: new Date().toISOString(),
          });
        }
      });

    presenceChannelRef.current = channel;
  };

  const setupRealtimeSync = () => {
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (!isLocalChangeRef.current && payload.new) {
            const newCode = payload.new.code_content || "";
            
            if (newCode !== lastRemoteCodeRef.current) {
              console.log("Received remote code update");
              setCode(newCode);
              lastRemoteCodeRef.current = newCode;
            }
            
            setLanguage(payload.new.language as Language);
          }
          setTimeout(() => {
            isLocalChangeRef.current = false;
          }, 100);
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const updateCode = async (newCode: string) => {
    if (!roomCode) return;

    isLocalChangeRef.current = true;
    lastRemoteCodeRef.current = newCode;

    try {
      const { error } = await supabase
        .from("rooms")
        .update({ code_content: newCode })
        .eq("room_code", roomCode);

      if (error) {
        console.error("Error updating code:", error);
        isLocalChangeRef.current = false;
      }
    } catch (error) {
      console.error("Error updating code:", error);
      isLocalChangeRef.current = false;
    }
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      updateCode(newCode);
    }, 300);
  }, [roomCode]);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage as Language);

    if (!roomCode) return;

    try {
      await supabase
        .from("rooms")
        .update({ language: newLanguage })
        .eq("room_code", roomCode);
      
      const languageLabel = LANGUAGES.find(l => l.value === newLanguage)?.label;
      toast.success(`Language changed to ${languageLabel}`);
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error("Failed to change language");
    }
  };

  const handleCursorChange = useCallback((position: { lineNumber: number; column: number } | null) => {
    if (!presenceChannelRef.current || !position) return;

    if (cursorDebounceRef.current) {
      clearTimeout(cursorDebounceRef.current);
    }

    cursorDebounceRef.current = setTimeout(async () => {
      await presenceChannelRef.current?.track({
        username: username,
        online_at: new Date().toISOString(),
        cursor: {
          line: position.lineNumber,
          column: position.column,
        },
      });
    }, 100);
  }, [username]);

  const handleSaveVersion = async () => {
    if (!roomId) return;

    try {
      const { error } = await supabase.from("code_versions").insert({
        room_id: roomId,
        code_content: code,
        language: language,
        saved_by: username,
        version_name: versionName || `Version by ${username}`,
      });

      if (error) throw error;

      toast.success("Version saved successfully!");
      setShowSaveDialog(false);
      setVersionName("");
    } catch (error) {
      console.error("Error saving version:", error);
      toast.error("Failed to save version");
    }
  };

  const handleRestoreVersion = (restoredCode: string, restoredLanguage: string) => {
    setCode(restoredCode);
    setLanguage(restoredLanguage as Language);
    updateCode(restoredCode);
    setShowVersionHistory(false);
    toast.success("Version restored successfully");
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Room link copied to clipboard!");
  };

  const getEditorLanguage = () => {
    return language;
  };

  const toggleChat = () => {
    console.log("Toggling chat. Current state:", showChat);
    console.log("RoomId:", roomId);
    console.log("Username:", username);
    setShowChat(!showChat);
  };

  if (showUsernameDialog) {
    return <UsernameDialog open={showUsernameDialog} onSubmit={handleUsernameSubmit} />;
  }

  console.log("Rendering Room. ShowChat:", showChat, "RoomId:", roomId, "Username:", username);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave
            </Button>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <span className="text-sm font-mono text-primary font-bold">{roomCode}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyRoomLink}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40 bg-editor-bg border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembersModal(!showMembersModal)}
              className={`${
                showMembersModal
                  ? "bg-secondary/20 text-secondary hover:bg-secondary/30"
                  : "text-muted-foreground hover:text-secondary"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{onlineUsers.length}</span>
            </Button>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Version</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Version name (optional)"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                  />
                  <Button onClick={handleSaveVersion} className="w-full">
                    Save Version
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className={`${
                showVersionHistory
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <History className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className={`${
                showChat
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 relative min-w-0">
          <Editor
            height="100%"
            language={getEditorLanguage()}
            value={code}
            onChange={handleCodeChange}
            onMount={(editor) => {
              editorRef.current = editor;
              
              editor.onDidChangeCursorPosition((e) => {
                handleCursorChange({
                  lineNumber: e.position.lineNumber,
                  column: e.position.column,
                });
              });
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
              lineNumbers: "on",
              rulers: [80, 120],
              wordWrap: "on",
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              fontLigatures: true,
              padding: { top: 16, bottom: 16 },
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
            }}
          />

          {remoteUsers.map((user) =>
            user.cursor ? (
              <div
                key={user.username}
                className="absolute pointer-events-none z-50"
                style={{
                  left: `${(user.cursor.column - 1) * 7.2 + 60}px`,
                  top: `${(user.cursor.line - 1) * 19 + 16}px`,
                }}
              >
                <div
                  className="w-0.5 h-5 animate-pulse"
                  style={{ backgroundColor: getUserColor(user.username) }}
                />
                <div
                  className="absolute -top-6 left-0 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                  style={{ backgroundColor: getUserColor(user.username) }}
                >
                  {user.username}
                </div>
              </div>
            ) : null
          )}

          {autocompleteSuggestion && (
            <Card className="absolute top-4 right-4 p-4 bg-accent/90 backdrop-blur-sm border-accent max-w-md">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-accent-foreground mb-1">AI Suggestion</p>
                  <p className="text-sm text-accent-foreground/80 font-mono">{autocompleteSuggestion}</p>
                </div>
              </div>
            </Card>
          )}

          {/*{onlineUsers.length > 0 && (
            <Card className="absolute bottom-4 right-4 p-3 bg-card/90 backdrop-blur-sm border-border">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Online ({onlineUsers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {onlineUsers.map((user, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-2 py-1.5 bg-card/80 rounded-md border border-border"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarFallback
                          style={{ backgroundColor: getUserColor(user) }}
                          className="text-white text-[10px] font-medium"
                        >
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-foreground">{user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}*/}
        </div>

        {showVersionHistory && roomId && (
          <div className="flex-shrink-0">
            <VersionHistory
              roomId={roomId}
              onRestore={handleRestoreVersion}
              onClose={() => setShowVersionHistory(false)}
            />
          </div>
        )}

        {showChat && roomId && (
          <div className="w-80 flex-shrink-0 h-full">
            <ChatSidebar 
              roomId={roomId} 
              username={username} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        )}
      </div>
      {/* Members Dialog */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Online Members ({onlineUsers.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {onlineUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users online</p>
            ) : (
              onlineUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback
                      style={{ backgroundColor: getUserColor(user) }}
                      className="text-white text-sm font-medium"
                    >
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                  {user === username && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">You</span>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  
  );
};

export default Room;