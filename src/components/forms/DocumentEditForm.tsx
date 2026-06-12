import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Document } from "@/services/documentService";

interface DocumentEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; type: string; category: string }) => Promise<void>;
  document: Document | null;
}

export const DocumentEditForm = ({ open, onOpenChange, onSubmit, document: doc }: DocumentEditFormProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && doc) {
      setTitle(doc.title || "");
      
      // Standardize values to match SelectItems. 
      // If backend returns lowercase, capitalize first letter.
      const rawType = doc.type || "";
      const capitalizedType = rawType ? rawType.charAt(0).toUpperCase() + rawType.slice(1) : "";
      setType(capitalizedType);

      const rawCategory = doc.category || "";
      const capitalizedCategory = rawCategory ? rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1) : "";
      setCategory(capitalizedCategory);
    }
  }, [open, doc]);

  const handleSubmit = async () => {
    if (!title || !type || !category) return;
    
    try {
      setSubmitting(true);
      await onSubmit({
        title,
        type,
        category,
      });
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
            <Label htmlFor="edit-type">Tipe Dokumen</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="edit-type">
                <SelectValue placeholder="Pilih tipe dokumen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rapor">Rapor</SelectItem>
                <SelectItem value="Sertifikat">Sertifikat</SelectItem>
                <SelectItem value="Surat">Surat</SelectItem>
                <SelectItem value="Laporan">Laporan</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrasi">Administrasi</SelectItem>
                <SelectItem value="Akademik">Akademik</SelectItem>
                <SelectItem value="Keuangan">Keuangan</SelectItem>
                <SelectItem value="Kepegawaian">Kepegawaian</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto" disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !type || !category || submitting} className="w-full sm:w-auto">
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
