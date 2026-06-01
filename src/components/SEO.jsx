import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function SEO({ 
  title, 
  description, 
  canonicalPath, 
  schema 
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const baseUrl = 'https://wise-fungi.com';
  
  // Ensure path starts with /
  const path = canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : '';
  const canonicalUrl = `${baseUrl}${path}`;

  // Generate hreflang tags based on the current path
  // If the path is language-prefixed (e.g., /he/interactions/...), we replace it
  const generateHreflang = (lang) => {
    if (!path) return `${baseUrl}/${lang}`;
    
    // Remove current language prefix if it exists
    let cleanPath = path;
    const langPrefixes = ['/en', '/he', '/es', '/fr'];
    for (const prefix of langPrefixes) {
      if (cleanPath.startsWith(prefix)) {
        cleanPath = cleanPath.substring(prefix.length);
        break;
      }
    }
    
    // Default to /en if no prefix was found but we want a different lang
    // Actually, let's just append the lang prefix
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    return `${baseUrl}/${lang}${cleanPath === '/' ? '' : cleanPath}`;
  };

  return (
    <Helmet>
      <title>{title ? `${title} | Wise Fungi` : 'Wise Fungi'}</title>
      {description && <meta name="description" content={description} />}
      
      {canonicalPath && <link rel="canonical" href={canonicalUrl} />}
      
      {canonicalPath && (
        <>
          <link rel="alternate" hreflang="en" href={generateHreflang('en')} />
          <link rel="alternate" hreflang="he" href={generateHreflang('he')} />
          <link rel="alternate" hreflang="es" href={generateHreflang('es')} />
          <link rel="alternate" hreflang="fr" href={generateHreflang('fr')} />
          <link rel="alternate" hreflang="x-default" href={generateHreflang('en')} />
        </>
      )}

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
