"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { getFirestoreDb, getFirebaseStorage } from "@/lib/firebase";
import { LoaderCircle, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  url: string;
  path: string; // Storage path
  status: "pending" | "approved" | "rejected";
  originalName: string;
  createdAt: any;
};

import { Lightbox } from "@/components/gallery/Lightbox";

export default function GalleryAdminPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const q = query(
      collection(db, "gallery"),
      orderBy("createdAt", "desc")
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

  const handleApprove = async (img: GalleryImage) => {
    setProcessingId(img.id);
    try {
      const db = getFirestoreDb();
      await updateDoc(doc(db, "gallery", img.id), { status: "approved" });
      toast.success("Foto aprobada");
    } catch (error) {
      toast.error("Error al aprobar");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm("¿Seguro que quieres borrar esta foto permanentemente?")) return;
    
    setProcessingId(img.id);
    try {
      const db = getFirestoreDb();
      const storage = getFirebaseStorage();
      
      // 1. Delete from Storage
      const storageRef = ref(storage, img.path);
      await deleteObject(storageRef).catch(e => console.warn("Storage file might be missing", e));
      
      // 2. Delete from Firestore
      await deleteDoc(doc(db, "gallery", img.id));
      
      toast.success("Foto eliminada");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingImages = images.filter(i => i.status === "pending");
  const approvedImages = images.filter(i => i.status === "approved");

  if (loading) {
      return <div className="flex h-64 items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Moderación de Galería</h1>
        <p className="text-muted text-sm">Aprueba las fotos de los invitados antes de que salgan en la web.</p>
      </header>

      {/* PENDING SECTION */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
           ⏳ Pendientes de revisión ({pendingImages.length})
        </h2>
        
        {pendingImages.length === 0 ? (
           <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground bg-muted/20">
              ¡Todo limpio! No hay fotos pendientes.
           </div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pendingImages.map(img => (
                 <ImageCard 
                    key={img.id} 
                    img={img} 
                    onApprove={() => handleApprove(img)} 
                    onDelete={() => handleDelete(img)}
                    onView={() => setSelectedImage(img.url)}
                    processing={processingId === img.id}
                 />
              ))}
           </div>
        )}
      </section>

      <div className="border-t border-border my-8" />

      {/* APPROVED SECTION */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-green-600">
           ✅ Publicadas ({approvedImages.length})
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
           {approvedImages.map(img => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border bg-black/5">
                  <div 
                    className="aspect-square cursor-zoom-in"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <Image 
                       src={img.url} 
                       alt="" 
                       width={300} 
                       height={300} 
                       className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={() => handleDelete(img)}
                         className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                         title="Eliminar"
                      >
                         <Trash2 size={14} />
                      </button>
                  </div>
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded pointer-events-none">
                     Publicada
                  </div>
              </div>
           ))}
        </div>
      </section>

      <Lightbox 
        src={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}

function ImageCard({ 
   img, 
   onApprove, 
   onDelete, 
   onView,
   processing 
}: { 
   img: GalleryImage; 
   onApprove: () => void; 
   onDelete: () => void;
   onView: () => void;
   processing: boolean;
}) {
   return (
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface shadow-sm group flex flex-col">
          <div 
            className="aspect-square relative bg-black/5 cursor-zoom-in"
            onClick={onView}
          >
             <Image 
               src={img.url} 
               alt="Pending" 
               fill 
               className="object-contain" 
             />
          </div>
          <div className="p-3 flex gap-2 mt-auto">
             <button 
                onClick={onApprove}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 py-2 rounded-lg text-xs font-bold uppercase hover:bg-green-200 transition disabled:opacity-50"
             >
                <Check size={14} /> Aprobar
             </button>
             <button 
                onClick={onDelete}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 py-2 rounded-lg text-xs font-bold uppercase hover:bg-red-200 transition disabled:opacity-50"
             >
                <X size={14} /> Borrar
             </button>
          </div>
          {processing && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                <LoaderCircle className="animate-spin text-primary" />
             </div>
          )}
      </div>
   );
}
