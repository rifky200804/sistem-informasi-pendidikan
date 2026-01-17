import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Image as ImageIcon } from "lucide-react";

interface AnecdoteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anecdote: {
    id: string;
    student?: string;
    studentName?: string;
    title: string;
    description?: string;
    content?: string;
    date: string;
    teacher: string;
    category: string;
    imageUrl?: string;
  } | null;
}

export const AnecdoteDetailDialog = ({
  open,
  onOpenChange,
  anecdote,
}: AnecdoteDetailDialogProps) => {
  if (!anecdote) return null;

  const studentName = anecdote.student || anecdote.studentName || "-";
  const description = anecdote.description || anecdote.content || "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{anecdote.title}</DialogTitle>
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
              <span>{new Date(anecdote.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <Badge variant="outline">{anecdote.category}</Badge>
          </div>

          {/* Teacher */}
          <div className="text-sm text-muted-foreground">
            Dicatat oleh: <span className="font-medium text-foreground">{anecdote.teacher}</span>
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
              <div className="rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={anecdote.imageUrl} 
                  alt={anecdote.title}
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>
            </div>
          )}

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