import { useEffect } from "react";
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
import { CreateStudentData, Student } from "@/services/studentService";

const studentSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  identifier: z.string().min(1, "Identifier wajib diisi"),
  nisn: z.string().min(1, "NISN wajib diisi"),
  className: z.string().min(1, "Kelas wajib diisi"),
  tahunAjaran: z.string().min(1, "Tahun Ajaran wajib diisi"),
  parentName: z.string().min(1, "Nama orang tua wajib diisi"),
  parentPhone: z.string().min(1, "Nomor telepon orang tua wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
});

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStudentData) => Promise<void>;
  student?: Student;
  defaultClassName?: string;
}

export function StudentForm({ open, onOpenChange, onSubmit, student, defaultClassName }: StudentFormProps) {
  const form = useForm<CreateStudentData>({
    resolver: zodResolver(studentSchema),
    defaultValues: student || {
      name: "",
      identifier: "",
      nisn: "",
      className: defaultClassName || "",
      tahunAjaran: "",
      parentName: "",
      parentPhone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(student || {
        name: "",
        identifier: "",
        nisn: "",
        className: defaultClassName || "",
        tahunAjaran: "",
        parentName: "",
        parentPhone: "",
        address: "",
      });
    }
  }, [open, student, defaultClassName, form]);

  const handleSubmit = async (data: CreateStudentData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Murid" : "Tambah Murid Baru"}</DialogTitle>
          <DialogDescription>
            {student ? "Ubah data murid" : "Tambahkan murid baru ke sistem"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifier / NIK</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan Identifier" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NISN</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan NISN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="className"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">Kelas A</SelectItem>
                      <SelectItem value="B">Kelas B</SelectItem>
                      <SelectItem value="C">Kelas C</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tahunAjaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Ajaran</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 2024/2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Orang Tua</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama orang tua" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon Orang Tua</FormLabel>
                  <FormControl>
                    <Input placeholder="08xxxxxxxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan alamat lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
              <Button type="submit" className="w-full sm:w-auto">{student ? "Simpan Perubahan" : "Tambah Murid"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
