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

const anecdoteSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  studentId: z.string().min(1, "Murid wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  category: z.enum(["prestasi", "perilaku", "kesehatan", "umum"]),
});

interface AnecdoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAnecdoteData) => Promise<void>;
  anecdote?: Anecdote;
}

export function AnecdoteForm({ open, onOpenChange, onSubmit, anecdote }: AnecdoteFormProps) {
  const form = useForm<CreateAnecdoteData>({
    resolver: zodResolver(anecdoteSchema),
    defaultValues: anecdote ? {
      title: anecdote.title,
      content: anecdote.content,
      studentId: anecdote.studentId,
      date: anecdote.date,
      category: anecdote.category,
    } : {
      title: "",
      content: "",
      studentId: "",
      date: new Date().toISOString().split('T')[0],
      category: "umum",
    },
  });

  const handleSubmit = async (data: CreateAnecdoteData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
                  <FormLabel>ID Murid</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan ID murid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
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
              name="content"
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
            <DialogFooter>
              <Button type="submit">{anecdote ? "Simpan Perubahan" : "Tambah Anekdot"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
