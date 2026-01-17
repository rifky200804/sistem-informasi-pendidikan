import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Calendar, Trash2 } from "lucide-react";
import { DataTable, Column, PaginationInfo } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { DocumentUploadForm } from "@/components/forms/DocumentUploadForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { Document as DocumentType } from "@/services/documentService";

interface Document {
  id: string;
  title: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  category: string;
}

const mockDocuments: Document[] = [
  { id: 'DOC-001', title: 'Rapor Semester 1 2024', type: 'PDF', uploadedBy: 'Siti Aminah', uploadDate: '2024-01-15', size: '2.3 MB', category: 'Rapor' },
  { id: 'DOC-002', title: 'Kurikulum PAUD 2024', type: 'PDF', uploadedBy: 'Budi Santoso', uploadDate: '2024-01-10', size: '1.5 MB', category: 'Kurikulum' },
  { id: 'DOC-003', title: 'Foto Kegiatan Januari', type: 'ZIP', uploadedBy: 'Dewi Lestari', uploadDate: '2024-01-20', size: '15.2 MB', category: 'Dokumentasi' },
  { id: 'DOC-004', title: 'Surat Edaran Orang Tua', type: 'DOCX', uploadedBy: 'Ahmad Fauzi', uploadDate: '2024-01-18', size: '0.8 MB', category: 'Surat' },
  { id: 'DOC-005', title: 'Jadwal Pembelajaran', type: 'XLSX', uploadedBy: 'Rina Kartika', uploadDate: '2024-01-12', size: '0.5 MB', category: 'Jadwal' },
  { id: 'DOC-006', title: 'Daftar Hadir Siswa', type: 'PDF', uploadedBy: 'Siti Aminah', uploadDate: '2024-01-22', size: '1.1 MB', category: 'Absensi' },
  { id: 'DOC-007', title: 'Rencana Kegiatan Bulanan', type: 'DOCX', uploadedBy: 'Budi Santoso', uploadDate: '2024-01-25', size: '0.9 MB', category: 'Jadwal' },
  { id: 'DOC-008', title: 'Laporan Perkembangan Anak', type: 'PDF', uploadedBy: 'Dewi Lestari', uploadDate: '2024-01-28', size: '3.2 MB', category: 'Rapor' },
  { id: 'DOC-009', title: 'Materi Pembelajaran Februari', type: 'ZIP', uploadedBy: 'Ahmad Fauzi', uploadDate: '2024-02-01', size: '8.5 MB', category: 'Kurikulum' },
  { id: 'DOC-010', title: 'Dokumentasi Kegiatan Olahraga', type: 'ZIP', uploadedBy: 'Rina Kartika', uploadDate: '2024-02-05', size: '22.1 MB', category: 'Dokumentasi' },
];

const columns: Column<Document>[] = [
  { key: 'id', header: 'ID Dokumen' },
  {
    key: 'title',
    header: 'Nama Dokumen',
    render: (item) => item.title ? (
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <span className="font-medium">{item.title}</span>
      </div>
    ) : "-",
  },
  {
    key: 'type',
    header: 'Tipe',
    render: (item) => item.type ? (
      <Badge variant="outline">{item.type}</Badge>
    ) : "-",
  },
  { key: 'category', header: 'Kategori' },
  { key: 'uploadedBy', header: 'Diupload Oleh' },
  {
    key: 'uploadDate',
    header: 'Tanggal Upload',
    render: (item) => item.uploadDate ? (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{new Date(item.uploadDate).toLocaleDateString('id-ID')}</span>
      </div>
    ) : "-",
  },
  { key: 'size', header: 'Ukuran' },
  {
    key: 'id',
    header: 'Aksi',
    render: (item) => (
      <Button variant="ghost" size="sm">
        <Download className="w-4 h-4" />
      </Button>
    ),
  },
];

const Documents = () => {
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const { documents, loading, uploadDocument, deleteDocument, downloadDocument } = useDocuments();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleUpload = async (data: any) => {
    await uploadDocument(data);
    setUploadFormOpen(false);
  };

  const handleDeleteClick = (document: Document) => {
    const fullDocument = documents.find(d => d.id === document.id);
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

  const handleDownload = async (document: Document) => {
    const fullDocument = documents.find(d => d.id === document.id);
    if (fullDocument) {
      await downloadDocument(fullDocument.id, fullDocument.fileName);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const allData = documents.length > 0 ? documents.map(d => ({
    id: d.id,
    title: d.title,
    type: d.type,
    uploadedBy: d.uploadedBy,
    uploadDate: d.uploadedAt,
    size: `${(d.fileSize / 1024 / 1024).toFixed(1)} MB`,
    category: 'Dokumen',
  })) : mockDocuments;

  // Calculate pagination
  const totalItems = allData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayData = allData.slice(startIndex, endIndex);

  const pagination: PaginationInfo = {
    page: currentPage,
    pageSize: pageSize,
    totalItems: totalItems,
    totalPages: totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  const columnsWithActions: Column<Document>[] = [
    ...columns.slice(0, -1),
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)}>
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
          <p className="text-sm text-muted-foreground">Total: {displayData.length} dokumen</p>
        </div>
        <DataTable
          data={displayData}
          columns={columnsWithActions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
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
