import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useTranslation } from 'react-i18next';

export default function InteractionPage({ lang, mushroomId, vectorId }) {
  const { t } = useTranslation();
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    // Load the generated SEO matrix
    fetch('/seo_matrix.json')
      .then(res => res.json())
      .then(data => {
        if (data[lang] && data[lang][mushroomId] && data[lang][mushroomId][vectorId]) {
          setSeoData(data[lang][mushroomId][vectorId]);
        }
      })
      .catch(err => console.error('Failed to load SEO matrix', err));
  }, [lang, mushroomId, vectorId]);

  if (!seoData) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Loading interaction data...</div>;
  }

  return (
    <div style={{ padding: '100px 20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        canonicalPath={`/${lang}/interactions/${mushroomId}/${vectorId}`}
        schema={seoData.schema}
      />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#f59e0b' }}>
        {seoData.title}
      </h1>
      <div style={{ fontSize: '1.2rem', lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '15px' }}>
        <p>{seoData.description}</p>
        <br />
        <p>
          {lang === 'he' ? 'מידע מורחב על השילוב הסינרגיסטי ויתרונותיו הבריאותיים המלאים יוצג כאן בקרוב.' : 
           lang === 'en' ? 'Extended information regarding this synergistic combination and its full health benefits will be displayed here shortly.' :
           'Extended information will be displayed here.'}
        </p>
      </div>
    </div>
  );
}
