import EditableTable from "@/components/editable-table";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Data Karyawan
          </h1>
        </div>

        <EditableTable />
      </div>
    </main>
  );
}
