"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllData, setAddDialogOpen } from "@/store/slices/assessmentSlice";
import { AddAssessmentDialog } from "@/components/dialogs/AddAssessmentDialog";
import { EditableCell } from "@/components/table/EditableCell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { DisplayData, FulfilmentStatusType } from "@/types/nocodb";

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
    // TODO: Implement view details
  };

  const handleEdit = (row: DisplayData) => {
    console.log("Edit row:", row);
    // TODO: Implement edit dialog
  };

  const handleDelete = (row: DisplayData) => {
    console.log("Delete row:", row);
    // TODO: Implement delete confirmation
  };

  const getStatusColor = (status: FulfilmentStatusType) => {
    switch (status) {
      case "Fully Met":
        return "bg-green-100 text-green-800 border-green-200";
      case "Partially Met":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Not Met":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddNew}
          className="bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search Subject, Actual, Target, or Status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Actual">All Actual</SelectItem>
            <SelectItem value="Fully Met">Fully Met</SelectItem>
            <SelectItem value="Partially Met">Partially Met</SelectItem>
            <SelectItem value="Not Met">Not Met</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Count */}
      <div className="text-sm text-gray-600">
        Showing {data.length} of {data.length} records
      </div>

      {/* Table with Horizontal Scroll */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cyan-400 text-white">
                <th className="px-4 py-3 text-left font-semibold min-w-[300px]">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[250px]">
                  Target
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[250px]">
                  Actual
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data available. Click "Add New" to create a record.
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={row.Id}
                    className={`border-t hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {/* Subject */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {row.Subject || "No subject"}
                        </div>
                        {row.StandardName && (
                          <div className="text-sm text-gray-600">
                            {row.StandardName}
                          </div>
                        )}
                        {row.StandardCode && (
                          <div className="text-xs text-gray-500">
                            {row.StandardCode}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3">
                      <EditableCell
                        value={row.Target || ""}
                        onSave={(newValue) => {
                          console.log("Update target:", row.Id, newValue);
                          // TODO: Dispatch update action
                        }}
                        placeholder="Click to edit target..."
                      />
                    </td>

                    {/* Actual */}
                    <td className="px-4 py-3">
                      <EditableCell
                        value={row.Actual || ""}
                        onSave={(newValue) => {
                          console.log("Update actual:", row.Id, newValue);
                          // TODO: Dispatch update action
                        }}
                        placeholder="Click to edit actual..."
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Select
                        value={row.FulfilmentStatus || ""}
                        onValueChange={(value: FulfilmentStatusType) => {
                          console.log("Update status:", row.Id, value);
                          // TODO: Dispatch update action
                        }}
                      >
                        <SelectTrigger
                          className={`w-full ${getStatusColor(
                            row.FulfilmentStatus || ""
                          )}`}
                        >
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fully Met">Fully Met</SelectItem>
                          <SelectItem value="Partially Met">
                            Partially Met
                          </SelectItem>
                          <SelectItem value="Not Met">Not Met</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(row)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(row)}
                          className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(row)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
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

      <AddAssessmentDialog />
    </div>
  );
}
