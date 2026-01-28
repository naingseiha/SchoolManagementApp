import { RefObject, KeyboardEvent } from "react";
import { FormatType } from "@/components/comments/FormattingToolbar";

interface UseTextFormattingOptions {
  textareaRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
}

export function useTextFormatting({ textareaRef, value, onChange }: UseTextFormattingOptions) {

  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, selectedText: "" };

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    return { start, end, selectedText };
  };

  const insertFormatting = (before: string, after: string, placeholder: string = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, selectedText } = getSelection();
    const textToWrap = selectedText || placeholder;

    const newText = value.substring(0, start) + before + textToWrap + after + value.substring(end);
    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      if (selectedText) {
        // If text was selected, place cursor after the formatted text
        textarea.selectionStart = start + before.length + textToWrap.length + after.length;
        textarea.selectionEnd = textarea.selectionStart;
      } else {
        // If no selection, select the placeholder
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + textToWrap.length;
      }
      textarea.focus();
    }, 0);
  };

  const applyFormat = (type: FormatType, customValue?: string) => {
    switch (type) {
      case "bold":
        insertFormatting("**", "**", "bold text");
        break;
      case "italic":
        insertFormatting("*", "*", "italic text");
        break;
      case "code":
        insertFormatting("`", "`", "code");
        break;
      case "list":
        insertListItem();
        break;
      case "link":
        insertLink(customValue);
        break;
    }
  };

  const insertListItem = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start } = getSelection();
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.substring(lineStart, start);

    // Check if we're at the start of a line
    if (currentLine.trim() === "") {
      insertFormatting("- ", "", "list item");
    } else {
      // Insert list item on new line
      const newText = value.substring(0, start) + "\n- list item" + value.substring(start);
      onChange(newText);

      setTimeout(() => {
        textarea.selectionStart = start + 3;
        textarea.selectionEnd = start + 3 + 9; // Select "list item"
        textarea.focus();
      }, 0);
    }
  };

  const insertLink = (url?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, selectedText } = getSelection();

    if (url) {
      // URL provided (could be from a modal)
      const linkText = selectedText || "link text";
      const newText = value.substring(0, start) + `[${linkText}](${url})` + value.substring(end);
      onChange(newText);

      setTimeout(() => {
        textarea.selectionStart = start + linkText.length + url.length + 4;
        textarea.selectionEnd = textarea.selectionStart;
        textarea.focus();
      }, 0);
    } else {
      // No URL, insert template
      const linkText = selectedText || "link text";
      const newText = value.substring(0, start) + `[${linkText}](url)` + value.substring(end);
      onChange(newText);

      setTimeout(() => {
        // Select "url" part
        const urlStart = start + linkText.length + 3;
        textarea.selectionStart = urlStart;
        textarea.selectionEnd = urlStart + 3;
        textarea.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (!modKey) return false;

    switch (e.key.toLowerCase()) {
      case "b":
        e.preventDefault();
        applyFormat("bold");
        return true;
      case "i":
        e.preventDefault();
        applyFormat("italic");
        return true;
      case "`":
        e.preventDefault();
        applyFormat("code");
        return true;
      case "k":
        e.preventDefault();
        applyFormat("link");
        return true;
      default:
        return false;
    }
  };

  return {
    applyFormat,
    handleKeyDown,
  };
}
