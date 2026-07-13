/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fragment } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Section, Question } from "@/types/reportTemplate";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportPDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  sections: Section[];
}

export const ReportPDFPreview = ({
  open,
  onOpenChange,
  templateName,
  sections,
}: ReportPDFPreviewProps) => {

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(templateName, 105, yPosition, { align: "center" });
    yPosition += 15;

    sections.forEach((section) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.Section, 14, yPosition);
      yPosition += 8;

      if (section.type === "table_text") {
        let cols = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
        if (cols.length > 0 && cols[0].toLowerCase() !== "no") {
          cols = ["No", ...cols];
        } else if (cols.length === 0) {
          cols = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
        }

        const columns = cols;
        const rows = section.Questions?.map((q: Question, i: number) => {
          const rowData = [(i + 1).toString(), q.Question];
          while (rowData.length < columns.length) {
            rowData.push("");
          }
          return rowData;
        }) || [["", "", "", ""]];

        autoTable(doc, {
          startY: yPosition,
          head: [columns],
          body: rows,
          theme: "grid",
          headStyles: { fillColor: [80, 80, 80], fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 4 },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      } else if (section.type === "table") {
        const answerOptions = section.Questions?.[0]?.answers || ["Belum Berkembang", "Mulai Berkembang", "Berkembang Sesuai Harapan", "Berkembang Sangat Baik"];

        let cols = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
        if (cols.length > 0 && cols[0].toLowerCase() !== "no") {
          cols = ["No", ...cols];
        } else if (cols.length === 0) {
          cols = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
        }

        const columns = cols;
        const rows = section.Questions?.map((q: Question, i: number) => {
          const rowData: string[] = [];
          cols.forEach((col, cIdx) => {
            if (col.toLowerCase() === "no") {
              rowData.push((i + 1).toString());
            } else if (cIdx === 1) {
              rowData.push(q.Question);
            } else if (col.toLowerCase() === "predikat" || (cIdx === cols.length - 2 && !cols.some(c => c.toLowerCase() === "predikat"))) {
              rowData.push("(Pilih Predikat)");
            } else {
              rowData.push("");
            }
          });
          return rowData;
        }) || [["", "", "", ""]];

        autoTable(doc, {
          startY: yPosition,
          head: [columns],
          body: rows,
          theme: "grid",
          headStyles: { fillColor: [80, 80, 80], fontSize: 8, halign: "center" },
          styles: { fontSize: 8, cellPadding: 3, halign: "center" },
          columnStyles: { 0: { halign: "center", cellWidth: 10 }, 1: { halign: "left", cellWidth: 50 }, [columns.length - 1]: { halign: "left" } },
          margin: { left: 14, right: 14 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      } else if (section.type === "text") {
        doc.setFontSize(9);
        doc.setDrawColor(150);
        doc.rect(14, yPosition, 180, 25);
        doc.setTextColor(150);
        const label = section.Questions?.[0]?.Question || "Catatan";
        doc.text(`(${label})`, 104, yPosition + 13, { align: "center" });
        doc.setTextColor(0);
        yPosition += 35;
      }
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`${templateName.replace(/\s+/g, "_")}.pdf`);
  };

  const renderPreview = () => {
    let hasRenderedIntrakurikulerHeader = false;

    return (
      <div className="w-[215.9mm] min-h-[355.6mm] h-fit bg-white border border-slate-300 shadow-xl p-[20mm] relative text-black shrink-0 overflow-hidden">
        {/* Visual page boundaries for US Legal size paper */}
        {Array.from({ length: 5 }).map((_, idx) => {
          const heightMm = (idx + 1) * 355.6;
          return (
            <div 
              key={idx} 
              className="absolute left-0 right-0 border-t-2 border-dashed border-red-400 pointer-events-none flex items-center justify-end pr-4 text-[10px] font-bold text-red-500 select-none z-50 print:hidden"
              style={{ top: `${heightMm}mm` }}
            >
              <span className="bg-white px-2 py-0.5 border border-red-300 rounded shadow-sm -mt-2">
                Batas Halaman {idx + 1} (Kertas Legal)
              </span>
            </div>
          );
        })}

        <div className="text-center font-bold text-xl mb-1">
          LAPORAN HASIL BELAJAR
        </div>
        <div className="text-center font-bold text-xl mb-8">
          ( LHB )
        </div>

        <table className="mb-6 text-sm w-auto border-collapse">
          <tbody>
            <tr>
              <td className="w-40 p-1 text-left text-slate-700">Nama Sekolah</td>
              <td className="w-4 p-1 text-center">:</td>
              <td className="p-1 text-left">POS PAUD MELATI AZZAHRA</td>
            </tr>
            <tr>
              <td className="p-1 text-left text-slate-700">Tahun Ajaran</td>
              <td className="p-1 text-center">:</td>
              <td className="p-1 text-left">202X/202X</td>
            </tr>
            <tr>
              <td className="p-1 text-left text-slate-700">Semester</td>
              <td className="p-1 text-center">:</td>
              <td className="p-1 text-left capitalize">Ganjil / Genap</td>
            </tr>
            <tr>
              <td className="p-1 text-left text-slate-700">Nama Siswa</td>
              <td className="p-1 text-center">:</td>
              <td className="p-1 text-left font-bold">(Nama Siswa)</td>
            </tr>
            <tr>
              <td className="p-1 text-left text-slate-700">Kelompok/kelas</td>
              <td className="p-1 text-center">:</td>
              <td className="p-1 text-left">(Kelas)</td>
            </tr>
            <tr>
              <td className="p-1 text-left text-slate-700">Fase</td>
              <td className="p-1 text-center">:</td>
              <td className="p-1 text-left">Fondasi</td>
            </tr>
          </tbody>
        </table>

        {sections.map((section, idx) => {
          const renderIntrakurikulerHeader = () => {
            if ((section.type === 'table_text' || section.type === 'table') && !hasRenderedIntrakurikulerHeader) {
              hasRenderedIntrakurikulerHeader = true;
              return (
                <div className="font-bold text-lg mt-6 mb-3 font-sans border-b pb-1 text-black">
                  A. INTRAKURIKULER
                </div>
              );
            }
            return null;
          };

          return (
            <div key={section.id || idx} className="mb-6">
              {renderIntrakurikulerHeader()}
              {(section.type !== "text" || section.Section !== "") && (
                <div className="font-bold text-sm mt-4 mb-2 text-black">
                  {section.Section}
                </div>
              )}

              {section.type === 'table_text' && (() => {
                let cols = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
                if (cols.length > 0 && cols[0].toLowerCase() !== "no") {
                  cols = ["No", ...cols];
                } else if (cols.length === 0) {
                  cols = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
                }

                const colCount = cols.filter((h: string) => h.toLowerCase().trim() !== "no").length;

                return (
                  <table className="w-full border-collapse mb-5 text-xs text-black border border-black">
                    <thead>
                      <tr>
                        {cols.map((col, cIdx) => (
                          <th key={cIdx} className="border border-black p-2 text-center font-bold bg-[#e5e7eb] text-black">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(section.Questions || []).map((q: Question, i: number) => (
                        <Fragment key={i}>
                          <tr className="bg-[#f2f2f2] font-bold">
                            <td className="border border-black p-2 text-center w-10">{i + 1}</td>
                            <td colSpan={cols.length - 1} className="border border-black p-2 text-left">{q.Question}</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="border border-black"></td>
                            <td className="border border-black"></td>
                            {colCount >= 4 && (
                              <>
                                <td className="border border-black p-2 text-center text-gray-400 font-bold">[ Nilai ]</td>
                                <td className="border border-black p-2 text-center text-gray-400 font-bold">[ Predikat ]</td>
                                <td className="border border-black p-2 text-left text-gray-400">[ Narasi Keterangan ]</td>
                              </>
                            )}
                            {colCount === 3 && (
                              <>
                                <td className="border border-black p-2 text-center text-gray-400 font-bold">[ Nilai ]</td>
                                <td className="border border-black p-2 text-left text-gray-400">[ Narasi Keterangan ]</td>
                              </>
                            )}
                            {colCount === 2 && (
                              <td className="border border-black p-2 text-left text-gray-400">[ Narasi Keterangan ]</td>
                            )}
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                );
              })()}

              {section.type === 'table' && (() => {
                let cols = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
                if (cols.length > 0 && cols[0].toLowerCase() !== "no") {
                  cols = ["No", ...cols];
                } else if (cols.length === 0) {
                  cols = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
                }

                const colCount = cols.filter((h: string) => h.toLowerCase().trim() !== "no").length;

                return (
                  <table className="w-full border-collapse mb-5 text-xs text-black border border-black">
                    <thead>
                      <tr>
                        {cols.map((col, cIdx) => (
                          <th key={cIdx} className="border border-black p-2 text-center font-bold bg-[#e5e7eb] text-black">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(section.Questions || []).map((q: Question, i: number) => (
                        <tr key={i} className="bg-white">
                          {cols.map((col, cIdx) => {
                            if (col.toLowerCase() === 'no') {
                              return <td key={cIdx} className="border border-black p-2 text-center w-10">{i + 1}</td>;
                            }
                            const nonNoIndex = cIdx - (cols[0]?.toLowerCase().trim() === "no" ? 1 : 0);
                            if (nonNoIndex === 0) {
                              return <td key={cIdx} className="border border-black p-2 text-left align-top">{q.Question}</td>;
                            }
                            if (colCount >= 4) {
                              if (nonNoIndex === 1) return <td key={cIdx} className="border border-black p-2 text-center text-gray-400 font-bold">[ Nilai ]</td>;
                              if (nonNoIndex === 2) return <td key={cIdx} className="border border-black p-2 text-center text-gray-400 font-bold">[ Predikat ]</td>;
                              if (nonNoIndex === 3) return <td key={cIdx} className="border border-black p-2 text-left text-gray-400">[ Narasi Keterangan ]</td>;
                            } else if (colCount === 3) {
                              if (nonNoIndex === 1) return <td key={cIdx} className="border border-black p-2 text-center text-gray-400 font-bold">[ Nilai ]</td>;
                              if (nonNoIndex === 2) return <td key={cIdx} className="border border-black p-2 text-left text-gray-400">[ Narasi Keterangan ]</td>;
                            } else if (colCount === 2) {
                              if (nonNoIndex === 1) return <td key={cIdx} className="border border-black p-2 text-left text-gray-400">[ Narasi Keterangan ]</td>;
                            }
                            return <td key={cIdx} className="border border-black p-2 text-center text-gray-400">-</td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}

              {section.type === 'text' && (
                <div className="relative border-2 border-sky-500 bg-white rounded-xl p-6 pt-8 mt-8 mb-4">
                  <div className="absolute -top-[14px] left-6 bg-sky-500 text-white px-5 py-0.5 rounded-[20px] font-bold text-[13px] uppercase shadow-sm">
                    {section.Questions?.[0]?.Question || "Catatan"}
                  </div>
                  <div className="text-[14px] text-gray-400 italic">
                    [ Isian narasi / uraian penjelasan ]
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] md:w-[80vw] h-[90vh] flex flex-col bg-slate-100 p-0 overflow-hidden custom-scrollbar">
        <DialogHeader className="p-4 bg-white border-b flex-shrink-0 flex flex-row items-center justify-between">
          <DialogTitle>Preview - {templateName}</DialogTitle>
          <Button onClick={handleDownload} size="sm" className="mr-8">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
          <div className="w-full flex justify-start md:justify-center overflow-x-auto py-2 min-w-0">
            {sections.length > 0 ? renderPreview() : (
              <div className="w-[215.9mm] min-h-[355.6mm] bg-white border border-slate-300 shadow-xl p-[20mm] flex items-center justify-center text-muted-foreground shrink-0">
                Tidak ada section untuk ditampilkan
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
