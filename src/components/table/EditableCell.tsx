"use client";

import { useState, useEffect } from "react";
import {
  TipTapEditor,
  TipTapDisplay,
} from "@/components/rich-text/TipTapEditor";

interface EditableCellProps {
  value: string;
  onSave: (newValue: string) => void;
  placeholder?: string;
}

export function EditableCell({
  value,
  onSave,
  placeholder,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TipTapEditor
        value={editValue}
        onChange={setEditValue}
        onSave={handleSave}
        onCancel={handleCancel}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[40px] border border-transparent hover:border-gray-200"
    >
      {value ? (
        <TipTapDisplay content={value} />
      ) : (
        <span className="text-gray-400 text-sm">
          {placeholder || "Click to edit..."}
        </span>
      )}
    </div>
  );
}
