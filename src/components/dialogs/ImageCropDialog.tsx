import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  aspectRatio?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropDialog = ({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspectRatio
}: ImageCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (aspectRatio) {
      setCrop(centerAspectCrop(width, height, aspectRatio));
    } else {
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5
      });
    }
  }, [aspectRatio]);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Hitung ukuran asli area pemotongan berdasarkan gambar natural
    const cropNativeWidth = completedCrop.width * scaleX;
    const cropNativeHeight = completedCrop.height * scaleY;

    // Batasi maksimum resolusi ke 1200px agar payload ringan tapi teks tetap sangat fokus (terbaca)
    const MAX_DIM = 1200;
    let finalWidth = cropNativeWidth;
    let finalHeight = cropNativeHeight;

    if (Math.max(finalWidth, finalHeight) > MAX_DIM) {
      if (finalWidth > finalHeight) {
        finalHeight = Math.round(finalHeight * (MAX_DIM / finalWidth));
        finalWidth = MAX_DIM;
      } else {
        finalWidth = Math.round(finalWidth * (MAX_DIM / finalHeight));
        finalHeight = MAX_DIM;
      }
    }

    // Hindari upscale jika gambar aslinya kecil
    canvas.width = Math.max(completedCrop.width, finalWidth);
    canvas.height = Math.max(completedCrop.height, finalHeight);

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      cropNativeWidth,
      cropNativeHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.85);
    onCropComplete(croppedImageUrl);
    onOpenChange(false);
  }, [completedCrop, onCropComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Gambar</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop"
              onLoad={onImageLoad}
              className="max-h-[400px]"
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={getCroppedImg}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
