import React, { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { Save, Upload, Loader2, Link as LinkIcon, Mail, FileText, User, ExternalLink } from 'lucide-react';

export default function ProfileEditor() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [editingLang, setEditingLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;
      
      // Ensure JSONB fields are objects
      setProfile({
        ...data,
        title: typeof data.title === 'string' ? { es: data.title, en: '' } : data.title || { es: '', en: '' },
        bio: typeof data.bio === 'object' && data.bio !== null ? data.bio : { es: [], en: [] }
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, bucket: string = 'profile-assets') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setProfile({ ...profile, [field]: publicUrl });
    } catch (err: any) {
      alert('Error subiendo archivo: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleBioChange = (value: string) => {
    // Split by new lines to create the array of paragraphs
    const paragraphs = value.split('\n').filter(p => p.trim() !== '');
    setProfile({
      ...profile,
      bio: { ...profile.bio, [editingLang]: paragraphs }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id);

      if (error) throw error;
      alert('Perfil actualizado con éxito');
    } catch (err: any) {
      alert('Error guardando perfil: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Avatar Upload */}
        <div className="space-y-4">
          <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest block">Fotografía</label>
          <div className="relative group">
            <div className="aspect-square bg-surface-container-low border border-outline-variant overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-outline">
                  <User size={48} strokeWidth={1} />
                </div>
              )}
            </div>
            <label className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, 'avatar_url')}
                disabled={!!uploadingField}
              />
              {uploadingField === 'avatar_url' ? <Loader2 className="animate-spin text-on-primary" /> : <Upload className="text-on-primary" />}
            </label>
          </div>
          <p className="text-[9px] text-secondary uppercase italic">Recomendado: 800x800px, PNG/JPG</p>
        </div>

        {/* Basic Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest block">Nombre Completo</label>
            <input 
              type="text" 
              value={profile.full_name || ''}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="w-full bg-surface-container-low border-b border-outline p-3 focus:border-primary outline-none transition-colors font-headline text-xl uppercase tracking-tight"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> Email de Contacto
              </label>
              <input 
                type="email" 
                value={profile.email || ''}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="w-full bg-surface-container-low border-b border-outline p-3 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={12} /> Perfil de LinkedIn
              </label>
              <input 
                type="url" 
                value={profile.linkedin_url || ''}
                onChange={(e) => setProfile({...profile, linkedin_url: e.target.value})}
                className="w-full bg-surface-container-low border-b border-outline p-3 focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
              <FileText size={12} /> Documento CV (PDF)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="text" 
                readOnly
                value={profile.cv_url || 'No se ha subido ningún archivo'}
                className="flex-1 bg-surface-container-low border-b border-outline p-3 text-[10px] text-secondary truncate"
              />
              {profile.cv_url && (
                <a 
                  href={profile.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-3 border border-outline-variant transition-colors flex items-center justify-center"
                  title="Abrir CV"
                >
                  <ExternalLink size={16} className="text-tertiary" />
                </a>
              )}
              <label className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-3 cursor-pointer transition-colors border border-outline-variant">
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={(e) => handleFileUpload(e, 'cv_url')}
                  disabled={!!uploadingField}
                />
                {uploadingField === 'cv_url' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              </label>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-outline-variant" />

      {/* Multilingual Content (Title and Bio) */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold uppercase tracking-tight flex items-center gap-3">
            <div className="w-1 h-5 bg-primary"></div>
            Contenido Editorial
          </h3>
          <div className="flex bg-surface-container-low p-1 border border-outline-variant">
            {(['es', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setEditingLang(l)}
                className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  editingLang === l ? 'bg-primary text-on-primary' : 'text-secondary hover:text-on-surface'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8 animate-in fade-in duration-500" key={editingLang}>
          <div className="space-y-2">
            <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest block">
              Título Profesional ({editingLang.toUpperCase()})
            </label>
            <input 
              type="text" 
              value={profile.title?.[editingLang] || ''}
              onChange={(e) => setProfile({
                ...profile, 
                title: { ...profile.title, [editingLang]: e.target.value }
              })}
              className="w-full bg-surface-container-low border-b border-outline p-4 focus:border-primary outline-none transition-colors font-headline text-2xl tracking-tight"
              placeholder="Ej: Ingeniero Mecánico / Diseñador Industrial"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest block">
              Biografía / Descripción ({editingLang.toUpperCase()})
            </label>
            <textarea 
              value={profile.bio?.[editingLang]?.join('\n') || ''}
              onChange={(e) => handleBioChange(e.target.value)}
              rows={8}
              className="w-full bg-surface-container-low border border-outline-variant p-4 focus:border-primary outline-none transition-colors text-sm leading-relaxed font-body"
              placeholder="Escribe tu biografía aquí. Cada salto de línea será un nuevo párrafo en la web."
            />
            <p className="text-[9px] text-secondary uppercase italic">Tip: Presiona Enter para separar los párrafos.</p>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-12 right-12 z-50">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-4 flex items-center gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 group"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save className="group-hover:rotate-12 transition-transform" />}
          <span className="font-label font-bold uppercase tracking-[0.2em] text-sm">Guardar Perfil</span>
        </button>
      </div>
    </div>
  );
}
