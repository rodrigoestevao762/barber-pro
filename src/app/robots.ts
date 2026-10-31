import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/painel-cliente/', '/api/'],
      },
    ],
    sitemap: 'https://mrbastos.com.br/sitemap.xml',
  };
}
