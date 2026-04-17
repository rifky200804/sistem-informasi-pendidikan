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
import { CreateTeacherData, Teacher } from "@/services/teacherService";

const teacherSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  role: z.enum(["ADMIN", "KEPALA_SEKOLAH", "GURU"]),
  password: z.string().optional(),
});

interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTeacherData) => Promise<void>;
  teacher?: Teacher;
}

export function TeacherForm({ open, onOpenChange, onSubmit, teacher }: TeacherFormProps) {
  const form = useForm<CreateTeacherData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacher || {
      name: "",
      email: "",
      role: "GURU",
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(teacher || {
        name: "",
        email: "",
        role: "GURU",
        password: "",
      });
    }
  }, [open, teacher, form]);

  const handleSubmit = async (data: CreateTeacherData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{teacher ? "Edit Guru" : "Tambah Guru Baru"}</DialogTitle>
          <DialogDescription>
            {teacher ? "Ubah data guru" : "Tambahkan guru baru ke sistem"}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="KEPALA_SEKOLAH">KEPALA SEKOLAH</SelectItem>
                      <SelectItem value="GURU">GURU</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password {teacher && "(Kosongkan jika tidak ingin mengubah)"}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Masukkan password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{teacher ? "Simpan Perubahan" : "Tambah Guru"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
