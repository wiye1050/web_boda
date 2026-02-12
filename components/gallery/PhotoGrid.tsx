"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { Lightbox } from "@/components/gallery/Lightbox";
import Image from "next/image";
import { LoaderCircle, Maximize2, X } from "lucide-react";

type GalleryImage = {
  id: string;
  url: string;
  originalName: string;
  createdAt: any;
};

export function PhotoGrid() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    // Only show APPROVED photos
    const q = query(
      collection(db, "gallery"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(50) 
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryImage[];
      setImages(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/50 bg-muted/30">
        <p className="text-muted-foreground text-sm">
          Aún no hay fotos publicadas. ¡Sé el primero en subir una!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="break-inside-avoid relative group rounded-xl overflow-hidden bg-muted cursor-zoom-in"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image.url}
              alt="Boda guest photo"
              width={500}
              height={500}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      <Lightbox 
        src={selectedImage?.url || null} 
        onClose={() => setSelectedImage(null)} 
      />
    </>
  );
}
