import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

interface DocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultCategory?: string;
}

export const DocumentUploadForm = ({ open, onOpenChange, onSubmit, defaultCategory }: DocumentUploadFormProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(defaultCategory || "");
  const [documentDate, setDocumentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setCategory(defaultCategory || "");
      setDocumentDate(new Date().toISOString().split('T')[0]);
      setFile(null);
    }
  }, [open, defaultCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file || !title || !category || !documentDate) return;

    onSubmit({
      title,
      category,
      documentDate,
      file,
    });
    handleReset();
  };

  const handleReset = () => {
    setTitle("");
    setCategory(defaultCategory || "");
    setDocumentDate(new Date().toISOString().split('T')[0]);
    setFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const categoryOptions = [
    "Administrasi",
    "Akademik",
    "Keuangan",
    "Laporan",
    "Sertifikat",
    "Surat",
    "Dokumentasi",
    "Lainnya"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Dokumen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Dokumen</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul dokumen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
            <Label htmlFor="documentDate">Tanggal Dokumen</Label>
            <Input
              id="documentDate"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  {file ? file.name : 'Klik untuk pilih file'}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!file || !title || !category || !documentDate} className="w-full sm:w-auto">
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
