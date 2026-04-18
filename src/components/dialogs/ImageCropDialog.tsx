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
    if (!completedCrop || !imgRef.current) {
      console.error("No crop data or image ref");
      return;
    }

    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropNativeWidth = completedCrop.width * scaleX;
      const cropNativeHeight = completedCrop.height * scaleY;

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

      canvas.width = Math.max(finalWidth, 100);
      canvas.height = Math.max(finalHeight, 100);

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
    } catch (error) {
      console.error("Error during crop:", error);
    }
  }, [completedCrop, onCropComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Gambar</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-4 bg-slate-100 rounded-lg">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={50}
            minHeight={50}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[400px] max-w-full"
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button 
            onClick={getCroppedImg}
            disabled={!completedCrop}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
