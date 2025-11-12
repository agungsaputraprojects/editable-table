"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash2, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllData,
  setAddDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setSelectedItem,
  updateAssessmentParameter,
} from "@/store/slices/assessmentSlice";
import { AddAssessmentDialog } from "@/components/dialogs/AddAssessmentDialog";
import { EditAssessmentDialog } from "@/components/dialogs/EditAssessmentDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { EditableCell } from "@/components/table/EditableCell";
import { EditableSelectCell } from "@/components/table/EditableSelectCell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DisplayData, FulfilmentStatusType } from "@/types/nocodb";

export default function EditableTable() {
  const dispatch = useAppDispatch();
  const { data, loading, error, subjectOptions } = useAppSelector(
    (state) => state.assessment
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Actual");
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAllData());
  }, [dispatch]);

  const handleAddNew = () => {
    dispatch(setAddDialogOpen(true));
  };

  const handleView = (row: DisplayData) => {
    console.log("View row:", row);
    // TODO: Implement view details modal
  };

  const handleEdit = (row: DisplayData) => {
    dispatch(setSelectedItem(row));
    dispatch(setEditDialogOpen(true));
  };

  const handleDelete = (row: DisplayData) => {
    dispatch(setSelectedItem(row));
    dispatch(setDeleteDialogOpen(true));
  };

  // Handle subject update
  const handleSubjectUpdate = async (
    id: number | undefined,
    newSubjectId: number,
    newSubjectTitle: string,
    row: DisplayData
  ) => {
    if (!id) {
      console.error("No ID found for this row");
      return;
    }

    try {
      // Get target from selected subject
      const selectedSubject = subjectOptions.find((s) => s.Id === newSubjectId);
      const newTarget = selectedSubject?.Target || row.Target;

      await dispatch(
        updateAssessmentParameter({
          id: id,
          SubjectId: newSubjectId,
          Actual: row.Actual,
          Target: newTarget,
          FulfilmentStatus: row.FulfilmentStatus,
          AssessmentId: row.AssessmentId,
        })
      ).unwrap();

      // Refresh data after update
      await dispatch(fetchAllData());
    } catch (error) {
      console.error("Failed to update subject:", error);
    }
  };

  // Handle cell update
  const handleCellUpdate = async (
    id: number | undefined,
    field: "Actual" | "Target",
    newValue: string,
    row: DisplayData
  ) => {
    if (!id) {
      console.error("No ID found for this row");
      return;
    }

    try {
      await dispatch(
        updateAssessmentParameter({
          id: id,
          SubjectId: row.SubjectId,
          Actual: field === "Actual" ? newValue : row.Actual,
          Target: field === "Target" ? newValue : row.Target,
          FulfilmentStatus: row.FulfilmentStatus,
          AssessmentId: row.AssessmentId,
        })
      ).unwrap();

      // Refresh data after update
      await dispatch(fetchAllData());
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    id: number | undefined,
    newStatus: FulfilmentStatusType,
    row: DisplayData
  ) => {
    if (!id) {
      console.error("No ID found for this row");
      return;
    }

    // Close popover immediately
    setOpenPopoverId(null);

    try {
      await dispatch(
        updateAssessmentParameter({
          id: id,
          SubjectId: row.SubjectId,
          Actual: row.Actual,
          Target: row.Target,
          FulfilmentStatus: newStatus,
          AssessmentId: row.AssessmentId,
        })
      ).unwrap();

      // Refresh data after update
      await dispatch(fetchAllData());
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusBadge = (status: FulfilmentStatusType) => {
    switch (status) {
      case "Fully Met":
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-0 font-medium px-3 py-1 cursor-pointer">
            Fully Met
          </Badge>
        );
      case "Partially Met":
        return (
          <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0 font-medium px-3 py-1 cursor-pointer">
            Partially Met
          </Badge>
        );
      case "Not Met":
        return (
          <Badge className="bg-rose-500 text-white hover:bg-rose-600 border-0 font-medium px-3 py-1 cursor-pointer">
            Not Met
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="font-medium px-3 py-1 cursor-pointer"
          >
            Not Set
          </Badge>
        );
    }
  };

  // Filter data based on search and status
  const filteredData = data.filter((row) => {
    const matchesSearch =
      searchQuery === "" ||
      row.Subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.Actual?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.Target?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.FulfilmentStatus?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Actual" || row.FulfilmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold text-lg mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Assessment Parameters
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track assessment parameters
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Parameter
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject, actual, target, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Actual">All Status</SelectItem>
                <SelectItem value="Fully Met">Fully Met</SelectItem>
                <SelectItem value="Partially Met">Partially Met</SelectItem>
                <SelectItem value="Not Met">Not Met</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {filteredData.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">{data.length}</span>{" "}
            records
          </div>

          {/* Table Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold min-w-[300px]">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold min-w-[250px]">
                      Target
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold min-w-[250px]">
                      Actual
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold min-w-[150px]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold min-w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-base font-medium">
                            No records found
                          </p>
                          <p className="text-sm text-gray-400">
                            {searchQuery || statusFilter !== "All Actual"
                              ? "Try adjusting your filters"
                              : 'Click "Add New Parameter" to create a record'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, index) => (
                      <tr
                        key={row.Id}
                        className={`transition-colors hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <EditableSelectCell
                            value={row.Subject || ""}
                            valueId={row.SubjectId}
                            options={subjectOptions}
                            onSave={(subjectId, subjectTitle) =>
                              handleSubjectUpdate(
                                row.Id,
                                subjectId,
                                subjectTitle,
                                row
                              )
                            }
                            placeholder="Click to select subject..."
                          />
                          {row.StandardName && (
                            <div className="text-xs text-gray-600 mt-1 pl-2">
                              {row.StandardName}
                            </div>
                          )}
                          {row.StandardCode && (
                            <Badge
                              variant="outline"
                              className="text-xs font-mono bg-gray-50 mt-1 ml-2"
                            >
                              {row.StandardCode}
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <EditableCell
                            value={row.Target || ""}
                            onSave={(newValue) =>
                              handleCellUpdate(row.Id, "Target", newValue, row)
                            }
                            placeholder="Click to add target..."
                          />
                        </td>

                        <td className="px-6 py-4">
                          <EditableCell
                            value={row.Actual || ""}
                            onSave={(newValue) =>
                              handleCellUpdate(row.Id, "Actual", newValue, row)
                            }
                            placeholder="Click to add actual..."
                          />
                        </td>

                        <td className="px-6 py-4">
                          <Popover
                            open={openPopoverId === row.Id}
                            onOpenChange={(open) =>
                              setOpenPopoverId(open ? row.Id! : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <div className="inline-block">
                                {getStatusBadge(row.FulfilmentStatus || "")}
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2" align="start">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start hover:bg-emerald-50"
                                  onClick={() =>
                                    handleStatusUpdate(row.Id, "Fully Met", row)
                                  }
                                >
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                                  Fully Met
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start hover:bg-amber-50"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      row.Id,
                                      "Partially Met",
                                      row
                                    )
                                  }
                                >
                                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                                  Partially Met
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start hover:bg-rose-50"
                                  onClick={() =>
                                    handleStatusUpdate(row.Id, "Not Met", row)
                                  }
                                >
                                  <div className="w-2 h-2 rounded-full bg-rose-500 mr-2" />
                                  Not Met
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(row)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(row)}
                              className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              title="Edit record"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(row)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay saat update */}
      {loading && data.length > 0 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Updating...
            </span>
          </div>
        </div>
      )}

      <AddAssessmentDialog />
      <EditAssessmentDialog />
      <DeleteDialog />
    </div>
  );
}
