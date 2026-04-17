import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Calendar, Trash2, Eye } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { getFileUrl } from "@/lib/fileUrl";
import { DocumentUploadForm } from "@/components/forms/DocumentUploadForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { Document as DocumentType } from "@/services/documentService";

const Documents = () => {
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const { documents, pagination, page, pageSize, setPage, setPageSize, loading, uploadDocument, deleteDocument, downloadDocument } = useDocuments();

  const handleUpload = async (data: any) => {
    await uploadDocument(data);
    setUploadFormOpen(false);
  };

  const handleDeleteClick = (doc: any) => {
    const fullDocument = documents.find(d => d.id === doc.id);
    if (fullDocument) {
      setSelectedDocument(fullDocument);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedDocument) {
      await deleteDocument(selectedDocument.id);
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const handlePreview = (doc: any) => {
    const fullDocument = documents.find(d => d.id === doc.id);
    if (fullDocument && fullDocument.filePath) {
      window.open(getFileUrl(fullDocument.filePath), '_blank');
    }
  };

  const handleDownload = async (doc: any) => {
    const fullDocument = documents.find(d => d.id === doc.id);
    if (fullDocument) {
      await downloadDocument(fullDocument.id, fullDocument.fileName || fullDocument.title);
    }
  };

  const documentColumns: Column<any>[] = [
    {
      key: 'title',
      header: 'Nama Dokumen',
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium">{item.title || "-"}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => item.category ? (
        <Badge variant="outline">{item.category}</Badge>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'uploadedAt',
      header: 'Tanggal Upload',
      render: (item) => item.uploadedAt ? (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{new Date(item.uploadedAt).toLocaleDateString('id-ID')}</span>
        </div>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handlePreview(item)} title="Pratinjau">
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} title="Download">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)} title="Hapus">
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
          <h1 className="text-3xl font-bold text-foreground">Penyimpanan Dokumen</h1>
          <p className="text-muted-foreground">Kelola dokumen dan laporan pendidikan</p>
        </div>
        <Button onClick={() => setUploadFormOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Dokumen
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Daftar Dokumen</h2>
          <p className="text-sm text-muted-foreground">Total: {pagination?.totalItems ?? documents.length} dokumen</p>
        </div>
        <DataTable
          data={documents}
          columns={documentColumns}
          pagination={pagination || undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          loading={loading}
        />
      </Card>

      <DocumentUploadForm
        open={uploadFormOpen}
        onOpenChange={setUploadFormOpen}
        onSubmit={handleUpload}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Dokumen"
        description={`Apakah Anda yakin ingin menghapus dokumen "${selectedDocument?.title}"?`}
      />
    </div>
  );
};

export default Documents;
