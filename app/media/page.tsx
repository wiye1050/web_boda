import { GalleryUpload } from "@/components/gallery/GalleryUpload";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { getPublicConfig } from "@/lib/getPublicConfig";


export default async function GalleryPage() {
  const config = await getPublicConfig();
  const navItems = config.sections
    .filter((section) => section.enabled && section.nav)
    // .filter((section) => sectionHasContent(section.id)) // Simplified for media page, or replicate logic if needed
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      label: section.label.trim() || section.id,
      href: section.id === "media" ? "/media" : `/#${section.id}`, // Ensure links go to home sections
    }));

  return (
    <>
      <TopBar 
        config={config}
        navItems={navItems}
        brandName={config.brandName}
        ctaLabel={config.headerCtaLabel}
      />
      <main className="min-h-screen pt-24 pb-12">
         {/* HEADER */}
         <Section
            align="center"
            title="Media & Recuerdos"
            description="Comparte tus fotos y vídeos favoritos de la boda con nosotros. ¡Ayúdanos a recopilar todos los recuerdos!"
         >
            <div /> {/* Empty children as Section requires children */}
         </Section>

         {/* UPLOAD SECTION */}
         <Section>
            <div className="bg-surface rounded-2xl border border-border/60 shadow-sm p-6 md:p-8">
               <h2 className="text-xl font-serif italic text-center mb-6">Sube tus fotos</h2>
               <GalleryUpload />
               <p className="text-center text-xs text-muted-foreground mt-4">
                  * Las fotos pasarán una pequeña revisión antes de publicarse para evitar sustos de última hora. 😉
               </p>
            </div>
         </Section>

         {/* GRID SECTION */}
         <Section 
            title="Momentos Capturados"
            align="center"
         >
            <PhotoGrid />
         </Section>
      </main>
      <Footer />
    </>
  );
}
