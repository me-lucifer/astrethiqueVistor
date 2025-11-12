
"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (dataUrl: string) => void;
}

// Function to create a data URL from the cropped image
function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<string> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return Promise.reject(new Error('Canvas context is not available.'));
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        resolve(canvas.toDataURL('image/webp'));
    });
}


export function ProfilePhotoModal({ isOpen, onOpenChange, onSave }: ProfilePhotoModalProps) {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [previewUrl, setPreviewUrl] = useState('');
    const imgRef = useRef<HTMLImageElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (completedCrop?.width && completedCrop?.height && imgRef.current) {
            getCroppedImg(imgRef.current, completedCrop).then(url => {
                setPreviewUrl(url);
            });
        }
    }, [completedCrop]);

    const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ variant: 'destructive', title: 'File is too large', description: 'Please select an image smaller than 5MB.' });
                return;
            }
            setCrop(undefined); // Makes crop preview update between images.
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(file);
        }
    };
    
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width,
            height
        );
        setCrop(newCrop);
    }

    async function handleSaveCrop() {
        if (!previewUrl) return;
        onSave(previewUrl);
    }

    const aspect = 1;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Update Profile Photo</DialogTitle>
                    <DialogDescription>
                        Upload and crop your new photo. JPG, PNG, or WebP, up to 5MB.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={onSelectFile} />
                    
                    {imgSrc && (
                        <div className="space-y-4">
                            <div className="flex justify-center bg-muted/30 p-4 rounded-md">
                                <ReactCrop
                                    crop={crop}
                                    onChange={c => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={aspect}
                                    circularCrop
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Zoom</label>
                                <Slider
                                    defaultValue={[1]}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onValueChange={(value) => setScale(value[0])}
                                />
                            </div>

                             <div className="flex items-center gap-4">
                                <p className="text-sm font-medium">Preview</p>
                                <div className="flex items-center gap-4">
                                    <img src={previewUrl} alt="Preview" style={{ width: 160, height: 160, borderRadius: '50%', objectFit: 'cover' }} />
                                    <img src={previewUrl} alt="Preview" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
                                    <img src={previewUrl} alt="Preview" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveCrop} disabled={!completedCrop}>
                        Save Photo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
