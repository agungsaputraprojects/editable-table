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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAddDialogOpen,
  createAssessmentParameter,
  fetchAllData,
} from "@/store/slices/assessmentSlice";
import type { FulfilmentStatusType } from "@/types/nocodb";

export function AddAssessmentDialog() {
  const dispatch = useAppDispatch();
  const { isAddDialogOpen, subjectOptions, assessmentOptions, loading } =
    useAppSelector((state) => state.assessment);

  const [formData, setFormData] = useState({
    SubjectId: undefined as number | undefined,
    Actual: "",
    Target: "",
    FulfilmentStatus: "" as FulfilmentStatusType,
    AssessmentId: undefined as number | undefined,
  });

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

    try {
      await dispatch(createAssessmentParameter(formData)).unwrap();
      // Refetch data after successful creation
      await dispatch(fetchAllData());
      // Reset form
      setFormData({
        SubjectId: undefined,
        Actual: "",
        Target: "",
        FulfilmentStatus: "",
        AssessmentId: undefined,
      });
    } catch (error) {
      console.error("Failed to create assessment:", error);
    }
  };

  const handleClose = () => {
    dispatch(setAddDialogOpen(false));
    // Reset form when closing
    setFormData({
      SubjectId: undefined,
      Actual: "",
      Target: "",
      FulfilmentStatus: "",
      AssessmentId: undefined,
    });
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Assessment Parameter</DialogTitle>
          <DialogDescription>
            Fill in the details for the new assessment parameter.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Subject Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.SubjectId?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    SubjectId: parseInt(value),
                  }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject.Id} value={subject.Id!.toString()}>
                      {subject.Title ||
                        subject.Validate ||
                        `Subject ${subject.Id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target (auto-filled) */}
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

            {/* Assessment Dropdown */}
            <div className="grid gap-2">
              <Label htmlFor="assessment">Assessment</Label>
              <Select
                value={formData.AssessmentId?.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    AssessmentId: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment..." />
                </SelectTrigger>
                <SelectContent>
                  {assessmentOptions.map((assessment) => (
                    <SelectItem
                      key={assessment.Id}
                      value={assessment.Id!.toString()}
                    >
                      {assessment.Title || `Assessment ${assessment.Id}`}
                    </SelectItem>
                  ))}
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
