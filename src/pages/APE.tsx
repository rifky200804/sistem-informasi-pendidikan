import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { APEForm } from "@/components/forms/APEForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useAPE } from "@/hooks/useAPE";
import { CreateAPEData, APE as APEType } from "@/services/apeService";

interface APE {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  location: string;
  ageGroup: string;
}

const mockAPE: APE[] = [
  { id: 'APE-001', name: 'Puzzle Kayu Bentuk Geometri', category: 'Kognitif', quantity: 15, condition: 'Baik', location: 'Kelas A', ageGroup: '3-4 tahun' },
  { id: 'APE-002', name: 'Balok Susun Warna-Warni', category: 'Motorik Halus', quantity: 20, condition: 'Baik', location: 'Kelas B', ageGroup: '4-5 tahun' },
  { id: 'APE-003', name: 'Bola Karet Besar', category: 'Motorik Kasar', quantity: 10, condition: 'Rusak Ringan', location: 'Ruang Olahraga', ageGroup: '3-5 tahun' },
  { id: 'APE-004', name: 'Set Alat Musik Mini', category: 'Seni & Kreativitas', quantity: 8, condition: 'Baik', location: 'Ruang Musik', ageGroup: '4-6 tahun' },
  { id: 'APE-005', name: 'Papan Tulis Mini + Spidol', category: 'Literasi', quantity: 12, condition: 'Baik', location: 'Kelas C', ageGroup: '5-6 tahun' },
  { id: 'APE-006', name: 'Boneka Tangan Profesi', category: 'Sosial Emosional', quantity: 6, condition: 'Baik', location: 'Ruang Bermain', ageGroup: '3-5 tahun' },
];

const columns: Column<APE>[] = [
  { key: 'id', header: 'Kode APE' },
  {
    key: 'name',
    header: 'Nama APE',
    render: (item) => item.name ? (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-primary" />
        <span className="font-medium">{item.name}</span>
      </div>
    ) : "-",
  },
  {
    key: 'category',
    header: 'Kategori',
    render: (item) => (
      <Badge variant="outline">{item.category}</Badge>
    ),
  },
  {
    key: 'quantity',
    header: 'Jumlah',
    render: (item) => (
      <span className="font-semibold">{item.quantity} unit</span>
    ),
  },
  {
    key: 'condition',
    header: 'Kondisi',
    render: (item) => (
      <Badge variant={item.condition === 'Baik' ? 'default' : 'destructive'}>
        {item.condition}
      </Badge>
    ),
  },
  { key: 'location', header: 'Lokasi' },
  { key: 'ageGroup', header: 'Kelompok Usia' },
];

const APE = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAPE, setSelectedAPE] = useState<APEType | undefined>();
  const [deleteId, setDeleteId] = useState<string>("");
  const { apeList, loading, createAPE, updateAPE, deleteAPE } = useAPE();

  const handleCreate = async (data: CreateAPEData) => {
    await createAPE(data);
  };

  const handleEdit = (ape: APEType) => {
    setSelectedAPE(ape);
    setIsFormOpen(true);
  };

  const handleUpdate = async (data: CreateAPEData) => {
    if (selectedAPE) {
      await updateAPE(selectedAPE.id, data);
      setSelectedAPE(undefined);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteAPE(deleteId);
    setIsDeleteOpen(false);
    setDeleteId("");
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAPE(undefined);
  };

  const apeColumns: Column<any>[] = [
    { key: 'id', header: 'Kode APE' },
    {
      key: 'name',
      header: 'Nama APE',
      render: (item) => item.name ? (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium">{item.name}</span>
        </div>
      ) : "-",
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => (
        <Badge variant="outline">{item.category}</Badge>
      ),
    },
    {
      key: 'quantity',
      header: 'Jumlah',
      render: (item) => (
        <span className="font-semibold">{item.quantity} unit</span>
      ),
    },
    {
      key: 'condition',
      header: 'Kondisi',
      render: (item) => (
        <Badge variant={item.condition === 'Baik' || item.condition === 'baik' ? 'default' : 'destructive'}>
          {item.condition}
        </Badge>
      ),
    },
    { key: 'location', header: 'Lokasi' },
    { key: 'ageGroup', header: 'Kelompok Usia' },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const displayData = loading ? mockAPE : (apeList.length > 0 ? apeList : mockAPE);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data APE</h1>
          <p className="text-muted-foreground">Kelola Alat Permainan Edukatif</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah APE
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Daftar APE</h2>
          <p className="text-sm text-muted-foreground">
            Total: {displayData.reduce((acc, item) => acc + item.quantity, 0)} unit dari {displayData.length} jenis
          </p>
        </div>
        <DataTable data={displayData} columns={apeColumns} />
      </Card>

      <APEForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={selectedAPE ? handleUpdate : handleCreate}
        ape={selectedAPE}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data APE"
        description="Apakah Anda yakin ingin menghapus data APE ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default APE;
