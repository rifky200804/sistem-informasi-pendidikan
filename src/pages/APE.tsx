import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit, Trash2, Eye, X, Download } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { APEForm } from "@/components/forms/APEForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useAPE } from "@/hooks/useAPE";
import { CreateAPEData, APE as APEType } from "@/services/apeService";
import { getFileUrl } from "@/lib/fileUrl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const APE = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedAPE, setSelectedAPE] = useState<APEType | undefined>();
  const [deleteId, setDeleteId] = useState<number | string>("");
  const { apeList, pagination, page, pageSize, setPage, setPageSize, loading, createAPE, updateAPE, deleteAPE } = useAPE();

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

  const handleDeleteClick = (id: number | string) => {
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

  const handlePreview = (imagePath: string) => {
    setPreviewImage(getFileUrl(imagePath));
    setIsPreviewOpen(true);
  };

  const apeColumns: Column<any>[] = [
    {
      key: 'name',
      header: 'Nama APE',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded border bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
            {item.imageUrl || item.photo ? (
              <img 
                src={getFileUrl(item.imageUrl || item.photo)} 
                alt={item.name} 
                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                onClick={() => handlePreview(item.imageUrl || item.photo)}
              />
            ) : (
              <Package className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'condition',
      header: 'Kondisi',
      render: (item) => (
        <Badge variant={item.condition === 'Baik' ? 'default' : 'secondary'}>
          {item.condition || "-"}
        </Badge>
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
      key: 'location', 
      header: 'Lokasi',
      render: (item) => item.location || <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          {item.imageUrl || item.photo ? (
            <Button variant="ghost" size="sm" onClick={() => handlePreview((item.imageUrl || item.photo) as string)} title="Pratinjau Gambar">
              <Eye className="w-4 h-4 text-blue-500" />
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Edit">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item.id)} title="Hapus">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

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
            Total: {apeList.reduce((acc, item) => acc + item.quantity, 0)} unit dari {apeList.length} jenis
          </p>
        </div>
        <DataTable
          data={apeList}
          columns={apeColumns}
          pagination={pagination || undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          loading={loading}
        />
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

      {/* Image Preview Lightbox */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent hideClose className="max-w-3xl p-1 bg-transparent border-none shadow-none flex items-center justify-center">
          {previewImage && (
            <div className="relative group">
              <img 
                src={previewImage} 
                alt="APE Preview" 
                className="max-h-[85vh] rounded-lg shadow-2xl"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute -top-4 -right-4 bg-background rounded-full p-2 h-10 w-10 shadow-lg"
                onClick={() => setIsPreviewOpen(false)}
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </Button>
              <a
                href={previewImage}
                download="ape_image.jpg"
                target="_blank"
                className="absolute -top-4 right-8 bg-background rounded-full border border-input shadow-lg hover:bg-accent hover:text-accent-foreground h-10 w-10 flex items-center justify-center transition-colors"
                title="Download Gambar"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APE;
