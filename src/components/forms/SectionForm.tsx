import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Section, Question, SectionType } from "@/types/reportTemplate";

interface SectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Section) => void;
  initialData?: Section | null;
}

export const SectionForm = ({ open, onOpenChange, onSubmit, initialData }: SectionFormProps) => {
  const [sectionName, setSectionName] = useState("");
  const [type, setType] = useState<SectionType>('table_text');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerOptions, setAnswerOptions] = useState<string[]>(['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik']);

  useEffect(() => {
    if (initialData) {
      setSectionName(initialData.Section);
      setType(initialData.type);
      setQuestions(initialData.Questions || []);
      // Extract answer options from first question if type is 'table'
      if (initialData.type === 'table' && initialData.Questions?.[0]?.answers?.length) {
        setAnswerOptions(initialData.Questions[0].answers);
      }
    } else {
      setSectionName("");
      setType('table_text');
      setQuestions([]);
      setAnswerOptions(['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik']);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    // For 'table' type, apply the same answer options to all questions
    const finalQuestions = type === 'table' 
      ? questions.map(q => ({ ...q, answers: answerOptions }))
      : questions;

    onSubmit({
      id: initialData?.id || '',
      Section: sectionName,
      type,
      Questions: finalQuestions
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      Question: '',
      answer: '',
      answers: type === 'table' ? answerOptions : [],
      photo: '',
      Ket: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], Question: value };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateAnswerOption = (index: number, value: string) => {
    const newOptions = [...answerOptions];
    newOptions[index] = value;
    setAnswerOptions(newOptions);
  };

  const addAnswerOption = () => {
    setAnswerOptions([...answerOptions, '']);
  };

  const removeAnswerOption = (index: number) => {
    if (answerOptions.length > 2) {
      setAnswerOptions(answerOptions.filter((_, i) => i !== index));
    }
  };

  const renderTableTextEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Daftar Pertanyaan (Nilai)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-1" />
          Tambah
        </Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {questions.map((q, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Nama Pertanyaan/Mata Pelajaran"
              value={q.Question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada data. Klik "Tambah" untuk menambahkan.
          </p>
        )}
      </div>
    </div>
  );

  const renderTableEditor = () => (
    <div className="space-y-6">
      {/* Answer Options (Predikat) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Pilihan Jawaban (Header Kolom)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAnswerOption}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {answerOptions.map((opt, index) => (
            <div key={index} className="flex items-center gap-1">
              <Input
                value={opt}
                onChange={(e) => updateAnswerOption(index, e.target.value)}
                className="w-40"
                placeholder="Nama pilihan"
              />
              {answerOptions.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeAnswerOption(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Daftar Pertanyaan (Aspek Penilaian)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {questions.map((q, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Nama Aspek/Pertanyaan"
                value={q.Question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada data. Klik "Tambah" untuk menambahkan aspek.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTextEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Daftar Field Teks</Label>
        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-1" />
          Tambah
        </Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {questions.map((q, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Nama Field (contoh: Catatan)"
              value={q.Question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeQuestion(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada data. Klik "Tambah" untuk menambahkan field.
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        * Upload gambar akan dilakukan saat mengisi rapor
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Section' : 'Tambah Section Baru'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sectionName">Nama Section</Label>
            <Input
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Masukkan nama section"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe Section</Label>
            <Select 
              value={type} 
              onValueChange={(value: SectionType) => {
                setType(value);
                setQuestions([]);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table_text">Tabel Nilai (Input Teks)</SelectItem>
                <SelectItem value="table">Tabel Predikat (Multiple Choice)</SelectItem>
                <SelectItem value="text">Teks & Gambar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-4 block">Konten Section</Label>
            {type === 'table_text' && renderTableTextEditor()}
            {type === 'table' && renderTableEditor()}
            {type === 'text' && renderTextEditor()}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? 'Update' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
