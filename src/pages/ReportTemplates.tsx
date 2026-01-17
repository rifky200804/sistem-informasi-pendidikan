import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { SectionForm } from "@/components/forms/SectionForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { ReportPDFPreview } from "@/components/preview/ReportPDFPreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section, Question } from "@/types/reportTemplate";

const mockSections: Section[] = [
  {
    id: '1',
    Section: '.1 Nilai Mata Pelajaran',
    type: 'table_text',
    Questions: [
      { Question: 'Bahasa Indonesia', answer: '', answers: [], photo: '', Ket: '' },
      { Question: 'Bahasa Inggris', answer: '', answers: [], photo: '', Ket: '' },
      { Question: 'Matematika', answer: '', answers: [], photo: '', Ket: '' },
    ]
  },
  {
    id: '2',
    Section: '1. Penilaian Perkembangan',
    type: 'table',
    Questions: [
      { 
        Question: 'Mengenal angka 1-10', 
        answer: '', 
        answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'],
        photo: '',
        Ket: ''
      },
      { 
        Question: 'Mengenal warna primer (merah, biru, kuning)', 
        answer: '', 
        answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'],
        photo: '',
        Ket: ''
      },
    ]
  },
  {
    id: '3',
    Section: '3. Catatan Perkembangan',
    type: 'text',
    Questions: [
      { Question: 'Catatan', answer: '', answers: [], photo: '', Ket: '' }
    ]
  }
];

const ReportTemplates = () => {
  const [templateName, setTemplateName] = useState("Template Rapor PAUD Semester 1 Tahun 2025/2026");
  const [templateYear, setTemplateYear] = useState(2025);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const handleAddSection = () => {
    setSelectedSection(null);
    setSectionFormOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setSectionFormOpen(true);
  };

  const handleSaveSection = (sectionData: Section) => {
    if (selectedSection) {
      setSections(sections.map(s => s.id === selectedSection.id ? { ...sectionData, id: selectedSection.id } : s));
    } else {
      setSections([...sections, { ...sectionData, id: Date.now().toString() }]);
    }
    setSectionFormOpen(false);
    setSelectedSection(null);
  };

  const handleDeleteClick = (section: Section) => {
    setSelectedSection(section);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSection) {
      setSections(sections.filter(s => s.id !== selectedSection.id));
      setDeleteDialogOpen(false);
      setSelectedSection(null);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Template Rapor</h1>
          <p className="text-muted-foreground">Kelola section dalam template rapor</p>
        </div>
        <Button onClick={() => setPreviewOpen(true)} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nama Template</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Masukkan nama template"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateYear">Tahun</Label>
              <Input
                id="templateYear"
                type="number"
                value={templateYear}
                onChange={(e) => setTemplateYear(Number(e.target.value))}
                placeholder="Masukkan tahun"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Section Template</h2>
              <Button onClick={handleAddSection} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah
              </Button>
            </div>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="p-4 bg-muted/30 rounded-md">
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
                    <table className="w-full text-sm border-collapse">
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
                    <table className="w-full text-sm border-collapse">
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
                    <div className="border p-4 space-y-4">
                      {section.Questions?.map((q: Question, i: number) => (
                        <div key={i} className="text-sm text-muted-foreground italic">
                          {q.Question}: (Area untuk catatan)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {sections.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada section. Klik "Tambah" untuk memulai.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

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

      <ReportPDFPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        templateName={templateName}
        sections={sections}
      />
    </div>
  );
};

export default ReportTemplates;
