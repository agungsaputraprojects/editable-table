"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit3, Save, X, Plus, Trash2, Search } from "lucide-react";
import { RichTextEditor, RichTextDisplay } from "./rich-text-editor";
import { Employee, StatusFilter } from "@/types";

const initialData: Employee[] = [
  {
    id: 1,
    nama: "John Doe",
    jabatan: "Frontend Developer",
    deskripsi:
      "Berpengalaman dalam **React** dan *Next.js*\n• Mahir JavaScript ES6+\n• Familiar dengan TypeScript\n• Expert dalam [Tailwind CSS](https://tailwindcss.com)",
    status: "Aktif",
  },
  {
    id: 2,
    nama: "Jane Smith",
    jabatan: "UI/UX Designer",
    deskripsi:
      "Spesialis dalam *desain interface* yang user-friendly\n• Adobe Creative Suite\n• Figma & Sketch\n• Prototyping expert",
    status: "Aktif",
  },
  {
    id: 3,
    nama: "Mike Johnson",
    jabatan: "Backend Developer",
    deskripsi:
      "Expert dalam **Node.js** dan database\n• MongoDB & PostgreSQL\n• RESTful API design\n• Microservices architecture",
    status: "Cuti",
  },
  {
    id: 4,
    nama: "Sarah Williams",
    jabatan: "DevOps Engineer",
    deskripsi:
      "Berpengalaman dalam **CI/CD** pipeline\n• Docker & Kubernetes\n• AWS & Azure\n• Infrastructure as Code",
    status: "Nonaktif",
  },
];

export default function EditableTable() {
  const [data, setData] = useState<Employee[]>(initialData);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null
  );

  // Filtered data berdasarkan search dan status
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filter berdasarkan status
      const matchesStatus =
        statusFilter === "Semua" || row.status === statusFilter;

      // Filter berdasarkan search query (cari di semua field)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        row.nama.toLowerCase().includes(searchLower) ||
        row.jabatan.toLowerCase().includes(searchLower) ||
        row.deskripsi.toLowerCase().includes(searchLower) ||
        row.status.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [data, searchQuery, statusFilter]);

  const startEdit = (
    rowId: number,
    field: keyof Employee,
    currentValue: string
  ) => {
    setEditingCell(`${rowId}-${field}`);
    setEditingValue(currentValue);
  };

  const saveEdit = () => {
    if (editingCell) {
      const [rowId, field] = editingCell.split("-");
      setData((prevData) =>
        prevData.map((row) =>
          row.id === parseInt(rowId) ? { ...row, [field]: editingValue } : row
        )
      );
    }
    setEditingCell(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setData((prevData) =>
        prevData.filter((row) => row.id !== employeeToDelete.id)
      );
    }
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const addNewRow = () => {
    const newId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;
    const newRow: Employee = {
      id: newId,
      nama: "Nama Baru",
      jabatan: "Jabatan",
      deskripsi: "Deskripsi pekerjaan...",
      status: "Aktif",
    };
    setData([...data, newRow]);
  };

  const handleDirectSave = (
    rowId: number,
    field: keyof Employee,
    newValue: string
  ) => {
    setData((prevData) =>
      prevData.map((row) =>
        row.id === rowId ? { ...row, [field]: newValue } : row
      )
    );
    setEditingCell(null);
    setEditingValue("");
  };

  const renderCell = (row: Employee, field: keyof Employee) => {
    const cellId = `${row.id}-${field}`;
    const isEditing = editingCell === cellId;
    const value = String(row[field]);

    if (isEditing) {
      if (field === "deskripsi") {
        return (
          <RichTextEditor
            value={editingValue}
            onChange={setEditingValue}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        );
      } else if (field === "status") {
        return (
          <Select
            value={editingValue}
            onValueChange={(newValue) => {
              handleDirectSave(row.id, field, newValue);
            }}
          >
            <SelectTrigger className="w-full h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Cuti">Cuti</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        );
      } else {
        // Nama & Jabatan - inline edit langsung
        return (
          <Input
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="h-9"
            autoFocus
            placeholder={
              field === "nama" ? "Masukkan nama" : "Masukkan jabatan"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleDirectSave(row.id, field, editingValue);
              }
              if (e.key === "Escape") cancelEdit();
            }}
            onBlur={() => {
              // Auto save on blur (kehilangan fokus)
              if (editingValue !== value) {
                handleDirectSave(row.id, field, editingValue);
              } else {
                cancelEdit();
              }
            }}
          />
        );
      }
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 rounded p-2 min-h-[40px] flex items-center group transition-colors"
        onClick={() => startEdit(row.id, field, value)}
      >
        {field === "deskripsi" ? (
          <RichTextDisplay content={value} />
        ) : field === "status" ? (
          <Badge
            variant={
              value === "Aktif"
                ? "default"
                : value === "Cuti"
                ? "secondary"
                : "outline"
            }
          >
            {value}
          </Badge>
        ) : (
          <span className="text-sm">{value}</span>
        )}
        <Edit3 className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-4">
          <div>
            <CardTitle>Data Karyawan</CardTitle>
            <CardDescription>
              Klik pada sel untuk mengedit. Kolom deskripsi mendukung rich text
              formatting.
            </CardDescription>
          </div>
          <Button onClick={addNewRow} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Data
          </Button>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama, jabatan, deskripsi, atau status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter Dropdown */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Status</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Cuti">Cuti</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Counter */}
        <div className="text-sm text-gray-600 mt-2">
          Menampilkan {filteredData.length} dari {data.length} data
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Nama</TableHead>
                <TableHead className="w-[200px]">Jabatan</TableHead>
                <TableHead className="min-w-[350px]">Deskripsi</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[80px]">Aksi</TableHead>
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
                      ? 'Tidak ada data. Klik tombol "Tambah Data" untuk menambahkan.'
                      : "Tidak ada data yang sesuai dengan filter."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{renderCell(row, "nama")}</TableCell>
                    <TableCell>{renderCell(row, "jabatan")}</TableCell>
                    <TableCell>{renderCell(row, "deskripsi")}</TableCell>
                    <TableCell>{renderCell(row, "status")}</TableCell>
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

        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
          <p className="font-semibold">Tips penggunaan Rich Text Editor:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <code className="bg-gray-200 px-1 rounded">**teks**</code> untuk{" "}
              <strong>bold</strong>
            </li>
            <li>
              <code className="bg-gray-200 px-1 rounded">*teks*</code> untuk{" "}
              <em>italic</em>
            </li>
            <li>
              <code className="bg-gray-200 px-1 rounded">• teks</code> untuk
              bullet points
            </li>
            <li>
              <code className="bg-gray-200 px-1 rounded">[teks](url)</code>{" "}
              untuk link
            </li>
          </ul>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Karyawan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data karyawan{" "}
              <strong>{employeeToDelete?.nama}</strong>? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
