import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Image as ImageIcon, X } from "lucide-react";
import { getFileUrl } from "@/lib/fileUrl";
import { useState } from "react";

interface AnecdoteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anecdote: any;
}

export const AnecdoteDetailDialog = ({
  open,
  onOpenChange,
  anecdote,
}: AnecdoteDetailDialogProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!anecdote) return null;

  const title = anecdote.title || "Detail Catatan Anekdot";
  const studentName = anecdote.student || anecdote.studentName || "Tidak ada data murid";
  const description = anecdote.content || anecdote.description || "-";
  const teacherName = anecdote.teacher || (anecdote.teacherId ? `Guru ID: ${anecdote.teacherId}` : "-");
  const finalImageUrl = getFileUrl(anecdote.imageUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{anecdote.date ? new Date(anecdote.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "-"}</span>
            </div>
            {anecdote.category && <Badge variant="outline">{anecdote.category}</Badge>}
          </div>

          {/* Teacher */}
          <div className="text-sm text-muted-foreground">
            Dicatat oleh: <span className="font-medium text-foreground">{teacherName}</span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Deskripsi</h4>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>

          {/* Image */}
          {anecdote.imageUrl && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Dokumentasi</h4>
              <div 
                className="rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity relative group"
                onClick={() => setIsPreviewOpen(true)}
              >
                <img 
                  src={finalImageUrl} 
                  alt={anecdote.title}
                  className="w-full h-auto max-h-80 object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-background/80 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">Klik untuk memperbesar</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Image Preview Dialog */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none flex items-center justify-center">
              <div className="relative group">
                <img 
                  src={finalImageUrl} 
                  alt={anecdote.title}
                  className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                />
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute -top-4 -right-4 bg-background rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {!anecdote.imageUrl && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Dokumentasi</h4>
              <div className="flex items-center justify-center h-40 rounded-lg border border-dashed bg-muted/50">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada gambar</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};