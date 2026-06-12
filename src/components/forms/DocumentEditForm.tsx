import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "@/services/documentService";
import { Upload } from "lucide-react";

interface DocumentEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; category: string; documentDate: string; file?: File }) => Promise<void>;
  document: Document | null;
}

export const DocumentEditForm = ({ open, onOpenChange, onSubmit, document: doc }: DocumentEditFormProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryOptions = [
    "Administrasi",
    "Akademik",
    "Keuangan",
    "Kepegawaian",
    "Laporan",
    "Rapor",
    "Sertifikat",
    "Surat",
    "Notulen",
    "Inventaris",
    "Panduan",
    "Evaluasi",
    "Dokumentasi",
    "Lainnya"
  ];

  useEffect(() => {
    if (open && doc) {
      setTitle(doc.title || "");
      setFile(null); // Reset selected file on open

      const rawCategory = doc.category || "";
      // Match case-insensitively to any of our allowed category options
      const matched = categoryOptions.find(opt => opt.toLowerCase() === rawCategory.toLowerCase()) || "";
      setCategory(matched);

      // Pre-fill date (extract YYYY-MM-DD from DateTime string, fallback to uploadedAt or today's date)
      const initialDate = doc.documentDate 
        ? doc.documentDate.split('T')[0] 
        : (doc.uploadedAt ? doc.uploadedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
      setDocumentDate(initialDate);
    }
  }, [open, doc]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!title || !category || !documentDate) return;
    
    try {
      setSubmitting(true);
      await onSubmit({
        title,
        category,
        documentDate,
        file: file || undefined,
      });
      setFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Gagal mengupdate dokumen:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Dokumen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Judul Dokumen</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul dokumen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-documentDate">Tanggal Dokumen</Label>
            <Input
              id="edit-documentDate"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-file">File Dokumen (Kosongkan jika tidak ingin mengubah file)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Input
                id="edit-file"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label htmlFor="edit-file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  {file ? file.name : 'Klik untuk pilih file baru'}
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, Word, Excel, atau Gambar (Max 10MB)
                </p>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto" disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !category || !documentDate || submitting} className="w-full sm:w-auto">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
