"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, X, CircleCheck, CircleAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseStorage, getFirestoreDb } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function GalleryUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter max 5MB just in case (also checked in rules)
    const validFiles = acceptedFiles.filter(f => f.size <= 5 * 1024 * 1024);
    
    if (validFiles.length < acceptedFiles.length) {
      toast.error("Algunas fotos eran demasiado grandes (>5MB) y se han ignorado.");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setStatus("uploading");
    setUploadProgress(0);
    const storage = getFirebaseStorage();
    const db = getFirestoreDb();
    
    try {
      let completed = 0;
      
      await Promise.all(files.map(async (file) => {
        // 1. Create unique path: gallery/{timestamp}_{random}_{filename}
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const path = `gallery/${timestamp}_${random}_${safeName}`;
        const storageRef = ref(storage, path);

        // 2. Upload file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // 3. Create Firestore record (pending approval)
        await addDoc(collection(db, "gallery"), {
          url: downloadUrl,
          path: path,
          status: "pending", // Moderation queue
          createdAt: serverTimestamp(),
          size: file.size,
          type: file.type,
          originalName: file.name
        });

        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }));

      setStatus("success");
      setFiles([]);
      toast.success("¡Fotos subidas! Esperando moderación.");
      
      // Reset after delay
      setTimeout(() => {
        setStatus("idle");
        setUploadProgress(0);
      }, 3000);

    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error("Error al subir algunas fotos. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* DROPZONE */}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-border/50 hover:border-primary/50 hover:bg-muted/50",
          status === "uploading" && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 text-center p-4">
          <div className="p-3 bg-background rounded-full shadow-sm border border-border">
             <CloudUpload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
             <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Suelta las fotos aquí" : "Sube tus fotos"}
             </p>
             <p className="text-xs text-muted-foreground">
                Arrastra o haz clic para seleccionar
             </p>
          </div>
        </div>
      </div>

      {/* PREVIEW LIST */}
      {files.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                 {files.length} {files.length === 1 ? "foto seleccionada" : "fotos seleccionadas"}
              </h3>
              <button 
                 onClick={() => setFiles([])}
                 className="text-xs text-red-500 hover:underline"
                 disabled={status === "uploading"}
              >
                 Borrar todas
              </button>
           </div>
           
           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {files.map((file, i) => (
                 <div key={i} className="relative aspect-square group rounded-lg overflow-hidden border border-border bg-muted">
                    <Image 
                       src={URL.createObjectURL(file)} 
                       alt="Preview" 
                       fill 
                       className="object-cover"
                       onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                    {status !== "uploading" && (
                         <button 
                             onClick={() => removeFile(i)}
                             className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                         >
                             <X size={12} />
                         </button>
                    )}
                 </div>
              ))}
           </div>

           {/* ACTIONS */}
           <div className="pt-2">
               {status === "idle" && (
                  <button
                    onClick={handleUpload}
                    className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition hover:opacity-90 shadow-md"
                  >
                    Subir {files.length} fotos
                  </button>
               )}
               
               {status === "uploading" && (
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <span>Subiendo...</span>
                        <span>{uploadProgress}%</span>
                     </div>
                     <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-primary transition-all duration-300 ease-out"
                           style={{ width: `${uploadProgress}%` }}
                        />
                     </div>
                  </div>
               )}

               {status === "success" && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                     <CircleCheck size={20} />
                     <span className="font-medium">¡Fotos subidas con éxito!</span>
                  </div>
               )}

               {status === "error" && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                     <CircleAlert size={20} />
                     <span className="font-medium">Hubo un error. Revisa tu conexión.</span>
                  </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
}
