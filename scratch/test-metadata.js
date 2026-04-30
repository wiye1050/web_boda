const { DEFAULT_PUBLIC_CONTENT } = require('./lib/publicContent');

async function test() {
  const config = DEFAULT_PUBLIC_CONTENT;
  const metadata = {
    title: {
      default: config.brandName,
      template: `%s | ${config.brandName}`,
    },
    description: "¿Preparado? Pincha el enlace...",
    metadataBase: new URL("https://ayg2026.vercel.app"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: config.brandName,
      description: "¿Preparado? Pincha el enlace...",
      url: "https://ayg2026.vercel.app/",
      siteName: config.brandName,
      images: [
        {
          url: "/logo-whatsapp.jpg",
          width: 1024,
          height: 1024,
          alt: `${config.brandName} - Nuestra Boda`,
          type: "image/jpeg",
        },
      ],
      locale: "es_ES",
      type: "website",
    },
  };
  console.log(JSON.stringify(metadata, null, 2));
}

test();
