import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ReportTemplate, Section } from "@/types/reportTemplate";

interface ReportTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: ReportTemplate | null;
}

export const ReportTemplateForm = ({ open, onOpenChange, onSubmit, initialData }: ReportTemplateFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setYear(initialData.year || new Date().getFullYear());
      setIsActive(initialData.isActive ?? true);
    } else {
      setTitle("");
      setYear(new Date().getFullYear());
      setIsActive(true);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    onSubmit({
      title,
      year,
      data: initialData?.data || [],
      isActive,
    });
    handleReset();
  };

  const handleReset = () => {
    setTitle("");
    setYear(new Date().getFullYear());
    setIsActive(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Template' : 'Buat Template Baru'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Template</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Tahun</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              placeholder="Masukkan tahun"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Template Aktif</Label>
          </div>

          <p className="text-sm text-muted-foreground">
            * Section template dapat ditambahkan setelah template dibuat di halaman Template Rapor.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? 'Update' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
