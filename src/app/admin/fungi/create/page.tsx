'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { createFungus, addFungusTranslation } from '@/app/actions/fungi';

export default function CreateFungusPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'en' | 'he'>('core');

  // Core Data
  const [slug, setSlug] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

  // Translations
  const [enTranslation, setEnTranslation] = useState({ name: '', about: '', dosage: '' });
  const [heTranslation, setHeTranslation] = useState({ name: '', about: '', dosage: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Create Core Fungus
      const fungus = await createFungus({
        slug,
        scientific_name: scientificName,
        status,
        is_featured: false,
      });

      // 2. Add Translations
      if (enTranslation.name) {
        await addFungusTranslation(fungus.id, {
          language_code: 'en',
          name: enTranslation.name,
          about_this_mushroom: enTranslation.about,
          recommended_dosage: enTranslation.dosage,
        });
      }
      if (heTranslation.name) {
        await addFungusTranslation(fungus.id, {
          language_code: 'he',
          name: heTranslation.name,
          about_this_mushroom: heTranslation.about,
          recommended_dosage: heTranslation.dosage,
        });
      }

      router.push('/admin/fungi');
    } catch (err) {
      console.error(err);
      alert('Failed to create fungus. Check console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-nature-900 tracking-tight">Create New Fungus</h2>
        <p className="text-nature-600 mt-1">Define the core scientific details and translations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-nature-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-nature-100 bg-nature-50/50">
          <button 
            type="button"
            onClick={() => setActiveTab('core')}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'core' ? 'border-nature-600 text-nature-900 bg-white' : 'border-transparent text-nature-500 hover:text-nature-700 hover:bg-nature-50'}`}
          >
            Core Details
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('en')}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'en' ? 'border-nature-600 text-nature-900 bg-white' : 'border-transparent text-nature-500 hover:text-nature-700 hover:bg-nature-50'}`}
          >
            English Content
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('he')}
            className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'he' ? 'border-nature-600 text-nature-900 bg-white' : 'border-transparent text-nature-500 hover:text-nature-700 hover:bg-nature-50'}`}
          >
            Hebrew Content
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className={activeTab === 'core' ? 'block space-y-6' : 'hidden'}>
            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Unique Slug" 
                value={slug} 
                onChange={e => setSlug(e.target.value)} 
                placeholder="e.g., lions-mane" 
                required 
              />
              <Input 
                label="Scientific Name" 
                value={scientificName} 
                onChange={e => setScientificName(e.target.value)} 
                placeholder="e.g., Hericium erinaceus" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nature-700 mb-1">Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border bg-white border-nature-200 focus:ring-nature-500 focus:ring-2 focus:border-transparent outline-none transition-all"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className={activeTab === 'en' ? 'block space-y-6' : 'hidden'}>
            <Input 
              label="Fungus Name (English)" 
              value={enTranslation.name} 
              onChange={e => setEnTranslation({ ...enTranslation, name: e.target.value })} 
              placeholder="Lion's Mane" 
            />
            <Textarea 
              label="About this Mushroom" 
              value={enTranslation.about} 
              onChange={e => setEnTranslation({ ...enTranslation, about: e.target.value })} 
              placeholder="Detailed description..." 
            />
            <Textarea 
              label="Recommended Dosage" 
              value={enTranslation.dosage} 
              onChange={e => setEnTranslation({ ...enTranslation, dosage: e.target.value })} 
              placeholder="Dosage guidelines..." 
            />
          </div>

          <div className={activeTab === 'he' ? 'block space-y-6 text-right' : 'hidden'} dir="rtl">
            <Input 
              label="שם הפטרייה (עברית)" 
              value={heTranslation.name} 
              onChange={e => setHeTranslation({ ...heTranslation, name: e.target.value })} 
              placeholder="רעמת האריה" 
              className="text-right"
            />
            <Textarea 
              label="על הפטרייה" 
              value={heTranslation.about} 
              onChange={e => setHeTranslation({ ...heTranslation, about: e.target.value })} 
              placeholder="תיאור מפורט..." 
              className="text-right"
            />
            <Textarea 
              label="מינון מומלץ" 
              value={heTranslation.dosage} 
              onChange={e => setHeTranslation({ ...heTranslation, dosage: e.target.value })} 
              placeholder="הנחיות מינון..." 
              className="text-right"
            />
          </div>

          <div className="mt-10 pt-6 border-t border-nature-100 flex justify-end space-x-4">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Fungus</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
