import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Calendar, Trash2, Eye, Edit } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { getFileUrl } from "@/lib/fileUrl";
import { DocumentUploadForm } from "@/components/forms/DocumentUploadForm";
import { DocumentEditForm } from "@/components/forms/DocumentEditForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { Document as DocumentType } from "@/services/documentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Documents = () => {
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentType | null>(null);
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || undefined;
  const { documents, pagination, page, pageSize, setPage, setPageSize, loading, uploadDocument, updateDocument, deleteDocument, downloadDocument, search, setSearch } = useDocuments(categoryFilter);

  const handleUpload = async (data: any) => {
    await uploadDocument(data);
    setUploadFormOpen(false);
  };

  const handleEditClick = (doc: any) => {
    const fullDocument = documents.find(d => d.id === doc.id);
    if (fullDocument) {
      setSelectedDocument(fullDocument);
      setEditFormOpen(true);
    }
  };

  const handleUpdate = async (data: any) => {
    if (selectedDocument) {
      await updateDocument(selectedDocument.id, data);
      setEditFormOpen(false);
      setSelectedDocument(null);
    }
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
    if (fullDocument) {
      setPreviewDoc(fullDocument);
      setPreviewOpen(true);
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
      key: 'documentDate',
      header: 'Tanggal Dokumen',
      render: (item) => item.documentDate ? (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{new Date(item.documentDate).toLocaleDateString('id-ID')}</span>
        </div>
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
          <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} title="Edit">
            <Edit className="w-4 h-4 text-amber-500" />
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

        <DataTable
          data={documents}
          columns={documentColumns}
          pagination={pagination || undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </Card>

      <DocumentUploadForm
        open={uploadFormOpen}
        onOpenChange={setUploadFormOpen}
        onSubmit={handleUpload}
        defaultCategory={categoryFilter}
      />

      <DocumentEditForm
        open={editFormOpen}
        onOpenChange={(open) => {
          setEditFormOpen(open);
          if (!open) setSelectedDocument(null);
        }}
        onSubmit={handleUpdate}
        document={selectedDocument}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Dokumen"
        description={`Apakah Anda yakin ingin menghapus dokumen "${selectedDocument?.title}"?`}
      />

      {/* Dialog Preview Dokumen */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] h-[90vh] sm:h-[85vh] flex flex-col p-3 sm:p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{previewDoc?.title || "Pratinjau Dokumen"}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden border rounded bg-slate-50 min-h-0 flex flex-col">
            {previewDoc ? (
              (() => {
                const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
                const filePath = previewDoc.filePath || "";
                const fileUrl = filePath.startsWith("http") ? filePath : `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
                const extension = filePath.split('.').pop()?.toLowerCase() || '';
                
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                  return (
                    <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-auto">
                      <img 
                        src={fileUrl} 
                        alt={previewDoc.title} 
                        className="max-w-full max-h-full object-contain rounded shadow-md"
                      />
                    </div>
                  );
                } else if (extension === 'pdf') {
                  return (
                    <iframe 
                      src={`${fileUrl}#toolbar=0`} 
                      className="w-full h-full border-0 rounded flex-1 min-h-0" 
                      title={previewDoc.title}
                    />
                  );
                } else {
                  return (
                    <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-auto">
                      <div className="text-center space-y-4">
                        <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-semibold text-lg">Pratinjau tidak tersedia untuk format ini</p>
                          <p className="text-sm text-muted-foreground mb-4">Silakan unduh dokumen untuk melihat isi file.</p>
                          <Button onClick={() => handleDownload(previewDoc)}>
                            <Download className="w-4 h-4 mr-2" />
                            Unduh Dokumen
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()
            ) : null}
          </div>

          <DialogFooter className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Tutup
            </Button>
            {previewDoc && (
              <Button 
                onClick={() => {
                  if (previewDoc.filePath) {
                    const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
                    const filePath = previewDoc.filePath;
                    const fileUrl = filePath.startsWith("http") ? filePath : `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
                    window.open(fileUrl, '_blank');
                  }
                }}
              >
                Buka di Tab Baru
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
