import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Section, Question } from "@/types/reportTemplate";
import { Save, Upload, X } from "lucide-react";
import { ImageCropDialog } from "@/components/dialogs/ImageCropDialog";

interface StudentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  templateName: string;
  sections: Section[];
  reportData?: Record<string, any>;
  onSave?: (data: Record<string, any>) => void;
  readOnly?: boolean;
}

export const StudentReportDialog = ({
  open,
  onOpenChange,
  studentName,
  templateName,
  sections,
  reportData,
  onSave,
  readOnly = false,
}: StudentReportDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const [currentSectionId, setCurrentSectionId] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (reportData) {
      setFormData(reportData);
    } else {
      const initialData: Record<string, any> = {};
      sections.forEach((section) => {
        const sectionId = section.id || section.Section;
        if (section.type === "table_text") {
          const rows = section.Questions?.map((q: Question) => ({
            Question: q.Question,
            answer: q.answer || "",
            Ket: q.Ket || ""
          })) || [];
          initialData[sectionId] = { rows };
        } else if (section.type === "table") {
          const rows = section.Questions?.map((q: Question) => ({
            Question: q.Question,
            answer: q.answer || "",
            answers: q.answers || [],
            Ket: q.Ket || ""
          })) || [];
          initialData[sectionId] = { rows };
        } else if (section.type === "text") {
          initialData[sectionId] = { 
            text: section.Questions?.[0]?.answer || "", 
            photo: section.Questions?.[0]?.photo || "" 
          };
        }
      });
      setFormData(initialData);
    }
  }, [sections, reportData, open]);

  const handleTableTextChange = (sectionId: string, rowIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const sectionData = prev[sectionId] || { rows: [] };
      const rows = [...(sectionData.rows || [])];
      if (!rows[rowIndex]) {
        rows[rowIndex] = { Question: "", answer: "", Ket: "" };
      }
      rows[rowIndex][field] = value;
      return { ...prev, [sectionId]: { ...sectionData, rows } };
    });
  };

  const handleTableChange = (sectionId: string, rowIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const sectionData = prev[sectionId] || { rows: [] };
      const rows = [...(sectionData.rows || [])];
      if (!rows[rowIndex]) {
        rows[rowIndex] = { Question: "", answer: "", answers: [], Ket: "" };
      }
      rows[rowIndex][field] = value;
      return { ...prev, [sectionId]: { ...sectionData, rows } };
    });
  };

  const handleTextChange = (sectionId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], text: value },
    }));
  };

  const handleFileUpload = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImageSrc(event.target?.result as string);
        setCurrentSectionId(sectionId);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentSectionId]: { ...prev[currentSectionId], photo: croppedImageUrl },
    }));
  };

  const handleRemoveImage = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], photo: null },
    }));
  };

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {readOnly ? "Lihat" : "Edit"} Rapor - {studentName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Template: {templateName}</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {sections.map((section) => {
              const sectionId = section.id || section.Section;
              return (
                <div key={sectionId} className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{section.Section}</h3>
                  </div>

                  {section.type === "table_text" && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse min-w-[500px]">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left bg-muted">Pertanyaan</th>
                            <th className="border p-2 text-left bg-muted w-20">Nilai</th>
                            <th className="border p-2 text-left bg-muted">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData[sectionId]?.rows || []).map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="border p-2">{row.Question}</td>
                              <td className="border p-1">
                                <Input
                                  className="h-8 text-center"
                                  value={row.answer || ""}
                                  onChange={(e) => handleTableTextChange(sectionId, idx, "answer", e.target.value)}
                                  readOnly={readOnly}
                                />
                              </td>
                              <td className="border p-1">
                                <Input
                                  className="h-8"
                                  value={row.Ket || ""}
                                  onChange={(e) => handleTableTextChange(sectionId, idx, "Ket", e.target.value)}
                                  readOnly={readOnly}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === "table" && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse min-w-[600px]">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left bg-muted">Aspek</th>
                            {(section.Questions?.[0]?.answers || []).map((opt: string) => (
                              <th key={opt} className="border p-1 text-center bg-muted text-xs">{opt}</th>
                            ))}
                            <th className="border p-2 text-left bg-muted">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData[sectionId]?.rows || []).map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="border p-2">{row.Question}</td>
                              {(row.answers || section.Questions?.[idx]?.answers || []).map((opt: string) => (
                                <td key={opt} className="border p-1 text-center">
                                  <input
                                    type="radio"
                                    name={`answer-${sectionId}-${idx}`}
                                    checked={row.answer === opt}
                                    onChange={() => !readOnly && handleTableChange(sectionId, idx, "answer", opt)}
                                    disabled={readOnly}
                                    className="w-4 h-4"
                                  />
                                </td>
                              ))}
                              <td className="border p-1">
                                <Input
                                  className="h-8"
                                  value={row.Ket || ""}
                                  onChange={(e) => handleTableChange(sectionId, idx, "Ket", e.target.value)}
                                  readOnly={readOnly}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === "text" && (
                    <div className="flex gap-4">
                      {/* Text Section - Left */}
                      <div className="flex-1">
                        <Label className="mb-2 block text-xs">{section.Questions?.[0]?.Question || "Catatan"}</Label>
                        <Textarea
                          placeholder="Masukkan catatan..."
                          value={formData[sectionId]?.text || ""}
                          onChange={(e) => handleTextChange(sectionId, e.target.value)}
                          readOnly={readOnly}
                          rows={4}
                        />
                      </div>

                      {/* Image Upload Section - Right */}
                      <div className="flex-shrink-0">
                        <Label className="mb-2 block text-xs">Gambar</Label>
                        <input
                          type="file"
                          ref={(el) => { fileInputRefs.current[sectionId] = el; }}
                          accept="image/*"
                          onChange={(e) => handleFileUpload(sectionId, e)}
                          className="hidden"
                        />
                        <div 
                          className={`w-[100px] h-[100px] border-2 border-dashed rounded-md flex items-center justify-center overflow-hidden ${
                            !readOnly ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
                          }`}
                          onClick={() => !readOnly && fileInputRefs.current[sectionId]?.click()}
                        >
                          {formData[sectionId]?.photo ? (
                            <img 
                              src={formData[sectionId].photo} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <Upload className="w-6 h-6 mx-auto mb-1" />
                              <span className="text-xs">100x100</span>
                            </div>
                          )}
                        </div>
                        {formData[sectionId]?.photo && !readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-1 w-full text-xs"
                            onClick={() => handleRemoveImage(sectionId)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
            {!readOnly && (
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};
