import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { ReportPDFPreview } from "@/components/preview/ReportPDFPreview";
import { Section, Question, ReportTemplate } from "@/types/reportTemplate";
import { useReportTemplates } from "@/hooks/useReportTemplates";
import { ReportTemplateForm } from "@/components/forms/ReportTemplateForm";

const ReportTemplates = () => {
  const { templates, loading, createTemplate, updateTemplate } = useReportTemplates();
  const activeTemplate = templates[0];
  
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplateData, setEditingTemplateData] = useState<ReportTemplate | null>(null);

  // Local Sections State to prevent immediate API calls
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isSavingSections, setIsSavingSections] = useState(false);

  useEffect(() => {
    if (activeTemplate) {
      setLocalSections(activeTemplate.data || []);
    }
  }, [activeTemplate]);

  const hasChanges = JSON.stringify(localSections) !== JSON.stringify(activeTemplate?.data || []);

  // Section Editor States
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const handleCreateTemplate = async (data: any) => {
    try {
      await createTemplate(data);
      setTemplateFormOpen(false);
    } catch (e) {}
  };

  const handleUpdateTemplateInfo = async (data: any) => {
    try {
      if (activeTemplate) {
        await updateTemplate(activeTemplate.id || "", data);
      }
      setTemplateFormOpen(false);
      setEditingTemplateData(null);
    } catch (e) {}
  };

  // Section Handlers
  const handleAddSection = () => {
    setSelectedSection(null);
    setSectionFormOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setSectionFormOpen(true);
  };

  const handleSaveSection = (sectionData: Section) => {
    let newSections = [...localSections];
    
    if (selectedSection) {
      newSections = newSections.map(s => s.id === selectedSection.id ? { ...sectionData, id: selectedSection.id } : s);
    } else {
      newSections.push({ ...sectionData, id: Date.now().toString() });
    }

    setLocalSections(newSections);
    setSectionFormOpen(false);
    setSelectedSection(null);
  };

  const handleDeleteClick = (section: Section) => {
    setSelectedSection(section);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedSection) return;
    const newSections = localSections.filter(s => s.id !== selectedSection.id);
    
    setLocalSections(newSections);
    setDeleteDialogOpen(false);
    setSelectedSection(null);
  };

  const handleSimpanSemuaPerubahan = async () => {
    if (!activeTemplate) return;
    try {
      setIsSavingSections(true);

      const formattedSections = localSections.map((sec) => {
        const formattedQuestions = (sec.Questions || []).map(q => ({
          Question: q.Question,
          answers: q.answers || [],
          Ket: q.Ket || ""
        }));

        let sectionVal: string | number = sec.Section;
        if (!isNaN(Number(sec.Section)) && sec.Section.trim() !== '') {
          sectionVal = Number(sec.Section);
        }

        const baseSection: any = {
          Section: sectionVal,
          type: sec.type,
          Questions: formattedQuestions
        };

        if (sec.type === 'text') {
          baseSection.Answer = "";
          baseSection.Photo = "";
        }

        return baseSection;
      });

      const payload = {
        title: activeTemplate.title,
        year: activeTemplate.year,
        data: formattedSections
      };

      await updateTemplate(activeTemplate.id || "", payload);
    } catch (e) {
    } finally {
      setIsSavingSections(false);
    }
  };

  const getSectionTypeLabel = (type: Section['type']) => {
    switch (type) {
      case 'table_text':
        return 'Tabel Nilai (Text)';
      case 'table':
        return 'Tabel Predikat (Multiple Choice)';
      case 'text':
        return 'Teks & Gambar';
    }
  };

  if (loading && templates.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {!activeTemplate ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Template Rapor</h1>
              <p className="text-muted-foreground">Belum ada template rapor yang terdaftar</p>
            </div>
          </div>
          <div className="flex justify-center py-16 border rounded-xl bg-card border-dashed">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Buat template rapor pertama untuk mulai menggunakan fitur ini.</p>
              <Button onClick={() => {
                setEditingTemplateData(null);
                setTemplateFormOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Template Rapor
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">Template: {activeTemplate.title}</h1>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                    setEditingTemplateData(activeTemplate);
                    setTemplateFormOpen(true);
                  }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1">Tahun: {activeTemplate.year} | Kelola section dalam template rapor</p>
              </div>
              <Button onClick={() => setPreviewOpen(true)} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Section Template</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={hasChanges ? "default" : "secondary"} 
                    disabled={!hasChanges || isSavingSections} 
                    onClick={handleSimpanSemuaPerubahan}
                  >
                    {isSavingSections ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button onClick={handleAddSection} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Section
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {localSections.map((section) => (
                  <div key={section.id} className="p-4 bg-muted/30 rounded-md border border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{section.Section}</h3>
                        <span className="text-xs text-muted-foreground">({getSectionTypeLabel(section.type)})</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditSection(section)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(section)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Preview section content */}
                    {section.type === 'table_text' && (
                      <table className="w-full text-sm border-collapse bg-background">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left bg-muted">Pertanyaan</th>
                            <th className="border p-2 text-left bg-muted">Nilai</th>
                            <th className="border p-2 text-left bg-muted">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.Questions?.map((q: Question, i: number) => (
                            <tr key={i}>
                              <td className="border p-2">{q.Question}</td>
                              <td className="border p-2"></td>
                              <td className="border p-2"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {section.type === 'table' && (
                      <table className="w-full text-sm border-collapse bg-background">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left bg-muted">Aspek</th>
                            {(section.Questions?.[0]?.answers || ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik']).map((opt: string) => (
                              <th key={opt} className="border p-2 text-center bg-muted text-xs">{opt}</th>
                            ))}
                            <th className="border p-2 text-left bg-muted">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.Questions?.map((q: Question, i: number) => (
                            <tr key={i}>
                              <td className="border p-2">{q.Question}</td>
                              {(q.answers || []).map((opt: string) => (
                                <td key={opt} className="border p-2 text-center">
                                  <div className="w-4 h-4 border rounded-full mx-auto" />
                                </td>
                              ))}
                              <td className="border p-2"></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {section.type === 'text' && (
                      <div className="border p-4 space-y-4 bg-background">
                        {section.Questions?.map((q: Question, i: number) => (
                          <div key={i} className="text-sm text-muted-foreground italic">
                            {q.Question}: (Area untuk catatan)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {localSections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-background">
                    <p>Belum ada section. Klik "Tambah Section" untuk memulai.</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      <ReportTemplateForm
        open={templateFormOpen}
        onOpenChange={setTemplateFormOpen}
        onSubmit={editingTemplateData ? handleUpdateTemplateInfo : handleCreateTemplate}
        initialData={editingTemplateData}
      />

      <SectionForm
        open={sectionFormOpen}
        onOpenChange={setSectionFormOpen}
        onSubmit={handleSaveSection}
        initialData={selectedSection}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Section"
        description={`Apakah Anda yakin ingin menghapus section "${selectedSection?.Section}"?`}
      />

      {activeTemplate && (
        <ReportPDFPreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          templateName={activeTemplate.title}
          sections={localSections}
        />
      )}
    </div>
  );
};

export default ReportTemplates;
