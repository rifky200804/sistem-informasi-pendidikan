import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { StudentReportDialog } from "@/components/dialogs/StudentReportDialog";
import { CreateReportDialog } from "@/components/dialogs/CreateReportDialog";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { progressReportService, ProgressReportListItem, CreateProgressReportData } from "@/services/progressReportService";
import { reportTemplateService } from "@/services/reportTemplateService";
import { Section } from "@/types/reportTemplate";
import { toast } from "sonner";

const ProgressReports = () => {
  const [reports, setReports] = useState<ProgressReportListItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Dialog state
  const [reportToDelete, setReportToDelete] = useState<ProgressReportListItem | null>(null);
  const [selectedReportRow, setSelectedReportRow] = useState<ProgressReportListItem | null>(null);
  const [activeTemplateSections, setActiveTemplateSections] = useState<Section[]>([]);
  const [reportDialogData, setReportDialogData] = useState<Record<string, any>>({});
  const [templateName, setTemplateName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await progressReportService.getAll();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Gagal mengambil data rapor");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteClick = (report: ProgressReportListItem) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    try {
      setIsLoading(true);
      await progressReportService.delete(reportToDelete.id.toString());
      toast.success("Rapor berhasil dihapus");
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Gagal menghapus rapor");
    } finally {
      setIsLoading(false);
    }
  };

  const getSectionKey = (section: any, index: number) => section.id || section.Section || `section-${index}`;

  const parseBackendToFormData = (backendData: any[]) => {
    const parsedData: Record<string, any> = {};
    backendData?.forEach((backendSection, index) => {
      const sectionId = getSectionKey(backendSection, index);
      if (backendSection.type === "table_text" || backendSection.type === "table") {
        parsedData[sectionId] = {
          rows: backendSection.Questions?.map((q: any) => ({
            Question: q.Question,
            answer: q.answer || "",
            answers: q.answers || [],
            Ket: q.Ket || "",
            predikat: q.predikat || ""
          })) || []
        };
      } else if (backendSection.type === "text" || backendSection.type === "FREE_TEXT") {
        const items = (backendSection.Questions || []).map((q: any) => {
          let photosArray: string[] = [];
          if (Array.isArray(q.photos)) {
            photosArray = q.photos;
          } else if (q.photo) {
            photosArray = [q.photo];
          }
          return {
            Question: q.Question || "",
            text: q.Ket || q.answer || "",
            photos: photosArray
          };
        });

        parsedData[sectionId] = { items };
      }
    });
    return parsedData;
  };

  const handleOpenDialogWithReport = async (report: ProgressReportListItem, readOnly: boolean) => {
    try {
      setIsLoading(true);
      const detail = await progressReportService.getById(report.id.toString());
      if (!detail) {
        toast.error("Gagal memuat detail laporan");
        return;
      }

      const templates = await reportTemplateService.getAll();
      const activeTemplateData = templates[0]?.data || [];
      detail.data.forEach((sec: any) => {
        const tSec = activeTemplateData.find((t: any) => t.Section === sec.Section);
        if (tSec) {
          sec.type = tSec.type;
          sec.Headers = tSec.Headers || tSec.headers;
        }
      });

      // the sections shape matches detail.data, now fortified with headers!
      setTemplateName(detail.title || "Template Rapor");
      setStudentName(report.student.name);
      setActiveTemplateSections(detail.data as Section[]);
      setReportDialogData(parseBackendToFormData(detail.data));
      setSelectedReportRow(report);
      setIsReadOnly(readOnly);
      setIsDialogOpen(true);
    } catch (err) {
      console.error("Error opening report:", err);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewReport = async (studentId: string, _studentName: string, year: string, semester: string) => {
    try {
      setIsLoading(true);
      // Fetch active template so we can show it!
      const activeTemplate = await reportTemplateService.getActive();
      if (!activeTemplate || !activeTemplate.data || activeTemplate.data.length === 0) {
        toast.error("Template rapor aktif belum diatur atau kosong!");
        return;
      }

      // Setup active template context
      setActiveTemplateSections(activeTemplate.data as Section[]);
      setTemplateName(activeTemplate.title);
      setStudentName(_studentName);

      // We MUST initialize the dialog data using parseBackendToFormData so the template questions appear as rows!
      setReportDialogData(parseBackendToFormData(activeTemplate.data));

      setSelectedReportRow({
        id: 0,
        studentId: Number(studentId),
        templateId: activeTemplate.id ? Number(activeTemplate.id) : undefined, // Include the correctly mapped templateId
        year: Number(year.split('/')[0]), // Convert "2023/2024" to 2023, maybe? Or keep year number
        tahun_ajaran: year,
        semester: semester,
        student: { name: _studentName } as any,
      } as any);

      setIsCreateDialogOpen(false);
      setIsReadOnly(false);
      setIsDialogOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: Record<string, any>) => {
    if (!selectedReportRow) return;
    try {
      setIsLoading(true);

      const payloadData = activeTemplateSections.map((section, index) => {
        const sectionId = getSectionKey(section, index);
        const formDataSection = formData[sectionId];
        let newQuestions: any[] = [];

        if (section.type === "table_text" || section.type === "table") {
          newQuestions = (formDataSection?.rows || []).map((row: any) => ({
            Question: row.Question,
            answer: row.answer ? String(row.answer) : "",
            Ket: row.Ket || "",
            predikat: row.predikat || "",
            answers: row.answers || []
          }));
        } else if (section.type === "text" || section.type === "FREE_TEXT") {
          const items = formDataSection?.items || [];
          if (items.length > 0) {
            newQuestions = items.map((item: any, qIdx: number) => ({
              Question: item.Question || section.Questions?.[qIdx]?.Question || "Catatan",
              Ket: item.text || "",
              photos: item.photos || [],
              answers: section.Questions?.[qIdx]?.answers || []
            }));
          } else {
            // Fallback for legacy single-question format
            newQuestions = [{
              Question: section.Questions?.[0]?.Question || "Catatan",
              Ket: formDataSection?.text || "",
              photos: formDataSection?.photos || [],
              answers: section.Questions?.[0]?.answers || []
            }];
          }
        }

        return {
          Section: section.Section,
          Questions: newQuestions
        };
      });

      const reqBody: CreateProgressReportData = {
        studentId: selectedReportRow.studentId,
        templateId: selectedReportRow.templateId,
        year: selectedReportRow.year || new Date().getFullYear(),
        tahun_ajaran: selectedReportRow.tahun_ajaran,
        semester: selectedReportRow.semester || "ganjil",
        data: payloadData
      };

      if (selectedReportRow.id && selectedReportRow.id !== 0) {
        await progressReportService.update(selectedReportRow.id.toString(), reqBody);
      } else {
        await progressReportService.create(reqBody);
      }

      toast.success("Rapor berhasil disimpan!");
      setIsDialogOpen(false);
      fetchReports();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan rapor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async (item: ProgressReportListItem) => {
    // Buka window segera untuk menghindari popup blocker di mobile
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up diblokir. Harap izinkan pop-up untuk mencetak PDF.");
      return;
    }

    // Tulis halaman loading sementara
    printWindow.document.write(`
      <html>
        <head>
          <title>Memproses Rapor...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #334155;
            }
            .spinner {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #0ea5e9;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin-bottom: 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <div>Memproses PDF Rapor... Silakan tunggu.</div>
        </body>
      </html>
    `);

    try {
      toast.info("Memproses PDF rapor...");
      const detail = await progressReportService.getById(item.id.toString());
      if (!detail) {
        printWindow.close();
        toast.error("Gagal mendapatkan detail rapor.");
        return;
      }
      const templates = await reportTemplateService.getAll();
      const activeData = templates[0]?.data || [];
      const VITE_API_URL = import.meta.env.VITE_API_URL || "";
      const getImageUrl = (path: string) => path && !path.startsWith('data:') && !path.startsWith('http') ? `${VITE_API_URL}/reports/images/${path}` : path;

      let htmlContent = `
                <html>
                  <head>
                    <title>Rapor_${item.student?.name || 'Siswa'}</title>
                    <style>
                      @page { size: A4; margin: 0; }
                      body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #000; box-sizing: border-box; }
                      .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }
                      .sub-header { text-align: center; font-size: 14px; margin-bottom: 40px; }
                      .info-table { width: 100%; margin-bottom: 30px; font-size: 14px; }
                      .info-table td { padding: 4px; }
                      .section-title { font-weight: bold; font-size: 16px; margin-top: 30px; margin-bottom: 10px; padding: 8px; page-break-after: avoid; break-after: avoid; }
                      table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; page-break-inside: auto; }
                      table.data-table tr { page-break-inside: avoid; page-break-after: auto; }
                      table.data-table thead { display: table-header-group; }
                      table.data-table th, table.data-table td { border: 1px solid #000; padding: 8px; }
                      table.data-table th { background-color: #dbeafe; color: #1e40af; text-align: center; }
                      .text-catatan { border: 1px solid #000; padding: 15px; margin-bottom: 15px; min-height: 100px; font-size: 14px; white-space: pre-wrap; page-break-inside: avoid; break-inside: avoid; }
                      .text-section-container { border: 2px solid #0ea5e9; background-color: #f0f9ff; border-radius: 12px; position: relative; padding: 25px 20px 20px; margin-top: 30px; margin-bottom: 20px; page-break-inside: avoid; break-inside: avoid; }
                      .text-section-badge { position: absolute; top: -14px; left: 30px; background-color: #0ea5e9; color: white; padding: 4px 20px; border-radius: 20px; font-weight: bold; font-size: 13px; text-transform: uppercase; }
                      .text-content-wrap { font-size: 14px; white-space: pre-wrap; line-height: 1.6; margin-bottom: 15px; }
                      .photo-grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 15px; }
                      .photo-item { width: 45%; max-width: 300px; padding: 5px; text-align: center; page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
                      .photo-item img { max-width: 100%; max-height: 250px; object-fit: contain; border-radius: 4px; }
                    </style>
                  </head>
                  <body>
                    <table style="width: 100%; border: none; margin: 0; padding: 0;">
                      <thead><tr><td style="height: 20mm; border: none; padding: 0;"></td></tr></thead>
                      <tbody><tr><td style="padding: 0 20mm;">
                        <div class="header">${detail.title.toUpperCase()}</div>
                    <div class="sub-header">TAHUN AJARAN ${item.tahun_ajaran || item.year} - SEMESTER ${item.semester.toUpperCase()}</div>
                    
                    <table class="info-table">
                      <tr>
                        <td width="100"><strong>Nama Siswa</strong></td><td width="10">:</td><td>${item.student?.name || '-'}</td>
                        <td width="100"><strong>Guru Wali</strong></td><td width="10">:</td><td>${item.createdBy?.name || '-'}</td>
                      </tr>
                      <tr>
                        <td><strong>NISN</strong></td><td>:</td><td>${item.student?.nisn || '-'}</td>
                        <td><strong>Kelas</strong></td><td>:</td><td>${item.student?.className || '-'}</td>
                      </tr>
                    </table>
                `;

      detail.data.forEach((sec) => {
        if (sec.type === 'table_text') {
          htmlContent += `<div class="section-title">${sec.Section}</div>`;
          let headers = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
          const tSec = activeData.find((t: any) => t.Section === sec.Section);
          if (tSec) {
            let customHeaders = tSec.Headers?.length ? tSec.Headers : tSec.headers?.length ? tSec.headers : [];
            if (customHeaders.length > 0) {
              headers = customHeaders[0].toLowerCase() !== "no" ? ["No", ...customHeaders] : customHeaders;
            }
          }

          // colCount = number of columns excluding No
          const colCount = headers.filter(h => h.toLowerCase().trim() !== "no").length;

          htmlContent += `<table class="data-table"><thead><tr>`;
          headers.forEach(h => htmlContent += `<th>${h}</th>`);
          htmlContent += `</tr></thead><tbody>`;

          sec.Questions.forEach((q, qIdx) => {
            htmlContent += `<tr style="background-color: #f1f5f9; font-weight: bold;">
                         <td style="text-align: center; width: 40px; border-bottom: none;">${qIdx + 1}</td>
                         <td colspan="${Math.max(1, headers.length - 1)}" style="border-bottom: none;">${q.Question || ''}</td>
                       </tr>`;
            htmlContent += `<tr>
                         <td style="border-top: none;"></td>
                         <td style="border-top: none;"></td>`;
            // Positional: 4 cols = Question, answer, predikat, Ket; 3 cols = Question, answer, Ket; 2 cols = Question, Ket
            if (colCount >= 4) {
              htmlContent += `<td style="text-align: center; border-top: none; font-weight: bold; vertical-align: middle;">${q.answer || ''}</td>`;
              htmlContent += `<td style="text-align: center; border-top: none; font-weight: bold; vertical-align: middle;">${q.predikat || ''}</td>`;
              htmlContent += `<td style="border-top: none; vertical-align: top;">${q.Ket || ''}</td>`;
            } else if (colCount === 3) {
              htmlContent += `<td style="text-align: center; border-top: none; font-weight: bold; vertical-align: middle;">${q.answer || ''}</td>`;
              htmlContent += `<td style="border-top: none; vertical-align: top;">${q.Ket || ''}</td>`;
            } else if (colCount === 2) {
              htmlContent += `<td style="border-top: none; vertical-align: top;">${q.Ket || ''}</td>`;
            }
            htmlContent += `</tr>`;
          });

          htmlContent += `</tbody></table>`;
        } else if (sec.type === 'table') {
          htmlContent += `<div class="section-title">${sec.Section}</div>`;
          let headers = ["No", "Pernyataan", "Nilai", "Predikat", "Keterangan"];
          const tSec = activeData.find((t: any) => t.Section === sec.Section);
          if (tSec) {
            const customHeaders = tSec.Headers?.length ? tSec.Headers : tSec.headers?.length ? tSec.headers : [];
            if (customHeaders.length > 0) {
              headers = customHeaders[0].toLowerCase() !== "no" ? ["No", ...customHeaders] : customHeaders;
            }
          }

          const tblColCount = headers.filter(h => h.toLowerCase().trim() !== "no").length;

          htmlContent += `<table class="data-table"><thead><tr>`;
          headers.forEach(h => htmlContent += `<th>${h}</th>`);
          htmlContent += `</tr></thead><tbody>`;

          sec.Questions.forEach((q, qIdx) => {
            htmlContent += `<tr>`;
            const hasNo = headers[0]?.toLowerCase().trim() === "no";
            headers.forEach((h, hIdx) => {
              const key = h.toLowerCase().trim();
              if (key === 'no') {
                htmlContent += `<td style="text-align: center; width: 40px;">${qIdx + 1}</td>`;
              } else {
                const nonNoIdx = hIdx - (hasNo ? 1 : 0);
                if (nonNoIdx === 0) {
                  // First column after No = Question (read-only)
                  htmlContent += `<td style="text-align: left;">${q.Question || ''}</td>`;
                } else if (tblColCount >= 4) {
                  if (nonNoIdx === 1) htmlContent += `<td style="text-align: center;">${q.answer || ''}</td>`;
                  else if (nonNoIdx === 2) htmlContent += `<td style="text-align: center;">${q.predikat || ''}</td>`;
                  else if (nonNoIdx === 3) htmlContent += `<td style="text-align: left;">${q.Ket || ''}</td>`;
                  else htmlContent += `<td style="text-align: left;">-</td>`;
                } else if (tblColCount === 3) {
                  if (nonNoIdx === 1) htmlContent += `<td style="text-align: center;">${q.answer || ''}</td>`;
                  else if (nonNoIdx === 2) htmlContent += `<td style="text-align: left;">${q.Ket || ''}</td>`;
                  else htmlContent += `<td style="text-align: left;">-</td>`;
                } else if (tblColCount === 2) {
                  if (nonNoIdx === 1) htmlContent += `<td style="text-align: left;">${q.Ket || ''}</td>`;
                  else htmlContent += `<td style="text-align: left;">-</td>`;
                } else {
                  htmlContent += `<td style="text-align: left;">-</td>`;
                }
              }
            });
            htmlContent += `</tr>`;
          });

          htmlContent += `</tbody></table>`;
        } else if (sec.type === 'text') {
          htmlContent += `<div class="section-title">${sec.Section}</div>`;
          (sec.Questions || []).forEach((q) => {
            if (q) {
              htmlContent += `<div class="text-section-container">`;
              htmlContent += `<div class="text-section-badge">${q.Question}</div>`;

              if (q.Ket && q.Ket.trim() !== '') {
                htmlContent += `<div class="text-content-wrap">${q.Ket}</div>`;
              }

              let photos: any[] = [];
              if (Array.isArray(q.photos)) photos = q.photos;
              else if (q.photo) photos = [q.photo];

              if (photos.length > 0) {
                htmlContent += `<div class="photo-grid">`;
                photos.forEach(pf => {
                  if (pf && typeof pf === 'string') {
                    htmlContent += `<div class="photo-item"><img src="${getImageUrl(pf)}" alt="Dokumentasi" /></div>`;
                  }
                });
                htmlContent += `</div>`;
              }
              htmlContent += `</div>`;
            }
          });
        }
      });

      htmlContent += `
                      </td></tr></tbody>
                      <tfoot><tr><td style="height: 20mm; border: none; padding: 0;"></td></tr></tfoot>
                    </table>
                  </body>
                  <script>
                    setTimeout(() => { window.print(); window.close(); }, 800);
                  </script>
                </html>`;

      // Bersihkan indikator loading dan tulis HTML konten rapor
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (e) {
      printWindow.close();
      toast.error("Gagal memproses PDF rapor. Pastikan server terhubung.");
      console.error(e);
    }
  };

  const columns: Column<ProgressReportListItem>[] = [
    { key: 'id', header: 'ID Rapor', render: (item) => `RPT-${String(item.id).padStart(3, '0')}` },
    { key: 'student', header: 'Nama Murid', render: (item) => item.student?.name || '-' },
    { key: 'tahun_ajaran', header: 'Tahun Ajaran', render: (item) => item.tahun_ajaran || item.student?.tahunAjaran || item.year },
    { key: 'createdBy', header: 'Guru Wali', render: (item) => item.createdBy?.name || '-' },
    // {
    //   key: 'status',
    //   header: 'Status',
    //   render: (item) => {
    //     const isCompleted = (item._count?.answers || 0) > 0;
    //     return (
    //       <Badge variant={isCompleted ? 'default' : 'secondary'}>
    //         {isCompleted ? 'Selesai' : 'Draft'}
    //       </Badge>
    //     );
    //   },
    // },
    {
      key: 'semester',
      header: 'Keterangan Semester',
      render: (item) => (
        <span className="text-sm capitalize">{item.semester}</span>
      ),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenDialogWithReport(item, true)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenDialogWithReport(item, false)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
          {((item._count?.answers || 0) > 0) && (
            <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(item)}>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rapor Perkembangan</h1>
          <p className="text-muted-foreground">Kelola rapor dan penilaian perkembangan murid</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Buat Rapor
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Daftar Rapor Perkembangan</h2>
          <p className="text-sm text-muted-foreground">Total: {reports.length} rapor</p>
        </div>
        <DataTable data={reports} columns={columns} />
      </Card>

      {isDialogOpen && (
        <StudentReportDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          studentName={studentName}
          templateName={templateName}
          sections={activeTemplateSections}
          reportData={reportDialogData}
          report={selectedReportRow}
          onSave={handleSave}
          onDownload={handleDownloadPDF}
          readOnly={isReadOnly}
          isNew={selectedReportRow?.id === 0}
        />
      )}

      {isCreateDialogOpen && (
        <CreateReportDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateNewReport}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Rapor"
        description={`Apakah Anda yakin ingin menghapus rapor ${reportToDelete?.student?.name || 'ini'}?`}
      />
    </div>
  );
};

export default ProgressReports;
