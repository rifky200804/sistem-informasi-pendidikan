import { useEffect, useState, useRef } from "react";
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
import { CreateAPEData, APE } from "@/services/apeService";
import { Upload, X, ImageIcon } from "lucide-react";
import { getFileUrl } from "@/lib/fileUrl";

const apeSchema = z.object({
  name: z.string().min(1, "Nama APE wajib diisi"),
  condition: z.string().min(1, "Kondisi wajib diisi"),
  quantity: z.number().min(1, "Jumlah minimal 1"),
  location: z.string().min(1, "Lokasi wajib diisi"),
  photo: z.any().optional(),
});

interface APEFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAPEData) => Promise<void>;
  ape?: APE;
}

export function APEForm({ open, onOpenChange, onSubmit, ape }: APEFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreateAPEData>({
    resolver: zodResolver(apeSchema),
    defaultValues: ape ? {
      name: ape.name || "",
      condition: ape.condition || "Baik",
      quantity: ape.quantity || 1,
      location: ape.location || "",
    } : {
      name: "",
      condition: "Baik",
      quantity: 1,
      location: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(ape ? {
        name: ape.name || "",
        condition: ape.condition || "Baik",
        quantity: ape.quantity || 1,
        location: ape.location || "",
      } : {
        name: "",
        condition: "Baik",
        quantity: 1,
        location: "",
      });
      
      if (ape?.imageUrl || ape?.photo) {
        setPreviewUrl(getFileUrl((ape.imageUrl || ape.photo) as string));
      } else {
        setPreviewUrl(null);
      }
    }
  }, [open, ape, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("photo", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removePhoto = () => {
    form.setValue("photo", null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (data: CreateAPEData) => {
    await onSubmit(data);
    form.reset();
    setPreviewUrl(null);
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
            {/* Photo Upload Section */}
            <div className="space-y-2">
              <FormLabel>Foto APE (Opsional)</FormLabel>
              <div 
                className="relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer min-h-[150px]"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-background">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto();
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-background border shadow-sm">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Klik untuk upload foto</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama APE</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Puzzle Huruf" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kondisi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Baik">Baik</SelectItem>
                      <SelectItem value="Cukup">Cukup</SelectItem>
                      <SelectItem value="Rusak">Rusak</SelectItem>
                      <SelectItem value="Hilang">Hilang</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
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
                      <Input placeholder="Contoh: Ruang A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full sm:w-auto">
                {ape ? "Simpan Perubahan" : "Tambah APE"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
