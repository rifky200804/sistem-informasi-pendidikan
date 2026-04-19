/* eslint-disable @typescript-eslint/no-explicit-any */
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
    return (
      <div className="bg-white p-8 min-h-full text-black">
        <h1 className="text-xl font-bold text-center mb-6">{templateName}</h1>

        {sections.map((section, idx) => (
          <div key={section.id || idx} className="mb-6">
            {(section.type !== "text" || section.Section !== "") && (
              <h2 className="font-bold text-base mt-7 mb-3 p-2">{section.Section}</h2>
            )}

            {section.type === "table_text" && (() => {
              let cols = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
              if (cols.length > 0 && cols[0].toLowerCase() !== "no") {
                cols = ["No", ...cols];
              } else if (cols.length === 0) {
                cols = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
              }

              return (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {cols.map((col, cIdx) => (
                        <th key={cIdx} className={`border border-gray-400 p-2 bg-gray-100 ${col.toLowerCase() === 'no' ? 'text-center w-12' : 'text-left'}`}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(section.Questions || []).map((q: Question, i: number) => (
                      <tr key={i}>
                        <td className="border border-gray-400 p-2 text-center">{i + 1}</td>
                        <td className="border border-gray-400 p-2">{q.Question}</td>
                        {Array.from({ length: Math.max(0, cols.length - 2) }).map((_, colIdx) => (
                          <td key={colIdx} className="border border-gray-400 p-2"></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}

            {section.type === "table" && (() => {
              const answerOptions = section.Questions?.[0]?.answers || ["Belum Berkembang", "Mulai Berkembang", "Berkembang Sesuai Harapan", "Berkembang Sangat Baik"];
              let cols = section.Headers?.length ? section.Headers : section.headers?.length ? section.headers : ["Pernyataan", "Nilai", "Predikat", "Keterangan"];
              if (cols.length > 0 && cols[0].toLowerCase() !== "no") {
                cols = ["No", ...cols];
              } else if (cols.length === 0) {
                cols = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
              }

              return (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {cols.map((col, cIdx) => (
                        <th key={cIdx} className={`border border-gray-400 p-2 bg-gray-100 ${col.toLowerCase() === 'no' ? 'text-center w-12' : 'text-left'}`}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(section.Questions || []).map((q: Question, i: number) => (
                      <tr key={i}>
                        {cols.map((col, cIdx) => {
                          if (col.toLowerCase() === 'no') {
                            return <td key={cIdx} className="border border-gray-400 p-2 text-center">{i + 1}</td>;
                          }
                          if (cIdx === 1) {
                            return <td key={cIdx} className="border border-gray-400 p-2">{q.Question}</td>;
                          }
                          if (col.toLowerCase() === 'predikat' || (cIdx === cols.length - 2 && !cols.some(c => c.toLowerCase() === 'predikat'))) {
                            return (
                              <td key={cIdx} className="border border-gray-400 p-2 text-center text-gray-500">
                                [ {answerOptions[0]} ... ]
                              </td>
                            );
                          }
                          return <td key={cIdx} className="border border-gray-400 p-2"></td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}

            {section.type === "text" && (
              <div className="border border-gray-400 p-4 text-gray-400 text-xs">
                ({section.Questions?.[0]?.Question || "Catatan"})
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Preview - {templateName}</DialogTitle>
            <Button onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-md">
          {sections.length > 0 ? renderPreview() : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Tidak ada section untuk ditampilkan
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
