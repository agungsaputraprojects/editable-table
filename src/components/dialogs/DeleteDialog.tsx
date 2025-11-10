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
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDeleteDialogOpen,
  deleteAssessmentParameter,
  fetchAllData,
} from "@/store/slices/assessmentSlice";

export function DeleteDialog() {
  const dispatch = useAppDispatch();
  const { isDeleteDialogOpen, selectedItem, loading } = useAppSelector(
    (state) => state.assessment
  );

  const handleConfirm = async () => {
    if (!selectedItem?.Id) return;

    try {
      await dispatch(deleteAssessmentParameter(selectedItem.Id)).unwrap();
      // Refetch data after successful deletion
      await dispatch(fetchAllData());
    } catch (error) {
      console.error("Failed to delete assessment:", error);
    }
  };

  const handleCancel = () => {
    dispatch(setDeleteDialogOpen(false));
  };

  if (!selectedItem) return null;

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Record?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the record with subject{" "}
            <strong>{selectedItem.Subject}</strong>? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
