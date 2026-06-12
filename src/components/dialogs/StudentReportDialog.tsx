import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Section, Question } from "@/types/reportTemplate";
import { Save, Upload, X, Download } from "lucide-react";
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
  onDownload?: (report: any) => void;
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
  onDownload,
  readOnly = false,
  isNew = false,
}: StudentReportDialogProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState("");
  const [currentSectionId, setCurrentSectionId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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
          const items = (section.Questions || []).map((q: any) => {
            let photosArray: string[] = [];
            if (Array.isArray(q.photos)) {
              photosArray = q.photos;
            } else if (q.photo) {
              photosArray = [q.photo];
            }
            return {
              Question: q.Question || "",
              text: q.answer || q.Ket || "",
              photos: photosArray
            };
          });
          initialData[sectionId] = { items };
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

  const handleTextItemChange = (sectionId: string, questionIndex: number, value: string) => {
    setFormData((prev) => {
      const sectionData = prev[sectionId] || { items: [] };
      const items = [...(sectionData.items || [])];
      if (!items[questionIndex]) {
        items[questionIndex] = { Question: "", text: "", photos: [] };
      }
      items[questionIndex] = { ...items[questionIndex], text: value };
      return { ...prev, [sectionId]: { ...sectionData, items } };
    });
  };

  const handleFileUpload = (sectionId: string, questionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImageSrc(event.target?.result as string);
        setCurrentSectionId(sectionId);
        setCurrentQuestionIndex(questionIndex);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setFormData((prev) => {
      const sectionData = prev[currentSectionId] || { items: [] };
      const items = [...(sectionData.items || [])];
      if (!items[currentQuestionIndex]) {
        items[currentQuestionIndex] = { Question: "", text: "", photos: [] };
      }
      const photos = items[currentQuestionIndex].photos || [];
      items[currentQuestionIndex] = { ...items[currentQuestionIndex], photos: [...photos, croppedImageUrl] };
      return { ...prev, [currentSectionId]: { ...sectionData, items } };
    });
  };

  const handleRemoveImage = (sectionId: string, questionIndex: number, imageIndex: number) => {
    setFormData((prev) => {
      const sectionData = prev[sectionId] || { items: [] };
      const items = [...(sectionData.items || [])];
      if (items[questionIndex]) {
        const photos = [...(items[questionIndex].photos || [])];
        photos.splice(imageIndex, 1);
        items[questionIndex] = { ...items[questionIndex], photos };
      }
      return { ...prev, [sectionId]: { ...sectionData, items } };
    });
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  const getImageUrl = (path: string) => getFileUrl(path);

  if (readOnly) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] md:w-[80vw] h-[90vh] flex flex-col bg-slate-100 p-0 overflow-hidden custom-scrollbar">
          <DialogTitle className="sr-only">Pratinjau Rapor</DialogTitle>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
            <div className="w-full flex justify-start md:justify-center overflow-x-auto py-2 min-w-0">
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

                  {sec.type === 'table_text' && (() => {
                    let headers = sec.Headers?.length ? sec.Headers : sec.headers?.length ? sec.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
                    if (headers.length === 0 || headers[0]?.toLowerCase() !== "no") headers = ["No", ...headers];

                    // colCount = number of columns excluding No
                    const colCount = headers.filter((h: string) => h.toLowerCase().trim() !== "no").length;

                    // Build value cells for second row based on positional logic
                    const renderValueCells = (row: any) => {
                      const cells: JSX.Element[] = [];
                      // First cell in second row: empty (under No)
                      // Second cell: empty (under Question/Aspek)
                      // Then based on colCount:
                      // 4 cols: answer, predikat, Ket
                      // 3 cols: answer, Ket
                      // 2 cols: Ket
                      if (colCount >= 4) {
                        cells.push(
                          <td key="answer" className="border border-black p-2 text-center border-t-transparent align-middle font-bold">{row.answer || ''}</td>
                        );
                        cells.push(
                          <td key="predikat" className="border border-black p-2 text-center border-t-transparent align-middle font-bold">{row.predikat || ''}</td>
                        );
                        cells.push(
                          <td key="ket" className="border border-black p-2 text-left border-t-transparent align-top">{row.Ket || ''}</td>
                        );
                      } else if (colCount === 3) {
                        cells.push(
                          <td key="answer" className="border border-black p-2 text-center border-t-transparent align-middle font-bold">{row.answer || ''}</td>
                        );
                        cells.push(
                          <td key="ket" className="border border-black p-2 text-left border-t-transparent align-top">{row.Ket || ''}</td>
                        );
                      } else if (colCount === 2) {
                        cells.push(
                          <td key="ket" className="border border-black p-2 text-left border-t-transparent align-top">{row.Ket || ''}</td>
                        );
                      }
                      return cells;
                    };

                    return (
                      <table className="w-full border-collapse mb-5 text-xs text-black">
                        <thead className="bg-sky-100">
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
                                {renderValueCells(row)}
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {sec.type === 'table' && (() => {
                    let headers = sec.Headers?.length ? sec.Headers : sec.headers?.length ? sec.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
                    if (headers.length === 0 || headers[0]?.toLowerCase() !== "no") headers = ["No", ...headers];

                    const colCount = headers.filter((h: string) => h.toLowerCase().trim() !== "no").length;

                    const renderCell = (header: string, row: any, rowIndex: number, colIndex: number) => {
                      const key = header?.toLowerCase()?.trim();
                      if (key === "no") {
                        return (
                          <td key={header} className="border border-black p-2 text-center w-10">
                            {rowIndex + 1}
                          </td>
                        );
                      }

                      const nonNoIndex = colIndex - (headers[0]?.toLowerCase().trim() === "no" ? 1 : 0);

                      // First column after No = Question (read-only)
                      if (nonNoIndex === 0) {
                        return (
                          <td key={header} className="border border-black p-2 text-left align-top">
                            {row.Question || ""}
                          </td>
                        );
                      }

                      // Positional: 4 cols = Question, answer, predikat, Ket
                      // 3 cols = Question, answer, Ket
                      // 2 cols = Question, Ket
                      if (colCount >= 4) {
                        if (nonNoIndex === 1) return <td key={header} className="border border-black p-2 text-center align-middle font-bold">{row.answer || ""}</td>;
                        if (nonNoIndex === 2) return <td key={header} className="border border-black p-2 text-center align-middle font-bold">{row.predikat || ""}</td>;
                        if (nonNoIndex === 3) return <td key={header} className="border border-black p-2 text-left align-top">{row.Ket || ""}</td>;
                      } else if (colCount === 3) {
                        if (nonNoIndex === 1) return <td key={header} className="border border-black p-2 text-center align-middle font-bold">{row.answer || ""}</td>;
                        if (nonNoIndex === 2) return <td key={header} className="border border-black p-2 text-left align-top">{row.Ket || ""}</td>;
                      } else if (colCount === 2) {
                        if (nonNoIndex === 1) return <td key={header} className="border border-black p-2 text-left align-top">{row.Ket || ""}</td>;
                      }

                      return (
                        <td key={header} className="border border-black p-2 text-left align-top">-</td>
                      );
                    };

                    return (
                      <table className="w-full border-collapse mb-5 text-xs text-black">
                        <thead className="bg-sky-100">
                          <tr>
                            {headers.map((h: string, hIdx: number) => (
                              <th key={hIdx} className="border border-black p-2 text-center font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(sectionData?.rows || []).map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="bg-slate-100">
                              {headers.map((h: string, colIdx: number) => renderCell(h, row, rIdx, colIdx))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}

                  {sec.type === 'text' && (
                    <>
                      {(sectionData?.items || []).map((item: any, qIdx: number) => (
                        <div key={qIdx} className="relative border-2 border-sky-500 bg-sky-50 rounded-xl p-6 pt-8 mt-8 mb-4">
                          <div className="absolute -top-[14px] left-6 bg-sky-500 text-white px-5 py-0.5 rounded-[20px] font-bold text-[13px] uppercase shadow-sm">
                            {item.Question || sec.Questions?.[qIdx]?.Question || ''}
                          </div>

                          {item.text && item.text.trim() !== '' && (
                            <div className="text-[14px] whitespace-pre-wrap leading-[1.6] mb-4">
                              {item.text}
                            </div>
                          )}

                          {item.photos && item.photos.length > 0 && (
                            <div className="flex flex-wrap gap-[15px] justify-center mt-4">
                              {item.photos.map((pf: string, pIdx: number) => (
                                <div key={pIdx} className="w-[45%] max-w-[300px] border border-slate-200 bg-slate-50 rounded-lg p-2 flex flex-col items-center">
                                  <img src={getImageUrl(pf)} className="max-w-full max-h-[250px] object-contain rounded" alt="Dokumentasi" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
              </div>
            </div>
          </div>
          <DialogFooter className="bg-white border-t p-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 justify-end w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Tutup
            </Button>
            {onDownload && report && (
              <Button onClick={() => onDownload(report)} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Cetak / Download PDF
              </Button>
            )}
          </DialogFooter>
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

                  {section.type === "table_text" && (() => {
                    let headers = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pertanyaan", "Nilai", "Keterangan"];
                    if (headers.length === 0 || headers[0]?.toLowerCase() !== "no") headers = ["No", ...headers];

                    // Positional logic: columns after No
                    // colCount = number of columns excluding No
                    const colCount = headers.filter((h: string) => h.toLowerCase().trim() !== "no").length;

                    const renderCell = (header: string, row: any, idx: number, colIndex: number) => {
                      const key = header?.toLowerCase()?.trim();
                      if (key === "no") {
                        return <td key={header} className="border p-2 text-center align-middle w-12">{idx + 1}</td>;
                      }

                      // Position among non-No columns (0-based)
                      const nonNoIndex = colIndex - (headers[0]?.toLowerCase().trim() === "no" ? 1 : 0);

                      // First column after No = Question (read-only)
                      if (nonNoIndex === 0) {
                        return <td key={header} className="border p-2 align-top">{row.Question}</td>;
                      }

                      // Remaining columns based on total non-No column count:
                      // 4 cols: Question, answer, predikat, Ket
                      // 3 cols: Question, answer, Ket
                      // 2 cols: Question, Ket
                      if (colCount >= 4) {
                        if (nonNoIndex === 1) {
                          return (
                            <td key={header} className="border p-1">
                              <Textarea
                                className="min-h-[60px] text-center resize-y text-xs"
                                value={row.answer || ""}
                                onChange={(e) => handleTableTextChange(sectionId, idx, "answer", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                        if (nonNoIndex === 2) {
                          return (
                            <td key={header} className="border p-1">
                              <Textarea
                                className="min-h-[60px] text-center resize-y text-xs"
                                value={row.predikat || ""}
                                onChange={(e) => handleTableTextChange(sectionId, idx, "predikat", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                        if (nonNoIndex === 3) {
                          return (
                            <td key={header} className="border p-1">
                              <Textarea
                                className="min-h-[60px] resize-y text-xs"
                                value={row.Ket || ""}
                                onChange={(e) => handleTableTextChange(sectionId, idx, "Ket", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                      } else if (colCount === 3) {
                        if (nonNoIndex === 1) {
                          return (
                            <td key={header} className="border p-1">
                              <Textarea
                                className="min-h-[60px] text-center resize-y text-xs"
                                value={row.answer || ""}
                                onChange={(e) => handleTableTextChange(sectionId, idx, "answer", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                        if (nonNoIndex === 2) {
                          return (
                            <td key={header} className="border p-1">
                              <Textarea
                                className="min-h-[60px] resize-y text-xs"
                                value={row.Ket || ""}
                                onChange={(e) => handleTableTextChange(sectionId, idx, "Ket", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                      } else if (colCount === 2) {
                        if (nonNoIndex === 1) {
                          return (
                            <td key={header} className="border p-1">
                              <Textarea
                                className="min-h-[60px] resize-y text-xs"
                                value={row.Ket || ""}
                                onChange={(e) => handleTableTextChange(sectionId, idx, "Ket", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                      }

                      return <td key={header} className="border p-2">-</td>;
                    };

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse min-w-[500px]">
                          <thead>
                            <tr>
                              {headers.map((h: string, hIdx: number) => (
                                <th key={hIdx} className="border p-2 text-center bg-sky-100">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(formData[sectionId]?.rows || []).map((row: any, idx: number) => (
                              <tr key={idx}>
                                {headers.map((h: string, colIdx: number) => renderCell(h, row, idx, colIdx))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {section.type === "table" && (() => {
                    let headers = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
                    if (headers.length === 0 || headers[0]?.toLowerCase() !== "no") headers = ["No", ...headers];

                    const colCount = headers.filter((h: string) => h.toLowerCase().trim() !== "no").length;

                    const renderCell = (header: string, row: any, idx: number, colIndex: number) => {
                      const key = header?.toLowerCase()?.trim();
                      if (key === "no") {
                        return <td key={header} className="border p-2 text-center align-middle w-12">{idx + 1}</td>;
                      }

                      const nonNoIndex = colIndex - (headers[0]?.toLowerCase().trim() === "no" ? 1 : 0);

                      // First column after No = Question (read-only)
                      if (nonNoIndex === 0) {
                        return <td key={header} className="border p-2 align-top">{row.Question}</td>;
                      }

                      // For "table" type, the answer column uses a select dropdown
                      // 4 cols: Question, answer(select), predikat, Ket
                      // 3 cols: Question, answer(select), Ket
                      // 2 cols: Question, Ket
                      if (colCount >= 4) {
                        if (nonNoIndex === 1) {
                          const options = row.answers?.length > 0 ? row.answers : section.Questions?.[idx]?.answers?.length > 0 ? section.Questions[idx].answers : section.Questions?.[0]?.answers || [];
                          return (
                            <td key={header} className="border p-2 align-top">
                              <select
                                className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm"
                                value={row.answer || ""}
                                onChange={(e) => handleTableChange(sectionId, idx, "answer", e.target.value)}
                                disabled={readOnly}
                              >
                                <option value="" disabled>Pilih nilai</option>
                                {options.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>
                          );
                        }
                        if (nonNoIndex === 2) {
                          return (
                            <td key={header} className="border p-2 align-top">
                              <Textarea
                                className="min-h-[60px] text-center resize-y text-xs"
                                value={row.predikat || ""}
                                onChange={(e) => handleTableChange(sectionId, idx, "predikat", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                        if (nonNoIndex === 3) {
                          return (
                            <td key={header} className="border p-2 align-top">
                              <Textarea
                                className="min-h-[60px] resize-y text-xs"
                                value={row.Ket || ""}
                                onChange={(e) => handleTableChange(sectionId, idx, "Ket", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                      } else if (colCount === 3) {
                        if (nonNoIndex === 1) {
                          const options = row.answers?.length > 0 ? row.answers : section.Questions?.[idx]?.answers?.length > 0 ? section.Questions[idx].answers : section.Questions?.[0]?.answers || [];
                          return (
                            <td key={header} className="border p-2 align-top">
                              <select
                                className="w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm"
                                value={row.answer || ""}
                                onChange={(e) => handleTableChange(sectionId, idx, "answer", e.target.value)}
                                disabled={readOnly}
                              >
                                <option value="" disabled>Pilih nilai</option>
                                {options.map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </td>
                          );
                        }
                        if (nonNoIndex === 2) {
                          return (
                            <td key={header} className="border p-2 align-top">
                              <Textarea
                                className="min-h-[60px] resize-y text-xs"
                                value={row.Ket || ""}
                                onChange={(e) => handleTableChange(sectionId, idx, "Ket", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                      } else if (colCount === 2) {
                        if (nonNoIndex === 1) {
                          return (
                            <td key={header} className="border p-2 align-top">
                              <Textarea
                                className="min-h-[60px] resize-y text-xs"
                                value={row.Ket || ""}
                                onChange={(e) => handleTableChange(sectionId, idx, "Ket", e.target.value)}
                                readOnly={readOnly}
                              />
                            </td>
                          );
                        }
                      }

                      return <td key={header} className="border p-2">-</td>;
                    };

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse min-w-[600px]">
                          <thead>
                            <tr>
                              {headers.map((h: string, hIdx: number) => (
                                <th key={hIdx} className="border p-2 text-center bg-sky-100">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(formData[sectionId]?.rows || []).map((row: any, idx: number) => (
                              <tr key={idx}>
                                {headers.map((h: string, colIdx: number) => renderCell(h, row, idx, colIdx))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  {section.type === "text" && (
                    <div className="flex flex-col gap-6">
                      {(formData[sectionId]?.items || section.Questions || []).map((item: any, qIdx: number) => {
                        const questionItem = formData[sectionId]?.items?.[qIdx] || item;
                        const questionLabel = questionItem.Question || section.Questions?.[qIdx]?.Question || '';
                        const fileRefKey = `${sectionId}-${qIdx}`;

                        return (
                          <div key={qIdx} className="flex flex-col gap-4">
                            {/* Text Section */}
                            <div className="w-full">
                              {questionLabel && questionLabel !== 'Catatan' && (
                                <div className="text-sm font-semibold mb-2">
                                  {questionLabel}
                                </div>
                              )}
                              <Textarea
                                placeholder="Masukkan catatan (opsional)..."
                                value={questionItem.text || ""}
                                onChange={(e) => handleTextItemChange(sectionId, qIdx, e.target.value)}
                                readOnly={readOnly}
                                rows={4}
                              />
                            </div>

                            {/* Image Upload Section */}
                            <div>
                              {(!readOnly || (questionItem.photos && questionItem.photos.length > 0)) && (
                                <Label className="mb-2 block text-xs font-semibold">Lampiran Gambar {readOnly ? "" : "(Maks. 4)"}</Label>
                              )}
                              <input
                                type="file"
                                ref={(el) => { fileInputRefs.current[fileRefKey] = el; }}
                                accept="image/*"
                                onChange={(e) => handleFileUpload(sectionId, qIdx, e)}
                                className="hidden"
                                title="Upload Gambar"
                              />
                              <div className="flex flex-wrap gap-4">
                                {(questionItem.photos || []).map((photo: string, imgIdx: number) => (
                                  <div key={imgIdx} className="flex-shrink-0 w-[120px]">
                                    <div className="w-[120px] h-[120px] border rounded-md overflow-hidden bg-white shadow-sm flex items-center justify-center p-1">
                                      <img
                                        src={getFileUrl(photo)}
                                        alt={`Preview ${imgIdx + 1}`}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    {!readOnly && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-1 w-full text-xs text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveImage(sectionId, qIdx, imgIdx)}
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Hapus
                                      </Button>
                                    )}
                                  </div>
                                ))}

                                {!readOnly && (questionItem.photos || []).length < 4 && (
                                  <div
                                    className="w-[120px] h-[120px] border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => fileInputRefs.current[fileRefKey]?.click()}
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
                        );
                      })}
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
