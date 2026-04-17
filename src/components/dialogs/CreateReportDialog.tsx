import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { studentService } from "@/services/studentService";
import { SelectOption } from "@/types/api";

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (studentId: string, studentName: string, year: string, semester: string) => void;
}

export const CreateReportDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateReportDialogProps) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-based, jadi 0 = Januari, 11 = Desember
  // Di Indonesia biasanya tahun ajaran baru dimulai bulan Juli (bulan ke-6)
  const startYear = currentMonth < 6 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
  const defaultYear = `${startYear}/${startYear + 1}`;
  const defaultSemester = currentMonth < 6 ? "genap" : "ganjil";
  
  const [selectedStudent, setSelectedStudent] = useState("");
  const [year, setYear] = useState(defaultYear);
  const [semester, setSemester] = useState(defaultSemester);
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Buat beberapa opsi tahun ajaran dinamis (+/- dari tahun sekarang)
  const yearOptions = [
    `${startYear - 2}/${startYear - 1}`,
    `${startYear - 1}/${startYear}`,
    `${startYear}/${startYear + 1}`,
    `${startYear + 1}/${startYear + 2}`,
  ];

  useEffect(() => {
    if (open) {
      fetchStudentOptions();
    }
  }, [open]);

  const fetchStudentOptions = async () => {
    setLoadingStudents(true);
    try {
      const options = await studentService.getOptions();
      setStudentOptions(options);
    } catch (error) {
      console.error("Gagal memuat opsi siswa:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = () => {
    if (!Array.isArray(studentOptions)) return;
    const student = studentOptions.find(s => String(s.value) === selectedStudent);
    if (student) {
      onSubmit(String(student.value), student.label, year, semester);
      setSelectedStudent("");
      setYear(defaultYear);
      setSemester(defaultSemester);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Rapor Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Pilih Murid</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={loadingStudents}>
              <SelectTrigger>
                <SelectValue placeholder={loadingStudents ? "Memuat..." : "Pilih murid"} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(studentOptions) && studentOptions.map((opt, idx) => (
                  <SelectItem key={opt.value || idx} value={opt.value ? String(opt.value) : `opt-${idx}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tahun Ajaran</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Semester</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ganjil">Ganjil</SelectItem>
                <SelectItem value="genap">Genap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedStudent || loadingStudents}>
            Buat Rapor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};