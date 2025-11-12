"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setEditDialogOpen,
  updateAssessmentParameter,
  fetchAllData,
} from "@/store/slices/assessmentSlice";
import type { FulfilmentStatusType } from "@/types/nocodb";

export function EditAssessmentDialog() {
  const dispatch = useAppDispatch();
  const { isEditDialogOpen, selectedItem, subjectOptions, loading } =
    useAppSelector((state) => state.assessment);

  const [formData, setFormData] = useState({
    SubjectId: undefined as number | undefined,
    Actual: "",
    Target: "",
    FulfilmentStatus: "" as FulfilmentStatusType,
  });

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        SubjectId: selectedItem.SubjectId,
        Actual: selectedItem.Actual || "",
        Target: selectedItem.Target || "",
        FulfilmentStatus: selectedItem.FulfilmentStatus || "",
      });
    }
  }, [selectedItem]);

  // Auto-fill Target when Subject is selected
  useEffect(() => {
    if (formData.SubjectId) {
      const selectedSubject = subjectOptions.find(
        (s) => s.Id === formData.SubjectId
      );
      if (selectedSubject?.Target) {
        setFormData((prev) => ({
          ...prev,
          Target: selectedSubject.Target || "",
        }));
      }
    }
  }, [formData.SubjectId, subjectOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem?.Id) return;

    try {
      await dispatch(
        updateAssessmentParameter({
          id: selectedItem.Id,
          ...formData,
        })
      ).unwrap();
      // Refetch data after successful update
      await dispatch(fetchAllData());
    } catch (error) {
      console.error("Failed to update assessment:", error);
    }
  };

  const handleClose = () => {
    dispatch(setEditDialogOpen(false));
  };

  // Transform options for Combobox (without subtitle)
  const subjectComboboxOptions = subjectOptions.map((subject) => ({
    value: subject.Id!.toString(),
    label: subject.Title || subject.Validate || `Subject ${subject.Id}`,
  }));

  if (!selectedItem) return null;

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Assessment Parameter</DialogTitle>
          <DialogDescription>
            Update the details for the assessment parameter.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Subject Combobox */}
            <div className="grid gap-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={subjectComboboxOptions}
                value={formData.SubjectId?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    SubjectId: value ? parseInt(value) : undefined,
                  }))
                }
                placeholder="Select subject..."
                searchPlaceholder="Search subjects..."
                emptyText="No subject found."
              />
            </div>

            {/* Target */}
            <div className="grid gap-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                value={formData.Target}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, Target: e.target.value }))
                }
                placeholder="Auto-filled from subject or enter manually"
              />
            </div>

            {/* Actual */}
            <div className="grid gap-2">
              <Label htmlFor="actual">Actual</Label>
              <Input
                id="actual"
                value={formData.Actual}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, Actual: e.target.value }))
                }
                placeholder="Enter actual value"
              />
            </div>

            {/* Fulfilment Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Fulfilment Status</Label>
              <Select
                value={formData.FulfilmentStatus}
                onValueChange={(value: FulfilmentStatusType) =>
                  setFormData((prev) => ({
                    ...prev,
                    FulfilmentStatus: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fully Met">Fully Met</SelectItem>
                  <SelectItem value="Partially Met">Partially Met</SelectItem>
                  <SelectItem value="Not Met">Not Met</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.SubjectId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
