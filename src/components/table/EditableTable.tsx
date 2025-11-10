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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { DisplayData, FulfilmentStatusType } from "@/types/nocodb";
// import { toast } from "sonner"; // Optional: untuk notification

export default function EditableTable() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.assessment);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Actual");

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

      // Optional: Show success notification
      // toast.success(`${field} updated successfully`);
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      // Optional: Show error notification
      // toast.error(`Failed to update ${field}`);
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

      // Optional: Show success notification
      // toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      // Optional: Show error notification
      // toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: FulfilmentStatusType) => {
    switch (status) {
      case "Fully Met":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 font-medium">
            Fully Met
          </Badge>
        );
      case "Partially Met":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 font-medium">
            Partially Met
          </Badge>
        );
      case "Not Met":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 font-medium">
            Not Met
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium">
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

      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
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
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {filteredData.length}
        </span>{" "}
        of <span className="font-semibold text-gray-900">{data.length}</span>{" "}
        records
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
            <tbody className="divide-y divide-gray-200">
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
                      <p className="text-base font-medium">No records found</p>
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
                      <div className="space-y-1.5">
                        <div className="font-medium text-gray-900 text-sm leading-relaxed">
                          {row.Subject || "No subject"}
                        </div>
                        {row.StandardName && (
                          <div className="text-xs text-gray-600">
                            {row.StandardName}
                          </div>
                        )}
                        {row.StandardCode && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono bg-gray-50"
                          >
                            {row.StandardCode}
                          </Badge>
                        )}
                      </div>
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
                      <Select
                        value={row.FulfilmentStatus || ""}
                        onValueChange={(value: FulfilmentStatusType) =>
                          handleStatusUpdate(row.Id, value, row)
                        }
                      >
                        <SelectTrigger className="w-full border-gray-300">
                          <SelectValue placeholder="Select status...">
                            {getStatusBadge(row.FulfilmentStatus || "")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fully Met">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              Fully Met
                            </div>
                          </SelectItem>
                          <SelectItem value="Partially Met">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500" />
                              Partially Met
                            </div>
                          </SelectItem>
                          <SelectItem value="Not Met">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-500" />
                              Not Met
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
