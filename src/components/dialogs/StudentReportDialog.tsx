import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Section, Question } from "@/types/reportTemplate";
import { Save, Upload, X } from "lucide-react";
import { ImageCropDialog } from "@/components/dialogs/ImageCropDialog";
import { getFileUrl } from "@/lib/fileUrl";

interface StudentReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  templateName: string;
  sections: Section[];
  reportData?: Record<string, any>;
  report?: any;
  onSave?: (data: Record<string, any>) => void;
  readOnly?: boolean;
  isNew?: boolean;
}

export const StudentReportDialog = ({
  open,
  onOpenChange,
  studentName,
  templateName,
  sections,
  reportData,
  report,
  onSave,
  readOnly = false,
  isNew = false,
}: StudentReportDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const [currentSectionId, setCurrentSectionId] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getSectionKey = (section: any, index: number) => section.id || section.Section || `section-${index}`;

  useEffect(() => {
    if (reportData) {
      setFormData(reportData);
    } else {
      const initialData: Record<string, any> = {};
      sections.forEach((section, index) => {
        const sectionId = getSectionKey(section, index);
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
            text: section.Questions?.[0]?.answer || section.Questions?.[0]?.Ket || "",
            photos: section.Questions?.map((q: any) => q.photo).filter(Boolean) || []
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
    setFormData((prev) => {
      const photos = prev[currentSectionId]?.photos || [];
      return {
        ...prev,
        [currentSectionId]: { ...prev[currentSectionId], photos: [...photos, croppedImageUrl] },
      };
    });
  };

  const handleRemoveImage = (sectionId: string, index: number) => {
    setFormData((prev) => {
      const photos = [...(prev[sectionId]?.photos || [])];
      photos.splice(index, 1);
      return {
        ...prev,
        [sectionId]: { ...prev[sectionId], photos },
      };
    });
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  const VITE_API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.184:3000/api";
  const getImageUrl = (path: string) => path && !path.startsWith('data:') && !path.startsWith('http') ? `${VITE_API_URL}/reports/images/${path}` : path;

  if (readOnly) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[90vw] md:w-[80vw] h-[90vh] overflow-y-auto bg-slate-100 p-4 flex flex-col items-center custom-scrollbar">
          <DialogTitle className="sr-only">Pratinjau Rapor</DialogTitle>
          <div className="w-[210mm] min-h-[297mm] h-fit bg-white border border-slate-200 shadow-xl p-[20mm] relative text-black shrink-0">
            <div className="text-center font-bold text-2xl mb-5 border-b-2 border-black pb-2.5">
              {templateName?.toUpperCase() || ''}
            </div>
            <div className="text-center text-sm mb-10 font-bold">
              TAHUN AJARAN {report?.tahun_ajaran || report?.year} - SEMESTER {report?.semester?.toUpperCase() || ''}
            </div>

            <table className="w-full mb-8 text-sm">
              <tbody>
                <tr>
                  <td className="w-32 font-bold p-1">Nama Siswa</td>
                  <td className="w-2">:</td>
                  <td className="p-1">{report?.student?.name || '-'}</td>
                  <td className="w-32 font-bold p-1">Guru Wali</td>
                  <td className="w-2">:</td>
                  <td className="p-1">{report?.createdBy?.name || '-'}</td>
                </tr>
                <tr>
                  <td className="font-bold p-1">NISN</td>
                  <td>:</td>
                  <td className="p-1">{report?.student?.nisn || '-'}</td>
                  <td className="font-bold p-1">Kelas</td>
                  <td>:</td>
                  <td className="p-1">{report?.student?.className || '-'}</td>
                </tr>
              </tbody>
            </table>

            {sections.map((sec: any, idx: number) => {
              const sectionId = getSectionKey(sec, idx);
              const sectionData = formData[sectionId];

              if (!sectionData) return null;

              return (
                <div key={sectionId} className="mb-6">
                  {(sec.type !== "text" || sec.Section !== "") && (
                    <div className="font-bold text-base mt-7 mb-3 p-2">
                      {sec.Section}
                    </div>
                  )}

                  {(sec.type === 'table' || sec.type === 'table_text') && (() => {
                    let headers = sec.Headers?.length ? sec.Headers : sec.headers?.length ? sec.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
                    if (headers.length === 0 || headers[0]?.toLowerCase() !== "no") headers = ["No", ...headers];

                    return (
                      <table className="w-full border-collapse mb-5 text-xs text-black">
                        <thead className="bg-gray-100">
                          <tr>
                            {headers.map((h: string, hIdx: number) => (
                              <th key={hIdx} className="border border-black p-2 text-center font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(sectionData?.rows || []).map((row: any, rIdx: number) => (
                            <Fragment key={rIdx}>
                              <tr className="bg-slate-100 font-bold">
                                <td className="border border-black p-2 text-center w-10 border-b-transparent">{rIdx + 1}</td>
                                <td colSpan={Math.max(1, headers.length - 1)} className="border border-black p-2 text-left border-b-transparent">{row.Question}</td>
                              </tr>
                              <tr>
                                <td className="border border-black border-t-transparent"></td>
                                <td className="border border-black border-t-transparent"></td>

                                {headers.length >= 4 && (
                                  <td className="border border-black p-2 text-center border-t-transparent align-middle font-bold">{row.answer || ''}</td>
                                )}
                                {headers.length >= 5 && (
                                  <td className="border border-black p-2 text-center border-t-transparent align-middle font-bold">{row.predikat || ''}</td>
                                )}
                                {headers.length > 5 && (
                                  Array.from({ length: headers.length - 5 }).map((_, ext) => (
                                    <td key={ext} className="border border-black p-2 text-center border-t-transparent">-</td>
                                  ))
                                )}

                                {headers.length >= 3 && (
                                  <td className="border border-black p-2 text-left border-t-transparent align-top">{row.Ket || ''}</td>
                                )}
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {sec.type === 'text' && (
                    <div className="relative border-2 border-slate-400 rounded-xl p-6 pt-8 mt-8 mb-4">
                      <div className="absolute -top-[14px] left-6 bg-slate-500 text-white px-5 py-0.5 rounded-[20px] font-bold text-[13px] uppercase shadow-sm">
                        {sec.Questions[0].Question}
                      </div>

                      {sectionData?.text && sectionData.text.trim() !== '' && (
                        <div className="text-[14px] whitespace-pre-wrap leading-[1.6] mb-4">
                          {sectionData.text}
                        </div>
                      )}

                      {sectionData?.photos && sectionData.photos.length > 0 && (
                        <div className="flex flex-wrap gap-[15px] justify-center mt-4">
                          {sectionData.photos.map((pf: string, pIdx: number) => (
                            <div key={pIdx} className="w-[45%] max-w-[300px] border border-slate-200 bg-slate-50 rounded-lg p-2 flex flex-col items-center">
                              <img src={getImageUrl(pf)} className="max-w-full max-h-[250px] object-contain rounded" alt="Dokumentasi" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {readOnly ? "Lihat" : (isNew ? "Buat" : "Edit")} Rapor - {studentName}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Template: {templateName}</p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {sections.map((section: any, index: number) => {
              const sectionId = getSectionKey(section, index);

              let formHeaders = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : [];
              if (formHeaders.length > 0 && formHeaders[0]?.toLowerCase() === "no") formHeaders = formHeaders.slice(1);

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
                            <th className="border p-2 text-left bg-muted">{formHeaders[0] || "Pertanyaan"}</th>
                            <th className="border p-2 text-left bg-muted w-20">{formHeaders[1] || "Nilai"}</th>
                            <th className="border p-2 text-left bg-muted">{formHeaders[2] || "Keterangan"}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData[sectionId]?.rows || []).map((row: any, idx: number) => (
                            <tr key={idx}>
                              <td className="border p-2">{row.Question}</td>
                              <td className="border p-1">
                                <Textarea
                                  className="min-h-[60px] text-center resize-y text-xs"
                                  value={row.answer || ""}
                                  onChange={(e) => handleTableTextChange(sectionId, idx, "answer", e.target.value)}
                                  readOnly={readOnly}
                                />
                              </td>
                              <td className="border p-1">
                                <Textarea
                                  className="min-h-[60px] resize-y text-xs"
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
                            <th className="border p-2 text-left bg-muted">{formHeaders[0] || "Aspek"}</th>
                            {(section.Questions?.[0]?.answers || []).map((opt: string) => (
                              <th key={opt} className="border p-1 text-center bg-muted text-xs">{opt}</th>
                            ))}
                            <th className="border p-2 text-left bg-muted">{formHeaders[formHeaders.length - 1] || "Keterangan"}</th>
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
                                <Textarea
                                  className="min-h-[60px] resize-y text-xs"
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
                    <div className="flex flex-col gap-4">
                      {/* Text Section - Top */}
                      <div className="w-full">
                        {section.Questions?.[0]?.Question && section.Questions[0].Question !== 'Catatan' && (
                          <div className="text-sm font-semibold mb-2">
                            {section.Questions[0].Question}
                          </div>
                        )}
                        <Textarea
                          placeholder="Masukkan catatan (opsional)..."
                          value={formData[sectionId]?.text || ""}
                          onChange={(e) => handleTextChange(sectionId, e.target.value)}
                          readOnly={readOnly}
                          rows={4}
                        />
                      </div>

                      {/* Image Upload Section - Bottom */}
                      <div>
                        {(!readOnly || (formData[sectionId]?.photos && formData[sectionId].photos.length > 0)) && (
                          <Label className="mb-2 block text-xs font-semibold">Lampiran Gambar {readOnly ? "" : "(Maks. 4)"}</Label>
                        )}
                        <input
                          type="file"
                          ref={(el) => { fileInputRefs.current[sectionId] = el; }}
                          accept="image/*"
                          onChange={(e) => handleFileUpload(sectionId, e)}
                          className="hidden"
                          title="Upload Gambar"
                        />
                        <div className="flex flex-wrap gap-4">
                          {(formData[sectionId]?.photos || []).map((photo: string, idx: number) => (
                            <div key={idx} className="flex-shrink-0 w-[120px]">
                              <div className="w-[120px] h-[120px] border rounded-md overflow-hidden bg-white shadow-sm flex items-center justify-center p-1">
                                <img
                                  src={getFileUrl(photo)}
                                  alt={`Preview ${idx + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              {!readOnly && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 w-full text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveImage(sectionId, idx)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Hapus
                                </Button>
                              )}
                            </div>
                          ))}

                          {!readOnly && (formData[sectionId]?.photos || []).length < 4 && (
                            <div
                              className="w-[120px] h-[120px] border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => fileInputRefs.current[sectionId]?.click()}
                            >
                              <div className="text-center text-muted-foreground">
                                <Upload className="w-6 h-6 mx-auto mb-1" />
                                <span className="text-xs">Tambah</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Tutup
            </Button>
            {!readOnly && (
              <Button onClick={handleSave} className="w-full sm:w-auto">
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
