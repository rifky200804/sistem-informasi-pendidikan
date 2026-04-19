import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateAnecdoteData, Anecdote } from "@/services/anecdoteService";
import { studentService } from "@/services/studentService";
import { teacherService } from "@/services/teacherService";
import { SelectOption } from "@/types/api";

const anecdoteSchema = z.object({
  content: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  category: z.enum(["prestasi", "perilaku", "kesehatan", "umum"]),
  studentId: z.coerce.number().optional(),
  teacherId: z.coerce.number().optional(),
  image: z.any().optional(),
});

interface AnecdoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAnecdoteData) => Promise<void>;
  anecdote?: Anecdote;
}

export function AnecdoteForm({ open, onOpenChange, onSubmit, anecdote }: AnecdoteFormProps) {
  const [studentOptions, setStudentOptions] = useState<SelectOption[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const form = useForm<CreateAnecdoteData>({
    resolver: zodResolver(anecdoteSchema),
    defaultValues: anecdote ? {
      content: anecdote.content || "",
      description: anecdote.description || "",
      date: anecdote.date || new Date().toISOString().split('T')[0],
      category: anecdote.category as any || "umum",
      studentId: anecdote.studentId ? Number(anecdote.studentId) : undefined,
      teacherId: anecdote.teacherId || undefined,
    } : {
      content: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      category: "umum",
      studentId: undefined,
      teacherId: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(anecdote ? {
        content: anecdote.content || "",
        description: anecdote.description || "",
        date: anecdote.date || new Date().toISOString().split('T')[0],
        category: anecdote.category as any || "umum",
        studentId: anecdote.studentId ? Number(anecdote.studentId) : undefined,
        teacherId: anecdote.teacherId || undefined,
      } : {
        content: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        category: "umum",
        studentId: undefined,
        teacherId: undefined,
      });

      // Fetch options when dialog is opened
      fetchOptions();
    }
  }, [open, anecdote, form]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const [students, teachers] = await Promise.all([
        studentService.getOptions(),
        teacherService.getTeacherOptions(),
      ]);
      setStudentOptions(students);
      setTeacherOptions(teachers);
    } catch (error) {
      console.error("Gagal memuat opsi siswa/guru:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (data: CreateAnecdoteData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{anecdote ? "Edit Anekdot" : "Tambah Anekdot Baru"}</DialogTitle>
          <DialogDescription>
            {anecdote ? "Ubah catatan anekdot" : "Catat aktivitas dan perkembangan harian murid"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Siswa</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                    disabled={loadingOptions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingOptions ? "Memuat..." : "Pilih siswa"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(studentOptions) && studentOptions.map((opt, idx) => (
                        <SelectItem key={opt.value || idx} value={opt.value ? String(opt.value) : `opt-${idx}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guru</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                    disabled={loadingOptions}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingOptions ? "Memuat..." : "Pilih guru"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.isArray(teacherOptions) && teacherOptions.map((opt, idx) => (
                        <SelectItem key={opt.value || idx} value={opt.value ? String(opt.value) : `opt-${idx}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Aktivitas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Berbagi Mainan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prestasi">Prestasi</SelectItem>
                      <SelectItem value="perilaku">Perilaku</SelectItem>
                      <SelectItem value="kesehatan">Kesehatan</SelectItem>
                      <SelectItem value="umum">Umum</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tuliskan detail aktivitas atau perkembangan murid..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Foto Dokumentasi (Opsional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        onChange(file);
                      }}
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
              <Button type="submit" className="w-full sm:w-auto">{anecdote ? "Simpan Perubahan" : "Tambah Anekdot"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
