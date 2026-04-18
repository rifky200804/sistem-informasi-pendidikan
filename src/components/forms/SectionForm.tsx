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
  const [headers, setHeaders] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerOptions, setAnswerOptions] = useState<string[]>(['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik']);

  useEffect(() => {
    if (initialData) {
      setSectionName(initialData.Section);
      setType(initialData.type);
      setHeaders(initialData.headers || initialData.Headers || []);
      setQuestions(initialData.Questions || []);
      // Extract answer options from first question if type is 'table'
      if (initialData.type === 'table' && initialData.Questions?.[0]?.answers?.length) {
        setAnswerOptions(initialData.Questions[0].answers);
      }
    } else {
      setSectionName("");
      setType('table_text');
      setHeaders([]);
      setQuestions([]);
      setAnswerOptions(['Belum Berkembang', 'Mulai Berkembang', 'Berkembang Sesuai Harapan', 'Berkembang Sangat Baik']);
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    let finalQuestions = type === 'table' 
      ? questions.map(q => ({ ...q, answers: answerOptions }))
      : questions;

    if (type === 'text') {
      if (finalQuestions.length === 0) {
        finalQuestions = [{
          Question: 'Catatan',
          answer: '',
          answers: [],
          photo: '',
          Ket: ''
        }];
      } else if (!finalQuestions[0].Question || finalQuestions[0].Question.trim() === '') {
        finalQuestions[0].Question = 'Catatan';
      }
    }

    onSubmit({
      id: initialData?.id || '',
      Section: sectionName,
      type,
      headers: headers.filter(h => h.trim() !== ''),
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

  const addHeader = () => {
    if (headers.length < 4) {
      setHeaders([...headers, '']);
    }
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const renderHeadersEditor = () => (
    <div className="space-y-4 mb-6 border-b pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex-1">
          <Label>Kustomisasi Kolom (Headers)</Label>
          <p className="text-xs text-muted-foreground mt-1">Kosongkan jika ingin menggunakan kolom default. Kolom "No" akan dibuat otomatis secara default pada frontend.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addHeader} disabled={headers.length >= 4} className="whitespace-nowrap">
          <Plus className="w-4 h-4 mr-1" />
          Tambah Kolom {headers.length >= 4 && '(Maks 5)'}
        </Button>
      </div>
      {(type === 'table_text' || type === 'table') && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {headers.map((hdr, index) => (
            <div key={index} className="flex items-center gap-1 w-full sm:w-auto">
              <Input
                value={hdr}
                onChange={(e) => updateHeader(index, e.target.value)}
                className="flex-1 sm:w-40"
                placeholder="Nama Kolom"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => removeHeader(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {headers.length === 0 && (
            <div className="text-sm text-muted-foreground italic">Menggunakan header default</div>
          )}
        </div>
      )}
    </div>
  );

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Label className="flex-1">Pilihan Jawaban (Header Kolom)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAnswerOption} className="whitespace-nowrap w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          {answerOptions.map((opt, index) => (
            <div key={index} className="flex items-center gap-1 w-full sm:w-auto">
              <Input
                value={opt}
                onChange={(e) => updateAnswerOption(index, e.target.value)}
                className="flex-1 sm:w-40"
                placeholder="Nama pilihan"
              />
              {answerOptions.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Label className="flex-1">Daftar Pertanyaan (Aspek Penilaian)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="whitespace-nowrap w-full sm:w-auto">
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
                className="flex-shrink-0"
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

  const renderTextEditor = () => {
    const questionText = questions[0]?.Question === 'Catatan' ? '' : (questions[0]?.Question || '');
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Judul Konten (Opsional)</Label>
          <Input 
            placeholder="Masukkan judul untuk bagian ini..."
            value={questionText}
            onChange={(e) => {
              const newQuestions = [...questions];
              if (newQuestions.length === 0) {
                newQuestions.push({
                  Question: e.target.value,
                  answer: '',
                  answers: [],
                  photo: '',
                  Ket: ''
                });
              } else {
                newQuestions[0].Question = e.target.value;
              }
              setQuestions(newQuestions);
            }}
          />
        </div>
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-foreground font-medium mb-2">Informasi Section</p>
          <p className="text-sm text-muted-foreground mb-4">
            Tipe section <strong>"Teks & Gambar"</strong> memiliki area input dinamis.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
            <li>Pengguna akan mendapatkan satu kotak teks catatan besar.</li>
            <li>Pengguna dapat mengunggah hingga maksimal 4 baris foto pendukung yang akan ditampilkan di bawah teks.</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <SelectItem value="table">Tabel Predikat (Select Option)</SelectItem>
                <SelectItem value="text">Teks & Gambar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-4 block text-lg font-semibold">Konten Section</Label>
            {(type === 'table_text' || type === 'table') && renderHeadersEditor()}
            {type === 'table_text' && renderTableTextEditor()}
            {type === 'table' && renderTableEditor()}
            {type === 'text' && renderTextEditor()}
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            {initialData ? 'Update' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
