import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Calendar, Eye, Edit } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { StudentReportDialog } from "@/components/dialogs/StudentReportDialog";
import { CreateReportDialog } from "@/components/dialogs/CreateReportDialog";
import { Section, Question } from "@/types/reportTemplate";

interface ProgressReport {
  id: string;
  student: string;
  year: string;
  status: string;
  completedDate: string;
  teacher: string;
  reportData?: Record<string, any>;
}

// Mock template sections (matches new API structure)
const mockTemplateSections: Section[] = [
  {
    id: '1',
    Section: '.1 Nilai Mata Pelajaran',
    type: 'table_text',
    Questions: [
      { Question: 'Matematika', answer: '', answers: [], photo: '', Ket: '' },
      { Question: 'Bahasa Indonesia', answer: '', answers: [], photo: '', Ket: '' },
      { Question: 'Seni', answer: '', answers: [], photo: '', Ket: '' },
    ]
  },
  {
    id: '2',
    Section: '1. Penilaian Perkembangan',
    type: 'table',
    Questions: [
      { 
        Question: 'Siswa dapat mengenal angka 1-10', 
        answer: '', 
        answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'],
        photo: '',
        Ket: ''
      },
      { 
        Question: 'Siswa dapat mengenal huruf A-Z', 
        answer: '', 
        answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'],
        photo: '',
        Ket: ''
      },
      { 
        Question: 'Siswa dapat berinteraksi dengan teman', 
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
      { Question: 'Catatan Guru', answer: '', answers: [], photo: '', Ket: '' }
    ]
  }
];

// Mock students
const mockStudents = [
  { id: 'STD-001', name: 'Aisyah Putri' },
  { id: 'STD-002', name: 'Muhammad Rizki' },
  { id: 'STD-003', name: 'Zahra Amelia' },
  { id: 'STD-004', name: 'Farhan Hakim' },
  { id: 'STD-005', name: 'Salsabila Azzahra' },
];

const mockReports: ProgressReport[] = [
  { 
    id: 'RPT-001', 
    student: 'Aisyah Putri', 
    year: '2023/2024', 
    status: 'completed', 
    completedDate: '2024-01-15', 
    teacher: 'Siti Aminah',
    reportData: {
      '1': { rows: [
        { Question: 'Matematika', answer: '85', Ket: 'Baik' },
        { Question: 'Bahasa Indonesia', answer: '90', Ket: 'Sangat Baik' },
        { Question: 'Seni', answer: '88', Ket: 'Baik' },
      ]},
      '2': { rows: [
        { Question: 'Siswa dapat mengenal angka 1-10', answer: 'Berkembang Sangat Baik', answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'], Ket: 'Mampu dengan baik' },
        { Question: 'Siswa dapat mengenal huruf A-Z', answer: 'Berkembang Sesuai Harapan', answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'], Ket: 'Cukup baik' },
        { Question: 'Siswa dapat berinteraksi dengan teman', answer: 'Berkembang Sangat Baik', answers: ['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik'], Ket: 'Sangat aktif' },
      ]},
      '3': { text: 'Aisyah menunjukkan perkembangan yang sangat baik dalam berbagai aspek pembelajaran.', photo: null }
    }
  },
  { id: 'RPT-002', student: 'Muhammad Rizki', year: '2023/2024', status: 'completed', completedDate: '2024-01-15', teacher: 'Budi Santoso' },
  { id: 'RPT-003', student: 'Zahra Amelia', year: '2023/2024', status: 'draft', completedDate: '-', teacher: 'Dewi Lestari' },
  { id: 'RPT-004', student: 'Farhan Hakim', year: '2023/2024', status: 'completed', completedDate: '2024-01-16', teacher: 'Ahmad Fauzi' },
  { id: 'RPT-005', student: 'Salsabila Azzahra', year: '2023/2024', status: 'draft', completedDate: '-', teacher: 'Rina Kartika' },
];

const ProgressReports = () => {
  const [reports, setReports] = useState(mockReports);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleView = (report: ProgressReport) => {
    setSelectedReport(report);
    setIsReadOnly(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (report: ProgressReport) => {
    setSelectedReport(report);
    setIsReadOnly(false);
    setIsDialogOpen(true);
  };

  const handleSave = (data: Record<string, any>) => {
    if (selectedReport) {
      setReports(reports.map(r => 
        r.id === selectedReport.id 
          ? { ...r, reportData: data, status: 'draft' }
          : r
      ));
    }
  };

  const handleCreateReport = (studentId: string, studentName: string, year: string) => {
    const newReport: ProgressReport = {
      id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
      student: studentName,
      year,
      status: 'draft',
      completedDate: '-',
      teacher: 'Siti Aminah', // Default teacher, should be from auth
    };
    setReports([...reports, newReport]);
    setIsCreateDialogOpen(false);
    
    // Open the new report for editing
    setSelectedReport(newReport);
    setIsReadOnly(false);
    setIsDialogOpen(true);
  };

  const columns: Column<ProgressReport>[] = [
    { key: 'id', header: 'ID Rapor' },
    { key: 'student', header: 'Nama Murid' },
    { key: 'year', header: 'Tahun Ajaran' },
    { key: 'teacher', header: 'Guru Wali' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
          {item.status === 'completed' ? 'Selesai' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'completedDate',
      header: 'Tanggal Selesai',
      render: (item) => (
        item.completedDate !== '-' ? (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{new Date(item.completedDate).toLocaleDateString('id-ID')}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          {item.status === 'completed' && (
            <Button variant="ghost" size="sm">
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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
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

      <StudentReportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        studentName={selectedReport?.student || ""}
        templateName="Template Rapor PAUD"
        sections={mockTemplateSections}
        reportData={selectedReport?.reportData}
        onSave={handleSave}
        readOnly={isReadOnly}
      />

      <CreateReportDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        students={mockStudents}
        onSubmit={handleCreateReport}
      />
    </div>
  );
};

export default ProgressReports;
