"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssessmentSubjects } from "@/hooks/useAssessmentSubjects";
import { cn } from "@/lib/utils";
import type {
  DisplayData,
  FulfilmentStatusType,
  StatusFilter,
} from "@/types/nocodb";
import {
  ColumnDef,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  Pencil,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { EditableCell } from "./EditableCell";

export default function EditableTable() {
  const {
    data,
    subjectOptions,
    loading,
    error,
    actualValues,
    fetchData,
    addNewRow,
    deleteRow,
    updateActual,
    updateTarget,
    updateFulfilmentStatus,
    updateSubject,
  } = useAssessmentSubjects();

  const [openSubjectPopover, setOpenSubjectPopover] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DisplayData | null>(null);

  const columns = useMemo<ColumnDef<DisplayData>[]>(
    () => [
      {
        accessorKey: "Subject",
        header: "Subject",
        size: 350,
        minSize: 200,
        maxSize: 600,
        cell: (info) => {
          const row = info.row.original;
          const isOpen = openSubjectPopover === row.Id;
          const hasSubject = Boolean(row.Subject);

          // Jika sudah ada subject, tampilkan sebagai text yang bisa diklik dengan 2 field tambahan
          if (hasSubject && !isOpen) {
            return (
              <div
                onClick={() => setOpenSubjectPopover(row.Id!)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded transition-colors"
              >
                <div className="space-y-1">
                  <span className="block max-w-[280px] font-medium">
                    {row.Subject}
                  </span>
                  {row.StandardName && (
                    <div className="text-xs text-gray-600">
                      {row.StandardName}
                    </div>
                  )}
                  {row.StandardCode && (
                    <div className="text-xs text-gray-600">
                      {row.StandardCode}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Tampilkan sebagai dropdown (baik untuk yang belum ada subject atau sedang dibuka)
          return (
            <Popover
              open={isOpen}
              onOpenChange={(open) =>
                setOpenSubjectPopover(open ? row.Id! : null)
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-left font-normal px-3 h-10"
                >
                  <span className="text-sm truncate block max-w-[280px]">
                    {row.Subject || "Select subject..."}
                  </span>
                  {isOpen ? (
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
                      {subjectOptions
                        .filter(
                          (subject) =>
                            subject.Id && (subject.Title || subject.Validate)
                        )
                        .map((subject) => (
                          <CommandItem
                            key={subject.Id}
                            value={
                              subject.Title ||
                              subject.Validate ||
                              `subject-${subject.Id}`
                            }
                            onSelect={() => {
                              updateSubject(row.Id!, subject.Id!);
                              setOpenSubjectPopover(null);
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
                            {subject.Title ||
                              subject.Validate ||
                              `Subject ${subject.Id}`}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );
        },
      },
      {
        accessorKey: "Target",
        header: "Target",
        size: 350,
        minSize: 200,
        maxSize: 600,
        cell: (info) => {
          const row = info.row.original;
          return (
            <EditableCell
              value={row.Target || ""}
              onSave={(newValue) => updateTarget(row.Id!, newValue)}
              placeholder="Click to edit target..."
            />
          );
        },
      },
      {
        accessorKey: "Actual",
        header: "Actual",
        size: 350,
        minSize: 200,
        maxSize: 600,
        cell: (info) => {
          const row = info.row.original;
          return (
            <EditableCell
              value={row.Actual || ""}
              onSave={(newValue) => updateActual(row.Id!, newValue)}
              placeholder="Click to edit actual..."
            />
          );
        },
      },
      {
        accessorKey: "FulfilmentStatus",
        header: "Status",
        size: 180,
        minSize: 120,
        maxSize: 300,
        cell: (info) => {
          const row = info.row.original;
          const getStatusColor = (status: FulfilmentStatusType) => {
            if (status === "Fully Met")
              return "text-green-600 border-green-600";
            if (status === "Partially Met")
              return "text-yellow-600 border-yellow-600";
            if (status === "Not Met") return "text-red-600 border-red-600";
            return "";
          };

          return (
            <Select
              value={row.FulfilmentStatus || ""}
              onValueChange={(value) =>
                updateFulfilmentStatus(row.Id!, value as FulfilmentStatusType)
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
                  <span className="text-green-600 font-semibold">
                    Fully Met
                  </span>
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
          );
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 150,
        minSize: 120,
        maxSize: 200,
        cell: (info) => {
          const row = info.row.original;

          const handleDeleteClick = (item: DisplayData) => {
            setItemToDelete(item);
            setDeleteDialogOpen(true);
          };

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  console.log("View detail:", row.Id);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  console.log("Edit:", row.Id);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteClick(row)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [
      subjectOptions,
      openSubjectPopover,
      updateSubject,
      updateTarget,
      updateActual,
      updateFulfilmentStatus,
    ]
  );

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesStatus =
        statusFilter === "All" || row.Actual === statusFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        (row.Subject && row.Subject.toLowerCase().includes(searchLower)) ||
        (row.Actual && row.Actual.toLowerCase().includes(searchLower)) ||
        (row.Target && row.Target.toLowerCase().includes(searchLower)) ||
        (row.FulfilmentStatus &&
          row.FulfilmentStatus.toLowerCase().includes(searchLower));

      return matchesStatus && matchesSearch;
    });
  }, [data, searchQuery, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange" as ColumnResizeMode,
  });

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteRow(itemToDelete.Id!);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading data from NocoDB...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Data
              </p>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-end items-start mb-4">
          <Button onClick={addNewRow} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Subject, Actual, Target, or Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Actual" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Actual</SelectItem>
              {actualValues.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
          <span>
            Showing {filteredData.length} of {data.length} records
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table style={{ width: table.getCenterTotalSize() }}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="relative bg-cyan-400 text-white font-semibold"
                      style={{
                        width: header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                          "hover:bg-cyan-600 active:bg-cyan-700",
                          header.column.getIsResizing() && "bg-cyan-600"
                        )}
                      >
                        <div className="absolute inset-y-0 -left-1 -right-1" />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-gray-500"
                  >
                    {data.length === 0
                      ? 'No data. Click "Add New" to create.'
                      : "No data matches your filter."}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <DeleteDialog
        open={deleteDialogOpen}
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Card>
  );
}
