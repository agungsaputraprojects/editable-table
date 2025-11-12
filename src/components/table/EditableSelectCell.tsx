"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import type { SubjectRecord } from "@/types/nocodb";

interface EditableSelectCellProps {
  value: string;
  valueId?: number;
  options: SubjectRecord[];
  onSave: (subjectId: number, subjectTitle: string) => void;
  placeholder?: string;
}

export function EditableSelectCell({
  value,
  valueId,
  options,
  onSave,
  placeholder = "Select...",
}: EditableSelectCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    valueId?.toString() || ""
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedId(valueId?.toString() || "");
  }, [valueId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (selectedId) {
      const selectedOption = options.find(
        (opt) => opt.Id?.toString() === selectedId
      );
      if (selectedOption) {
        const title =
          selectedOption.Title ||
          selectedOption.Validate ||
          `Subject ${selectedOption.Id}`;
        onSave(parseInt(selectedId), title);
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedId(valueId?.toString() || "");
    setIsEditing(false);
  };

  // Transform options for Combobox
  const comboboxOptions = options.map((option) => ({
    value: option.Id!.toString(),
    label: option.Title || option.Validate || `Subject ${option.Id}`,
  }));

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className="space-y-2 p-2 border rounded-lg bg-white shadow-sm"
      >
        <Combobox
          options={comboboxOptions}
          value={selectedId}
          onValueChange={setSelectedId}
          placeholder={placeholder}
          searchPlaceholder="Search subjects..."
          emptyText="No subject found."
          className="w-full"
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!selectedId}
          >
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[40px] border border-transparent hover:border-gray-200"
    >
      {value ? (
        <span className="text-sm text-gray-900">{value}</span>
      ) : (
        <span className="text-gray-400 text-sm">
          {placeholder || "Click to select..."}
        </span>
      )}
    </div>
  );
}
