"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, List, Link, Save, X } from "lucide-react";
import { RichTextEditorProps } from "@/types";

export function RichTextEditor({
  value,
  onChange,
  onSave,
  onCancel,
}: RichTextEditorProps) {
  const [content, setContent] = useState(value);

  const handleFormat = (format: "bold" | "italic" | "list" | "link") => {
    const textarea = document.getElementById(
      "rich-editor"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = "";
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "list":
        formattedText = `\n• ${selectedText}`;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        break;
    }

    const newContent =
      content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
  };

  const handleSave = () => {
    onChange(content);
    onSave();
  };

  return (
    <div className="space-y-2 p-2 border rounded-lg bg-white shadow-sm">
      <div className="flex gap-1 border-b pb-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("bold")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("italic")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("list")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat("link")}
          className="h-8 w-8 p-0"
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        id="rich-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px] resize-none"
        placeholder="Tulis konten Anda di sini... Gunakan **bold**, *italic*, atau • untuk list"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Batal
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          Simpan
        </Button>
      </div>
    </div>
  );
}

export function RichTextDisplay({ content }: { content: string }) {
  const parseContent = (text: string): string => {
    if (!text) return "";

    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^• (.+)/gm, "<li>$1</li>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
      )
      .replace(/\n/g, "<br>");
  };

  return (
    <div
      className="min-h-[40px] text-sm"
      dangerouslySetInnerHTML={{ __html: parseContent(content) }}
    />
  );
}
