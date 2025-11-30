import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Users, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Home = () => {
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const code = generateRoomCode();
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          room_code: code,
          name: `Room ${code}`,
          language: "python",
          code_content: "# Welcome to collaborative coding!\n# Start typing to see real-time updates\n\ndef hello_world():\n    print('Hello, World!')\n\nif __name__ == '__main__':\n    hello_world()",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Room created successfully!");
      navigate(`/room/${code}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    setIsJoining(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select()
        .eq("room_code", roomCode.toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Room not found");
        return;
      }

      navigate(`/room/${roomCode.toUpperCase()}`);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative z-10 w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Code2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
            CodeSync Live
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            Real-time collaborative coding with AI-powered autocomplete. Code together, anywhere.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,208,255,0.15)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Real-Time Sync</CardTitle>
              <CardDescription>
                See changes instantly as you and your team code together
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-secondary/20 hover:border-secondary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <CardHeader>
              <Sparkles className="w-8 h-8 text-secondary mb-2" />
              <CardTitle>AI Autocomplete</CardTitle>
              <CardDescription>
                Smart suggestions powered by AI to boost your productivity
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-accent/20 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
            <CardHeader>
              <Code2 className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Multi-Language</CardTitle>
              <CardDescription>
                Support for Python, JavaScript, TypeScript, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-left-6 duration-700 delay-500">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Room</CardTitle>
              <CardDescription>
                Start a new collaborative coding session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createRoom}
                disabled={isCreating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(0,208,255,0.3)] hover:shadow-[0_0_30px_rgba(0,208,255,0.5)] transition-all duration-300 group"
                size="lg"
              >
                {isCreating ? (
                  "Creating..."
                ) : (
                  <>
                    Create Room
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-secondary/50 transition-all duration-300 animate-in fade-in slide-in-from-right-6 duration-700 delay-500">
            <CardHeader>
              <CardTitle className="text-2xl">Join Room</CardTitle>
              <CardDescription>
                Enter a room code to join an existing session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && joinRoom()}
                className="bg-editor-bg border-border focus:border-secondary"
                maxLength={6}
              />
              <Button
                onClick={joinRoom}
                disabled={isJoining || !roomCode.trim()}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-300 group"
                size="lg"
              >
                {isJoining ? (
                  "Joining..."
                ) : (
                  <>
                    Join Room
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;