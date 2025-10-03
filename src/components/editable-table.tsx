"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  fetchAssessmentSubjects,
  fetchSubjects,
  type AssessmentSubjectRecord,
  type SubjectRecord,
} from "@/lib/nocodb-api";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  ChevronsUpDown,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface DisplayData {
  Id?: number;
  Actual?: string;
  Subject?: string;
  SubjectId?: number;
  Target?: string;
}

type StatusFilter = "All" | string;

export default function EditableTable() {
  const [data, setData] = useState<DisplayData[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openSubjectPopover, setOpenSubjectPopover] = useState<number | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DisplayData | null>(null);

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "object") {
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          return (
            ((firstItem as Record<string, unknown>).Title as string) ||
            ((firstItem as Record<string, unknown>).title as string) ||
            ""
          );
        }
      }
      const obj = value as Record<string, unknown>;
      if (obj.Title) return obj.Title as string;
      if (obj.title) return obj.title as string;
    }
    return String(value);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const subjectsResult = await fetchSubjects(0, 100);
      console.log("Subjects for dropdown:", subjectsResult);
      setSubjectOptions(subjectsResult.list || []);

      const assessmentResult = await fetchAssessmentSubjects(0, 100);
      console.log("Assessment Subjects:", assessmentResult);

      const mappedData: DisplayData[] = (assessmentResult.list || []).map(
        (item: AssessmentSubjectRecord) => {
          const subjectValue = item.Subject;
          let subjectTitle = "";
          let subjectId: number | undefined;

          if (Array.isArray(subjectValue) && subjectValue.length > 0) {
            const firstSubject = subjectValue[0];
            if (typeof firstSubject === "object" && firstSubject !== null) {
              subjectTitle =
                ((firstSubject as Record<string, unknown>).Title as string) ||
                "";
              subjectId = (firstSubject as Record<string, unknown>)
                .Id as number;
            }
          } else if (subjectValue && typeof subjectValue === "object") {
            const subjectObj = subjectValue as Record<string, unknown>;
            subjectTitle = (subjectObj.Title as string) || "";
            subjectId = subjectObj.Id as number;
          }

          return {
            Id: item.Id,
            Actual: renderValue(item.Actual),
            Subject: subjectTitle,
            SubjectId: subjectId,
            Target: renderValue(item.Target),
          };
        }
      );

      setData(mappedData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesStatus =
        statusFilter === "All" || row.Actual === statusFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        (row.Subject && row.Subject.toLowerCase().includes(searchLower)) ||
        (row.Actual && row.Actual.toLowerCase().includes(searchLower)) ||
        (row.Target && row.Target.toLowerCase().includes(searchLower));

      return matchesStatus && matchesSearch;
    });
  }, [data, searchQuery, statusFilter]);

  const actualValues = useMemo(() => {
    const values = new Set(
      data
        .map((row) => row.Actual)
        .filter((value): value is string => Boolean(value) && value !== "")
    );
    return Array.from(values);
  }, [data]);

  const handleDeleteClick = (item: DisplayData) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setData((prevData) =>
        prevData.filter((row) => row.Id !== itemToDelete.Id)
      );
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const addNewRow = () => {
    const newId =
      data.length > 0 ? Math.max(...data.map((d) => d.Id || 0)) + 1 : 1;
    const newRow: DisplayData = {
      Id: newId,
      Actual: "A",
      Subject: "",
      Target: "",
    };
    setData([...data, newRow]);
  };

  const handleActualChange = (rowId: number, newValue: string) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.Id === rowId ? { ...row, Actual: newValue } : row
      )
    );
  };

  const handleSubjectChange = (rowId: number, subjectId: number) => {
    const selectedSubject = subjectOptions.find((s) => s.Id === subjectId);

    if (selectedSubject) {
      setData((prevData) =>
        prevData.map((row) =>
          row.Id === rowId
            ? {
                ...row,
                Subject: selectedSubject.Title || "",
                SubjectId: selectedSubject.Id,
                Target: selectedSubject.Target || "",
              }
            : row
        )
      );
    }

    setOpenSubjectPopover(null);
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
          <div className="flex gap-2">
            <Button onClick={addNewRow} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Subject, Actual, or Target..."
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[120px]">Actual</TableHead>
                <TableHead className="min-w-[400px]">Subject</TableHead>
                <TableHead className="w-[120px]">Target</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    {data.length === 0
                      ? 'No data. Click "Add New" to create.'
                      : "No data matches your filter."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.Id}>
                    <TableCell className="font-medium">{row.Id}</TableCell>

                    <TableCell>
                      <Select
                        value={row.Actual || ""}
                        onValueChange={(value) =>
                          handleActualChange(row.Id!, value)
                        }
                      >
                        <SelectTrigger className="w-full border-0 shadow-none hover:bg-gray-50">
                          <SelectValue>
                            <Badge
                              variant={
                                row.Actual === "A"
                                  ? "default"
                                  : row.Actual === "B"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {row.Actual || "-"}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Popover
                        open={openSubjectPopover === row.Id}
                        onOpenChange={(open) => {
                          setOpenSubjectPopover(open ? row.Id! : null);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            role="combobox"
                            className="w-full justify-between text-left font-normal px-2 h-auto py-2"
                          >
                            <span className="text-sm truncate">
                              {row.Subject || "Select subject..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                      handleSubjectChange(row.Id!, subject.Id!);
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

                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Badge variant="outline">{row.Target || "-"}</Badge>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(row)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-xs text-gray-600 space-y-1">
          <p className="font-semibold">How it works:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Actual: Direct dropdown - choose A, B, C, or D</li>
            <li>
              Subject: Searchable dropdown - click to select or type to filter
            </li>
            <li>Target: Auto-filled based on selected Subject (read-only)</li>
            <li>Changes are local only (not saved to API)</li>
          </ul>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record with subject{" "}
              <strong>{itemToDelete?.Subject}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
