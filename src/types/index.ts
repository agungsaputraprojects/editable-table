export interface Employee {
  id: number;
  nama: string;
  jabatan: string;
  deskripsi: string;
  status: "Aktif" | "Cuti" | "Nonaktif";
}

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface EditableCellProps {
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  isRichText?: boolean;
}

export type StatusFilter = "Semua" | "Aktif" | "Cuti" | "Nonaktif";
