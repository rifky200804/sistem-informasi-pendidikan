import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Eye, Image as ImageIcon, Upload, FileText, ChevronLeft, Save, Pencil, Download, Search, ChevronRight, X, Crop } from "lucide-react";
import { toast } from "sonner";
import { soalService, Subject, Question } from "@/services/soalService";
import { getFileUrl } from "@/lib/fileUrl";
import { ImageCropDialog } from "@/components/dialogs/ImageCropDialog";

const Soal = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubjects = subjects.filter(subject => 
    subject.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Which subject is currently being edited/built. If null, show list.
  const [activeSubjectId, setActiveSubjectId] = useState<string | number | null>(null);

  // Buffer state for the active subject being edited so we can "Save" all at once
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Modals for question management
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [previewAllOpen, setPreviewAllOpen] = useState(false);
  const [previewListSubject, setListPreviewSubject] = useState<Subject | null>(null);

  // Form State for Soal
  const [currentQuestionData, setCurrentQuestionData] = useState<Question>({
    id: "",
    text: "",
    imageUrl: null,
    imageSize: "medium"
  });

  // Crop Dialog state
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropImagePreview, setCropImagePreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await soalService.getAll();
      setSubjects(data);
    } catch (error) {
      console.error("Gagal mengambil data soal:", error);
      toast.error("Gagal memuat daftar soal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // --- Handlers for Subject List View ---
  const handleCreateNewList = () => {
    // Create an empty subject and go straight to builder view
    setEditingSubject({
      id: `new-${Date.now()}`,
      section: "Nama Soal Baru...",
      questions: []
    });
    setActiveSubjectId("new");
  };

  const handleEditList = async (subject: Subject) => {
    try {
      setLoading(true);
      const detail = await soalService.getById(subject.id);
      
      const questionsWithDefaults = (detail.questions || []).map(q => ({
        ...q,
        imageSize: q.imageSize || 'medium'
      }));

      setEditingSubject({
        ...detail,
        questions: questionsWithDefaults
      });
      setActiveSubjectId(subject.id);
    } catch (e) {
      toast.error("Gagal mengambil detail soal");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (id: string | number) => {
    if (confirm("Yakin ingin menghapus seluruh soal ini?")) {
      try {
        await soalService.delete(id);
        toast.success("Berhasil dihapus!");
        fetchSubjects();
      } catch (error) {
        console.error("Gagal menghapus soal:", error);
        toast.error("Gagal menghapus soal.");
      }
    }
  };

  // --- Handlers for Builder View ---
  const handleSaveBuilder = async () => {
    if (!editingSubject) return;
    if (!editingSubject.section.trim() || editingSubject.section === "Nama Soal Baru...") {
      toast.error("Nama topik / mata pelajaran harus diisi dengan benar.");
      return;
    }

    try {
      if (activeSubjectId === "new") {
        // Strip the temporary local ID for new subjects
        const { id, ...dataToCreate } = editingSubject;
        await soalService.create(dataToCreate);
        toast.success("Soal baru berhasil dibuat!");
      } else {
        await soalService.update(editingSubject.id, editingSubject);
        toast.success("Semua perubahan berhasil disimpan!");
      }
      setActiveSubjectId(null);
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error("Gagal menyimpan soal:", error);
      toast.error("Gagal menyimpan perubahan.");
    }
  };

  const handleCancelBuilder = () => {
    setActiveSubjectId(null);
    setEditingSubject(null);
  };

  // --- Handlers for Question inside Builder ---
  const handleOpenAddQuestion = () => {
    setCurrentQuestionData({
      id: "",
      text: "",
      imageUrl: null,
      imageSize: "medium"
    });
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (q: Question) => {
    setCurrentQuestionData(q);
    setIsQuestionDialogOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!editingSubject) return;

    const newQuestions = [...(editingSubject.questions || [])];
    if (currentQuestionData.id) {
      // Edit
      const idx = newQuestions.findIndex(q => q.id === currentQuestionData.id);
      if (idx >= 0) newQuestions[idx] = currentQuestionData;
    } else {
      // Add
      newQuestions.push({ ...currentQuestionData, id: Date.now().toString() });
    }

    setEditingSubject({ ...editingSubject, questions: newQuestions });
    setIsQuestionDialogOpen(false);
  };

  const handleDeleteQuestion = (qId: string | number) => {
    if (!editingSubject) return;
    if (confirm("Hapus soal (section) ini?")) {
      setEditingSubject({
        ...editingSubject,
        questions: (editingSubject.questions || []).filter(q => q.id !== qId)
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCropImagePreview(previewUrl);
      setIsCropDialogOpen(true);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    // Convert the cropped image data URL to a File object
    try {
      fetch(croppedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
          setCurrentQuestionData(prev => ({ 
            ...prev, 
            imageUrl: file 
          }));
          setIsCropDialogOpen(false);
          setCropImagePreview("");
          toast.success("Gambar berhasil dipotong dan disimpan");
        })
        .catch(err => {
          console.error("Error processing cropped image:", err);
          toast.error("Gagal memproses gambar yang dipotong");
        });
    } catch (err) {
      console.error("Error in handleCropComplete:", err);
      toast.error("Gagal memproses gambar");
    }
  };

  const getQuestionImageUrl = (imgObj: string | File | null): string => {
    if (!imgObj) return "";
    if (imgObj instanceof File) return URL.createObjectURL(imgObj);
    return getFileUrl(imgObj);
  };

  const getImageWidth = (size: string) => {
    switch (size) {
      case "small": return "w-1/4 max-w-[200px]"; // ~25%
      case "medium": return "w-1/2 max-w-[400px]"; // ~50%
      case "large": return "w-3/4 max-w-[600px]"; // ~75%
      case "full": return "w-full"; // 100%
      default: return "w-1/2";
    }
  };



  const handleDownloadPdf = async (subject?: Subject) => {
    let targetSubject = subject || editingSubject;
    if (!targetSubject) return;

    if (subject && (!subject.questions || subject.questions.length === 0)) {
      try {
        toast.info("Mengambil detail soal sebelum mendownload...");
        targetSubject = await soalService.getById(subject.id);
      } catch (e) {
        toast.error("Gagal mengambil detail soal untuk di-download.");
        return;
      }
    }

    const printWindow = window.open('', '', 'height=800,width=800');
    if (!printWindow) {
      toast.error("Pop-up diblokir. Harap izinkan pop-up untuk mencetak PDF.");
      return;
    }

    let htmlContent = `
    <html>
      <head>
        <title>Soal ${targetSubject.section}</title>
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 20mm; color: #000; box-sizing: border-box; }
          .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 40px; border-bottom: 2px solid black; padding-bottom: 20px; }
          .q-container { display: flex; gap: 16px; margin-bottom: 40px; page-break-inside: avoid; }
          .q-num { font-weight: bold; font-size: 18px; min-width: 30px; }
          .q-content { flex: 1; }
          .q-img-wrap { display: flex; justify-content: center; width: 100%; margin-bottom: 20px; }
          .q-img { max-height: 400px; object-fit: contain; }
          .q-text { font-size: 16px; line-height: 1.6; white-space: pre-wrap; text-align: justify; }
          .img-small { width: 25%; }
          .img-medium { width: 50%; }
          .img-large { width: 75%; }
          .img-full { width: 100%; }
        </style>
      </head>
      <body>
        <div class="header">UJIAN: ${targetSubject.section.toUpperCase()}</div>
        <div style="margin-bottom: 40px; font-size: 18px;">
          <div style="display: flex; margin-bottom: 15px;">
            <div style="width: 80px; font-weight: bold;">Nama</div><div style="width: 20px;">:</div>
            <div style="flex: 1; border-bottom: 1px dotted #000; max-width: 400px;"></div>
          </div>
          <div style="display: flex;">
            <div style="width: 80px; font-weight: bold;">Kelas</div><div style="width: 20px;">:</div>
            <div style="flex: 1; border-bottom: 1px dotted #000; max-width: 400px;"></div>
          </div>
        </div>
    `;

    (targetSubject.questions || []).forEach((q, idx) => {
      htmlContent += `<div class="q-container">`;
      htmlContent += `<div class="q-num">${idx + 1}.</div>`;
      htmlContent += `<div class="q-content">`;
      if (q.imageUrl) {
        htmlContent += `<div class="q-img-wrap"><img src="${getQuestionImageUrl(q.imageUrl)}" class="q-img img-${q.imageSize}" /></div>`;
      }
      if (q.text) {
        htmlContent += `<div class="q-text">${q.text}</div>`;
      }
      htmlContent += `</div></div>`;
    });

    htmlContent += `
      </body>
      <script>
        setTimeout(() => { window.print(); window.close(); }, 500);
      </script>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // -------------------------------------------------------------
  // RENDER BUILDER VIEW (Details)
  // -------------------------------------------------------------
  if (activeSubjectId !== null && editingSubject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleCancelBuilder}>
            <ChevronLeft className="w-5 h-5 mr-1" />
            Kembali
          </Button>
          <div className="flex-1 flex justify-between items-center">
            <div className="flex-1 max-w-2xl">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 block">JUDUL / MATA PELAJARAN</Label>
              <Input
                value={editingSubject.section}
                onChange={(e) => setEditingSubject({ ...editingSubject, section: e.target.value })}
                className="text-2xl font-bold h-12"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleDownloadPdf()} className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button onClick={() => setPreviewAllOpen(true)} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSaveBuilder}>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>

        {/* KERTAS PREVIEW EDITOR */}
        <div className="bg-slate-100/50 p-4 md:p-8 rounded-xl border border-slate-200 overflow-x-auto relative">

          <div className="flex justify-end mb-4">
            <Button onClick={handleOpenAddQuestion} className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Section Soal di Kertas
            </Button>
          </div>

          <div className="w-[210mm] min-h-[297mm] mx-auto bg-white border border-slate-200 shadow-xl p-12 relative text-black print:shadow-none print:border-none print:p-0">
            {/* Header Kertas */}
            <div className="text-center font-bold text-2xl mb-8 border-b-2 border-black pb-4">
              {editingSubject.section.toUpperCase()}
            </div>

            {/* Identitas Siswa */}
            <div className="mb-10 space-y-4">
              <div className="flex items-end max-w-md">
                <div className="w-20 font-bold text-lg">Nama</div>
                <div className="w-6 text-center text-lg">:</div>
                <div className="flex-1 border-b border-black border-dashed h-6"></div>
              </div>
              <div className="flex items-end max-w-md">
                <div className="w-20 font-bold text-lg">Kelas</div>
                <div className="w-6 text-center text-lg">:</div>
                <div className="flex-1 border-b border-black border-dashed h-6"></div>
              </div>
            </div>

            {/* Isi Kertas */}
            <div className="space-y-12">
              {(editingSubject.questions || []).map((q, idx) => (
                <div key={q.id} className="relative group p-2 -mx-2 hover:bg-slate-50 rounded transition-colors border border-transparent hover:border-slate-200">
                  {/* Floating Action Buttons that show on hover inside the paper bounds */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm" onClick={() => handleEditQuestion(q)}>
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm" onClick={() => handleDeleteQuestion(q.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="flex gap-4">
                    <div className="font-bold text-lg pt-1">{idx + 1}.</div>
                    <div className="flex-1 flex flex-col gap-6">
                      {q.imageUrl && (
                        <div className="flex justify-center w-full">
                          <img
                            src={getQuestionImageUrl(q.imageUrl)}
                            alt={`Soal ${idx + 1}`}
                            className={`object-contain ${getImageWidth(q.imageSize)} border border-slate-300 p-1 bg-white`}
                          />
                        </div>
                      )}
                      {q.text ? (
                        <p className="text-lg leading-relaxed whitespace-pre-wrap text-justify">
                          {q.text}
                        </p>
                      ) : (
                        <p className="text-lg text-slate-300 italic">(Dikerjakan tanpa teks pertanyaan, hanya gambar)</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(editingSubject.questions || []).length === 0 && (
                <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={handleOpenAddQuestion}>
                  <p>Kertas masih kosong. Klik di sini untuk membuat Section Soal pertama Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialog: Form Question */}
        <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentQuestionData.id ? "Edit Section Soal" : "Pembuatan Section Soal"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Lampiran Gambar Pertanyaan (Opsional)</Label>
                {currentQuestionData.imageUrl ? (
                  <div className="relative border rounded p-2 bg-muted/20">
                    <img src={getQuestionImageUrl(currentQuestionData.imageUrl)} alt="Preview" className="max-h-48 mx-auto rounded" />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setCurrentQuestionData(prev => ({ ...prev, imageUrl: null }))}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mb-2 opacity-50" />
                    <p className="font-medium text-sm">Klik untuk mengunggah gambar lampiran</p>
                    <p className="text-xs opacity-70">Mendukung format JPG, PNG</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </div>

              {currentQuestionData.imageUrl && (
                <div className="space-y-3">
                  <div>
                    <Label>Skala Ukuran Gambar Saat Dicetak Kertas</Label>
                    <Select
                      value={currentQuestionData.imageSize}
                      onValueChange={(val: any) => setCurrentQuestionData(prev => ({ ...prev, imageSize: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih skala ukuran..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Area Kecil (Seperempat Halaman)</SelectItem>
                        <SelectItem value="medium">Area Sedang (Setengah Halaman)</SelectItem>
                        <SelectItem value="large">Area Besar (Tiga perempat Halaman)</SelectItem>
                        <SelectItem value="full">Area Penuh (Penuh memanjang)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCropImagePreview(getQuestionImageUrl(currentQuestionData.imageUrl));
                      setIsCropDialogOpen(true);
                    }}
                    className="w-full gap-2"
                  >
                    <Crop className="w-4 h-4" />
                    Edit / Crop Gambar
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label>Text Area / Teks Pertanyaan</Label>
                <Textarea
                  rows={5}
                  placeholder="Ketik keterangan atau narasi soal di sini..."
                  value={currentQuestionData.text}
                  onChange={(e) => setCurrentQuestionData(prev => ({ ...prev, text: e.target.value }))}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveQuestion}>Simpan ke Section</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Single Component */}
        <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-100">
            <DialogHeader>
              <DialogTitle>Preview Area Kertas (1 Section Soal)</DialogTitle>
            </DialogHeader>
            {previewQuestion && (
              <div className="mt-4 p-8 border rounded-lg bg-white text-black min-h-[300px] shadow-sm">
                <div className="flex flex-col gap-6">
                  {previewQuestion.imageUrl && (
                    <div className="flex justify-center w-full">
                      <img
                        src={getQuestionImageUrl(previewQuestion.imageUrl)}
                        alt="Soal"
                        className={`object-contain ${getImageWidth(previewQuestion.imageSize)} border-2 p-1 bg-white`}
                      />
                    </div>
                  )}
                  {previewQuestion.text && (
                    <p className="text-lg leading-relaxed whitespace-pre-wrap text-justify">
                      {previewQuestion.text}
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setPreviewQuestion(null)}>Tutup Preview</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview All Pages */}
        <Dialog open={previewAllOpen} onOpenChange={setPreviewAllOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100">
            <DialogHeader>
              <DialogTitle>Preview Lembar Soal Keseluruhan</DialogTitle>
            </DialogHeader>
            <div className="mt-4 p-12 border rounded-lg bg-white text-black min-h-[600px] shadow-sm">
              <div className="text-center font-bold text-2xl mb-8 border-b-2 pb-4">
                UJIAN: {editingSubject.section.toUpperCase()}
              </div>

              {/* Identitas Siswa */}
              <div className="mb-10 space-y-4">
                <div className="flex items-end max-w-md">
                  <div className="w-20 font-bold text-lg">Nama</div>
                  <div className="w-6 text-center text-lg">:</div>
                  <div className="flex-1 border-b border-black border-dashed h-6"></div>
                </div>
                <div className="flex items-end max-w-md">
                  <div className="w-20 font-bold text-lg">Kelas</div>
                  <div className="w-6 text-center text-lg">:</div>
                  <div className="flex-1 border-b border-black border-dashed h-6"></div>
                </div>
              </div>

              <div className="space-y-12">
                {(editingSubject.questions || []).map((q, idx) => (
                  <div key={q.id} className="flex gap-4">
                    <div className="font-bold text-lg">{idx + 1}.</div>
                    <div className="flex-1 flex flex-col gap-6">
                      {q.imageUrl && (
                        <div className="flex justify-center w-full">
                          <img
                            src={getQuestionImageUrl(q.imageUrl)}
                            alt={`Soal ${idx + 1}`}
                            className={`object-contain ${getImageWidth(q.imageSize)} border border-slate-300 p-1 bg-white`}
                          />
                        </div>
                      )}
                      {q.text && (
                        <p className="text-lg leading-relaxed whitespace-pre-wrap text-justify">
                          {q.text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setPreviewAllOpen(false)}>Tutup Preview</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Crop Dialog */}
        <ImageCropDialog
          open={isCropDialogOpen}
          onOpenChange={setIsCropDialogOpen}
          imageSrc={cropImagePreview}
          onCropComplete={handleCropComplete}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MASTER LIST (Grid of Subjects)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daftar Paket Soal</h1>
          <p className="text-muted-foreground">Pilih atau buat topik soal untuk mengelola section (Teks & Foto)</p>
        </div>
        <Button onClick={handleCreateNewList}>
          <Plus className="w-4 h-4 mr-2" />
          Mulai Buat Topik Soal
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari berdasarkan judul topik..." 
              className="pl-9 bg-slate-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map(subject => (
          <Card key={subject.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary" onClick={() => handleEditList(subject)}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setListPreviewSubject(null); (async () => {
                  try {
                    const detail = await soalService.getById(subject.id);
                    setListPreviewSubject(detail);
                  } catch (err) { toast.error("Gagal memuat preview"); }
                })(); }} title="Preview Soal" className="text-gray-600 hover:bg-gray-100 border-gray-200 h-8 px-2 text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                </Button>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadPdf(subject); }} title="Download Soal" className="h-8 px-2 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteList(subject.id); }} title="Hapus Topik" className="h-8 w-8 p-0">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{subject.section}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Memiliki {subject.questions?.length ?? subject.totalQuestions ?? 0} section (teks & foto)
            </p>
            <div className="w-full text-center text-sm font-medium text-primary flex items-center justify-center gap-1">
              Buka Soal <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        ))}

        {filteredSubjects.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed rounded-lg bg-card">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tidak ada topik soal yang cocok dengan kata kunci pencarian Anda." : "Penyimpanan soal masih kosong."}
            </p>
            {!searchTerm && <Button onClick={handleCreateNewList} variant="outline">Mulai Buat Topik Soal Pertama Anda</Button>}
          </div>
        )}

        {/* List View Preview Modal */}
        {previewListSubject && (
          <Dialog open={!!previewListSubject} onOpenChange={(open) => !open && setListPreviewSubject(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-100">
              <DialogHeader>
                <DialogTitle>Preview Lembar Soal</DialogTitle>
              </DialogHeader>
              <div className="mt-4 p-12 border rounded-lg bg-white text-black min-h-[600px] shadow-sm">
                <div className="text-center font-bold text-2xl mb-8 border-b-2 pb-4">
                  UJIAN: {previewListSubject.section.toUpperCase()}
                </div>
                <div className="mb-10 space-y-4">
                  <div className="flex items-end max-w-md">
                    <div className="w-20 font-bold text-lg">Nama</div>
                    <div className="w-6 text-center text-lg">:</div>
                    <div className="flex-1 border-b border-black border-dashed h-6"></div>
                  </div>
                  <div className="flex items-end max-w-md">
                    <div className="w-20 font-bold text-lg">Kelas</div>
                    <div className="w-6 text-center text-lg">:</div>
                    <div className="flex-1 border-b border-black border-dashed h-6"></div>
                  </div>
                </div>
                <div className="space-y-12">
                  {(previewListSubject.questions || []).length === 0 ? (
                    <div className="text-center text-muted-foreground">Isi lembar ini kosong.</div>
                  ) : (
                    (previewListSubject.questions || []).map((q, idx) => (
                      <div key={q.id} className="flex gap-4">
                        <div className="font-bold text-lg">{idx + 1}.</div>
                        <div className="flex-1 flex flex-col gap-6">
                          {q.imageUrl && (
                            <div className="flex justify-center w-full">
                              <img src={getQuestionImageUrl(q.imageUrl)} alt={`Soal ${idx + 1}`} className={`object-contain ${getImageWidth(q.imageSize)} border border-slate-300 p-1 bg-white`} />
                            </div>
                          )}
                          {q.text && (
                            <p className="text-lg leading-relaxed whitespace-pre-wrap text-justify">
                              {q.text}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setListPreviewSubject(null)}>Tutup Preview</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Soal;
