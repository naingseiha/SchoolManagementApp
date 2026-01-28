import { useState, useEffect, useRef, KeyboardEvent } from "react";

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface UseMentionsOptions {
  onMention?: (userId: string, userName: string) => void;
  searchUsers?: (query: string) => Promise<MentionUser[]>;
}

export function useMentions(textareaRef: React.RefObject<HTMLTextAreaElement>, options: UseMentionsOptions = {}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(-1);

  // Mock users - Replace with actual API call
  const mockUsers: MentionUser[] = [
    { id: "1", name: "សុភា រដ្ឋ", role: "Student" },
    { id: "2", name: "David Chen", role: "Teacher" },
    { id: "3", name: "Sarah Johnson", role: "Student" },
    { id: "4", name: "មករា ខេម", role: "Student" },
    { id: "5", name: "John Smith", role: "Teacher" },
  ];

  const checkForMention = (value: string, cursorPos: number) => {
    const lastAtSymbol = value.lastIndexOf("@", cursorPos - 1);

    if (lastAtSymbol === -1) {
      setShowSuggestions(false);
      return;
    }

    const textAfterAt = value.substring(lastAtSymbol + 1, cursorPos);
    const hasSpace = textAfterAt.includes(" ");

    if (hasSpace) {
      setShowSuggestions(false);
      return;
    }

    // Check if there's text before @ that's not a space
    const charBeforeAt = lastAtSymbol > 0 ? value[lastAtSymbol - 1] : " ";
    if (charBeforeAt !== " " && charBeforeAt !== "\n") {
      setShowSuggestions(false);
      return;
    }

    setMentionStartPos(lastAtSymbol);
    setMentionQuery(textAfterAt);

    // Filter users
    const filtered = mockUsers.filter((user) =>
      user.name.toLowerCase().includes(textAfterAt.toLowerCase())
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, value: string, onChange: (value: string) => void) => {
    if (!showSuggestions || suggestions.length === 0) return false;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        return true;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return true;
      case "Enter":
      case "Tab":
        e.preventDefault();
        insertMention(suggestions[selectedIndex], value, onChange);
        return true;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        return true;
      default:
        return false;
    }
  };

  const insertMention = (user: MentionUser, value: string, onChange: (value: string) => void) => {
    if (mentionStartPos === -1 || !textareaRef.current) return;

    const before = value.substring(0, mentionStartPos);
    const cursorPos = textareaRef.current.selectionStart || 0;
    const after = value.substring(cursorPos);
    const mentionText = `@${user.name} `;
    const newValue = before + mentionText + after;

    onChange(newValue);
    setShowSuggestions(false);

    // Move cursor after mention
    const newCursorPos = before.length + mentionText.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);

    // Notify parent about mention
    if (options.onMention) {
      options.onMention(user.id, user.name);
    }
  };

  const handleInput = (value: string) => {
    if (!textareaRef.current) return;
    const cursorPos = textareaRef.current.selectionStart || 0;
    checkForMention(value, cursorPos);
  };

  return {
    showSuggestions,
    suggestions,
    selectedIndex,
    mentionQuery,
    handleKeyDown,
    handleInput,
    insertMention,
    setShowSuggestions,
  };
}
