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
import type { DisplayData } from "@/types/nocodb";

interface DeleteDialogProps {
  open: boolean;
  item: DisplayData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({
  open,
  item,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Record?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this record with subject{" "}
            <strong>{item?.Subject}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
