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
import { CreateAPEData, APE } from "@/services/apeService";

const apeSchema = z.object({
  name: z.string().min(1, "Nama APE wajib diisi"),
  code: z.string().min(1, "Kode APE wajib diisi"),
  category: z.enum(["indoor", "outdoor", "edukatif", "kreativitas"]),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  condition: z.enum(["baik", "rusak", "hilang"]),
  location: z.string().min(1, "Lokasi wajib diisi"),
  purchaseDate: z.string().min(1, "Tanggal pembelian wajib diisi"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  notes: z.string(),
});

interface APEFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAPEData) => Promise<void>;
  ape?: APE;
}

export function APEForm({ open, onOpenChange, onSubmit, ape }: APEFormProps) {
  const form = useForm<CreateAPEData>({
    resolver: zodResolver(apeSchema),
    defaultValues: ape ? {
      name: ape.name,
      code: ape.code,
      category: ape.category,
      quantity: ape.quantity,
      condition: ape.condition,
      location: ape.location,
      purchaseDate: ape.purchaseDate,
      price: ape.price,
      notes: ape.notes,
    } : {
      name: "",
      code: "",
      category: "edukatif",
      quantity: 1,
      condition: "baik",
      location: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      price: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(ape ? {
        name: ape.name,
        code: ape.code,
        category: ape.category,
        quantity: ape.quantity,
        condition: ape.condition,
        location: ape.location,
        purchaseDate: ape.purchaseDate,
        price: ape.price,
        notes: ape.notes,
      } : {
        name: "",
        code: "",
        category: "edukatif",
        quantity: 1,
        condition: "baik",
        location: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        price: 0,
        notes: "",
      });
    }
  }, [open, ape, form]);

  const handleSubmit = async (data: CreateAPEData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ape ? "Edit APE" : "Tambah APE Baru"}</DialogTitle>
          <DialogDescription>
            {ape ? "Ubah data APE" : "Tambahkan Alat Permainan Edukatif baru"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama APE</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Puzzle Kayu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode APE</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: APE-001" {...field} />
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
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="edukatif">Edukatif</SelectItem>
                      <SelectItem value="kreativitas">Kreativitas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kondisi</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kondisi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="baik">Baik</SelectItem>
                      <SelectItem value="rusak">Rusak</SelectItem>
                      <SelectItem value="hilang">Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Kelas A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pembelian</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga (Rp)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan tambahan..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{ape ? "Simpan Perubahan" : "Tambah APE"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
