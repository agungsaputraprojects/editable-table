"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  TableRow as UITableRow,
} from "@/components/ui/table";
import { useAssessmentSubjects } from "@/hooks/useAssessmentSubjects";
import { AlertCircle, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { DisplayData, StatusFilter } from "@/types/nocodb";
import { DeleteDialog } from "./DeleteDialog";
import { TableRow } from "./TableRow";

export default function EditableTable() {
  const {
    data,
    subjectOptions,
    assessmentOptions,
    loading,
    error,
    actualValues,
    fetchData,
    addNewRow,
    deleteRow,
    updateActual,
    updateTarget,
    updateFulfilmentStatus,
    updateAssessment,
    updateSubject,
  } = useAssessmentSubjects();

  const [openSubjectPopover, setOpenSubjectPopover] = useState<number | null>(
    null
  );
  const [openAssessmentPopover, setOpenAssessmentPopover] = useState<
    number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DisplayData | null>(null);

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
          row.FulfilmentStatus.toLowerCase().includes(searchLower)) ||
        (row.Assessment && row.Assessment.toLowerCase().includes(searchLower));

      return matchesStatus && matchesSearch;
    });
  }, [data, searchQuery, statusFilter]);

  const handleDeleteClick = (item: DisplayData) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

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

  const handleSubjectChange = (rowId: number, subjectId: number) => {
    updateSubject(rowId, subjectId);
    setOpenSubjectPopover(null);
  };

  const handleAssessmentChange = (rowId: number, assessmentId: number) => {
    updateAssessment(rowId, assessmentId);
    setOpenAssessmentPopover(null);
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
              placeholder="Search Subject, Actual, Target, Fulfilment Status, or Assessment..."
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
          <Table>
            <TableHeader>
              <UITableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[300px]">Subject</TableHead>
                <TableHead className="w-[300px]">Target</TableHead>
                <TableHead className="w-[200px]">Actual</TableHead>
                <TableHead className="w-[180px]">Fulfilment Status</TableHead>
                <TableHead className="w-[250px]">Assessment</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </UITableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <UITableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    {data.length === 0
                      ? 'No data. Click "Add New" to create.'
                      : "No data matches your filter."}
                  </TableCell>
                </UITableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow
                    key={row.Id}
                    row={row}
                    subjectOptions={subjectOptions}
                    assessmentOptions={assessmentOptions}
                    openSubjectPopover={openSubjectPopover}
                    openAssessmentPopover={openAssessmentPopover}
                    onOpenSubjectPopover={setOpenSubjectPopover}
                    onOpenAssessmentPopover={setOpenAssessmentPopover}
                    onActualChange={updateActual}
                    onTargetChange={updateTarget}
                    onFulfilmentStatusChange={updateFulfilmentStatus}
                    onAssessmentChange={handleAssessmentChange}
                    onSubjectChange={handleSubjectChange}
                    onDelete={handleDeleteClick}
                  />
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
