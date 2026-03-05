import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onTextChange?: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  isValidating?: boolean;
  isValid?: boolean | null;
  feedback?: string | null;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onTextChange,
  disabled,
  isLoading,
  isValidating,
  isValid,
  feedback,
  placeholder = "Type your answer...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (isValid && !disabled && !isLoading) {
      onSend(value);
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onTextChange) {
      onTextChange(newValue);
    }
  };

  useEffect(() => {
    if (!disabled && !isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled, isLoading]);

  return (
    <div className="flex flex-col gap-1 p-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-[80px] max-h-[250px] resize-none rounded-xl pr-12 transition-all p-4",
              disabled && "opacity-50 cursor-not-allowed",
              isValid === false && value.length > 0 && "border-destructive focus-visible:ring-destructive"
            )}
            rows={1}
          />
          <div className="absolute bottom-2 right-3 flex items-center gap-1.5">
            {isValidating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : isValid === true ? (
              <div className="h-4 w-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            ) : null}
          </div>
        </div>
        <Button
          onClick={handleSend}
          disabled={isValid !== true || disabled || isLoading}
          size="icon"
          className="h-12 w-12 rounded-xl flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      {(isValid === false || feedback) && value.length > 0 && (
        <p className={cn(
          "text-[10px] px-1 transition-all animate-in fade-in slide-in-from-top-1",
          isValid === false ? "text-destructive" : "text-muted-foreground"
        )}>
          {feedback || "Continue typing to complete your answer..."}
        </p>
      )}
    </div>
  );
}
