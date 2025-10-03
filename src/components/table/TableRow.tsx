"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow as UITableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  AssessmentRecord,
  DisplayData,
  FulfilmentStatusType,
  SubjectRecord,
} from "@/types/nocodb";
import { Check, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { EditableCell } from "./EditableCell";

interface TableRowProps {
  row: DisplayData;
  subjectOptions: SubjectRecord[];
  assessmentOptions: AssessmentRecord[];
  openSubjectPopover: number | null;
  openAssessmentPopover: number | null;
  onOpenSubjectPopover: (rowId: number | null) => void;
  onOpenAssessmentPopover: (rowId: number | null) => void;
  onActualChange: (rowId: number, value: string) => void;
  onTargetChange: (rowId: number, value: string) => void;
  onFulfilmentStatusChange: (
    rowId: number,
    value: FulfilmentStatusType
  ) => void;
  onAssessmentChange: (rowId: number, assessmentId: number) => void;
  onSubjectChange: (rowId: number, subjectId: number) => void;
  onDelete: (row: DisplayData) => void;
}

export function TableRow({
  row,
  subjectOptions,
  assessmentOptions,
  openSubjectPopover,
  openAssessmentPopover,
  onOpenSubjectPopover,
  onOpenAssessmentPopover,
  onActualChange,
  onTargetChange,
  onFulfilmentStatusChange,
  onAssessmentChange,
  onSubjectChange,
  onDelete,
}: TableRowProps) {
  const isSubjectOpen = openSubjectPopover === row.Id;
  const isAssessmentOpen = openAssessmentPopover === row.Id;

  const getStatusColor = (status: FulfilmentStatusType) => {
    if (status === "Fully Met") return "text-green-600 border-green-600";
    if (status === "Partially Met") return "text-yellow-600 border-yellow-600";
    if (status === "Not Met") return "text-red-600 border-red-600";
    return "";
  };

  return (
    <UITableRow>
      <TableCell className="font-medium">{row.Id}</TableCell>

      <TableCell className="w-[300px]">
        <Popover
          open={isSubjectOpen}
          onOpenChange={(open) => {
            onOpenSubjectPopover(open ? row.Id! : null);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between text-left font-normal px-3 h-10"
            >
              <span className="text-sm truncate block max-w-[240px]">
                {row.Subject || "Select subject..."}
              </span>
              {isSubjectOpen ? (
                <ChevronUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search subject..." />
              <CommandList>
                <CommandEmpty>No subject found.</CommandEmpty>
                <CommandGroup>
                  {subjectOptions.map((subject) => (
                    <CommandItem
                      key={subject.Id}
                      value={subject.Title}
                      onSelect={() => {
                        onSubjectChange(row.Id!, subject.Id!);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          row.SubjectId === subject.Id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {subject.Title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </TableCell>

      <TableCell className="w-[300px]">
        <EditableCell
          value={row.Target || ""}
          onSave={(newValue) => onTargetChange(row.Id!, newValue)}
          placeholder="Click to edit target..."
        />
      </TableCell>

      <TableCell className="w-[200px]">
        <EditableCell
          value={row.Actual || ""}
          onSave={(newValue) => onActualChange(row.Id!, newValue)}
          placeholder="Click to edit actual..."
        />
      </TableCell>

      <TableCell className="w-[180px]">
        <Select
          value={row.FulfilmentStatus || ""}
          onValueChange={(value) =>
            onFulfilmentStatusChange(row.Id!, value as FulfilmentStatusType)
          }
        >
          <SelectTrigger
            className={cn(
              "w-full",
              row.FulfilmentStatus && getStatusColor(row.FulfilmentStatus)
            )}
          >
            <SelectValue placeholder="Select status...">
              {row.FulfilmentStatus ? (
                <span className="text-sm font-semibold">
                  {row.FulfilmentStatus}
                </span>
              ) : (
                <span className="text-gray-400">Select status...</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Fully Met">
              <span className="text-green-600 font-semibold">Fully Met</span>
            </SelectItem>
            <SelectItem value="Partially Met">
              <span className="text-yellow-600 font-semibold">
                Partially Met
              </span>
            </SelectItem>
            <SelectItem value="Not Met">
              <span className="text-red-600 font-semibold">Not Met</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="w-[250px]">
        <Popover
          open={isAssessmentOpen}
          onOpenChange={(open) => {
            onOpenAssessmentPopover(open ? row.Id! : null);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between text-left font-normal px-3 h-10"
            >
              <span className="text-sm truncate block max-w-[180px]">
                {row.Assessment || "Select assessment..."}
              </span>
              {isAssessmentOpen ? (
                <ChevronUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search assessment..." />
              <CommandList>
                <CommandEmpty>No assessment found.</CommandEmpty>
                <CommandGroup>
                  {assessmentOptions.map((assessment) => (
                    <CommandItem
                      key={assessment.Id}
                      value={assessment.Title}
                      onSelect={() => {
                        onAssessmentChange(row.Id!, assessment.Id!);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          row.AssessmentId === assessment.Id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {assessment.Title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </TableCell>

      <TableCell className="w-[80px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </UITableRow>
  );
}
