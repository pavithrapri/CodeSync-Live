import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface UsernameDialogProps {
  open: boolean;
  onSubmit: (username: string) => void;
}

const UsernameDialog = ({ open, onSubmit }: UsernameDialogProps) => {
  const [username, setUsername] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (username.trim()) {
      onSubmit(username.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-border [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Welcome!</DialogTitle>
          <DialogDescription className="text-center">
            Enter your name to join the collaborative session
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={20}
            className="bg-editor-bg border-border focus:border-primary"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={!username.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameDialog;