import React, { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { Save, Trash2, Plus, Upload, X, Loader2, ChevronLeft, Image as ImageIcon, Box, Globe } from 'lucide-react';
import { toast } from '@lib/toast';

type Translation = Record<string, string>;

interface Spec {
  id?: string;
  label: Translation;
  value: Translation;
  sort_order: number;
}

interface ProjectImage {
  id?: string;
  image_url: string;
  alt_text: string;
  caption?: string;
  sort_order: number;
}

interface Project {
  id?: string;
  title: Translation;
  slug: string;
  subtitle: Translation;
  description: Translation;
  workbench: Translation;
  software: Translation;
  thumbnail_url?: string;
  hero_image_url?: string;
  model_url?: string;
  sort_order: number;
  is_published: boolean;
  project_specs?: Spec[];
  project_images?: ProjectImage[];
}

interface Props {
  projectId?: string;
  lang?: string;
}

export default function ProjectEditor({ projectId, lang = 'es' }: Props) {
  const [editingLang, setEditingLang] = useState<'es' | 'en'>('es');
  const [project, setProject] = useState<Project>({
    title: { es: '', en: '' },
    slug: '',
    subtitle: { es: '', en: '' },
    description: { es: '', en: '' },
    workbench: { es: '', en: '' },
    software: { es: '', en: '' },
    sort_order: 0,
    is_published: false,
    project_specs: [],
    project_images: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && projectId !== 'new') {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_specs(*)')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      // Ensure all fields are objects
      const sanitizedData = {
        ...data,
        title: typeof data.title === 'string' ? { es: data.title, en: '' } : data.title || { es: '', en: '' },
        subtitle: typeof data.subtitle === 'string' ? { es: data.subtitle, en: '' } : data.subtitle || { es: '', en: '' },
        description: typeof data.description === 'string' ? { es: data.description, en: '' } : data.description || { es: '', en: '' },
        workbench: typeof data.workbench === 'string' ? { es: data.workbench, en: '' } : data.workbench || { es: '', en: '' },
        software: typeof data.software === 'string' ? { es: data.software, en: '' } : data.software || { es: '', en: '' },
        project_specs: data.project_specs?.map((s: any) => ({
          ...s,
          label: typeof s.label === 'string' ? { es: s.label, en: '' } : s.label || { es: '', en: '' },
          value: typeof s.value === 'string' ? { es: s.value, en: '' } : s.value || { es: '', en: '' }
        })) || []
      };

      setProject(sanitizedData);
    } catch (err: any) {
      toast.error('Error al cargar proyecto: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    const translatableFields = ['title', 'subtitle', 'description', 'workbench', 'software'];
    
    if (translatableFields.includes(name)) {
      setProject({
        ...project,
        [name]: {
          ...(project[name as keyof Project] as Translation),
          [editingLang]: value
        }
      });
    } else {
      setProject({ ...project, [name]: val });
    }
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...(project.project_specs || [])];
    const spec = { ...newSpecs[index] };
    spec[field] = { ...spec[field], [editingLang]: value };
    newSpecs[index] = spec;
    setProject({ ...project, project_specs: newSpecs });
  };

  const addSpec = () => {
    const newSpecs = [...(project.project_specs || [])];
    newSpecs.push({ 
      label: { es: '', en: '' }, 
      value: { es: '', en: '' }, 
      sort_order: newSpecs.length 
    });
    setProject({ ...project, project_specs: newSpecs });
  };

  const removeSpec = (index: number) => {
    const newSpecs = [...(project.project_specs || [])];
    newSpecs.splice(index, 1);
    setProject({ ...project, project_specs: newSpecs });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('project-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('project-assets')
        .getPublicUrl(data.path);
      
      setProject({ ...project, [field]: publicUrl });
    } catch (err: any) {
      toast.error('Error al subir archivo: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectData = { 
        title: project.title,
        slug: project.slug,
        subtitle: project.subtitle,
        description: project.description,
        workbench: project.workbench,
        software: project.software,
        thumbnail_url: project.thumbnail_url,
        hero_image_url: project.hero_image_url,
        model_url: project.model_url,
        sort_order: project.sort_order,
        is_published: project.is_published
      };

      let pId = projectId;
      if (projectId === 'new') {
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
        if (error) throw error;
        pId = data.id;
      } else {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId);
        if (error) throw error;
      }

      // Handle Specs
      await supabase.from('project_specs').delete().eq('project_id', pId);
      if (project.project_specs?.length) {
        const specsToInsert = project.project_specs.map(s => ({
          label: s.label,
          value: s.value,
          sort_order: s.sort_order,
          project_id: pId
        }));
        const { error: specError } = await supabase.from('project_specs').insert(specsToInsert);
        if (specError) throw specError;
      }

      toast.success('Proyecto guardado correctamente');
      if (projectId === 'new') {
        window.location.href = `/${lang}/admin/projects/${pId}`;
      }
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const t = (field: Translation) => field[editingLang] || '';

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div className="flex flex-col gap-4">
          <a 
            href={`/${lang}/admin/dashboard`} 
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-label text-[10px] font-bold uppercase tracking-widest">Volver al Dashboard</span>
          </a>
          <div className="flex gap-2">
            <button 
              onClick={() => setEditingLang('es')}
              className={`px-4 py-1.5 font-label text-[10px] font-bold uppercase tracking-widest border transition-all ${editingLang === 'es' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-secondary border-outline-variant hover:border-primary'}`}
            >
              Español
            </button>
            <button 
              onClick={() => setEditingLang('en')}
              className={`px-4 py-1.5 font-label text-[10px] font-bold uppercase tracking-widest border transition-all ${editingLang === 'en' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-secondary border-outline-variant hover:border-primary'}`}
            >
              English
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 border border-outline-variant">
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary">Estado:</span>
            <select 
              name="is_published" 
              value={project.is_published ? 'true' : 'false'}
              onChange={(e) => setProject({...project, is_published: e.target.value === 'true'})}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-none text-primary"
            >
              <option value="false">Borrador</option>
              <option value="true">Publicado</option>
            </select>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-container text-on-primary px-8 py-3 flex items-center gap-3 transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="font-label text-xs font-bold uppercase tracking-widest">Guardar Proyecto</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-surface-container-low p-10 border border-outline-variant relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Globe className="w-24 h-24" />
            </div>
            
            <h4 className="font-headline font-bold uppercase tracking-tight mb-8 text-sm flex items-center gap-3">
              <span className="w-1 h-4 bg-primary"></span>
              Información Principal ({editingLang.toUpperCase()})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Título del Proyecto</label>
                <input 
                  type="text" 
                  name="title" 
                  value={t(project.title)} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border-b border-outline px-4 py-3 outline-none focus:border-primary font-headline font-bold text-lg"
                  placeholder={`E.g. F1 Helmet Design (${editingLang})`}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Slug (URL - Global)</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={project.slug} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border-b border-outline px-4 py-3 outline-none focus:border-primary font-body text-sm"
                  placeholder="f1-helmet-design"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Subtítulo / Lead</label>
                <input 
                  type="text" 
                  name="subtitle" 
                  value={t(project.subtitle)} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border-b border-outline px-4 py-3 outline-none focus:border-primary font-body text-sm"
                  placeholder="Advanced aerodynamics..."
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Descripción Detallada</label>
                <textarea 
                  name="description" 
                  value={t(project.description)} 
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full bg-surface-container-lowest border border-outline-variant p-4 outline-none focus:border-primary font-body text-sm resize-none"
                  placeholder="Describe the technical challenges..."
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-10 border border-outline-variant">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-headline font-bold uppercase tracking-tight text-sm flex items-center gap-3">
                <span className="w-1 h-4 bg-tertiary"></span>
                Especificaciones Técnicas ({editingLang.toUpperCase()})
              </h4>
              <button 
                onClick={addSpec}
                className="text-[10px] font-label font-bold text-tertiary uppercase tracking-widest hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir Fila
              </button>
            </div>

            <div className="space-y-4">
              {project.project_specs?.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-left-2">
                  <div className="md:col-span-4">
                    <label className="block text-[8px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Etiqueta</label>
                    <input 
                      type="text" 
                      value={t(spec.label)}
                      onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                      className="w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus:border-tertiary font-label text-[11px] uppercase tracking-wider"
                      placeholder="MATERIAL"
                    />
                  </div>
                  <div className="md:col-span-7">
                    <label className="block text-[8px] font-bold text-secondary uppercase tracking-[0.2em] mb-1">Valor</label>
                    <input 
                      type="text" 
                      value={t(spec.value)}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      className="w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus:border-tertiary font-body text-sm"
                      placeholder="Titanium Grade 5"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button 
                      onClick={() => removeSpec(index)}
                      className="p-2 text-outline hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {!project.project_specs?.length && (
                <p className="text-center py-8 text-[10px] font-label text-secondary uppercase tracking-widest border border-dashed border-outline-variant">
                  No hay especificaciones definidas
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Assets */}
        <div className="space-y-12">
          <section className="bg-surface-container-low p-8 border border-outline-variant">
            <h4 className="font-headline font-bold uppercase tracking-tight mb-8 text-sm">Hardware & Software</h4>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Entorno / Workbench</label>
                <input 
                  type="text" 
                  name="workbench" 
                  value={t(project.workbench)} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border-b border-outline px-4 py-2 outline-none focus:border-primary font-label text-[11px] uppercase"
                  placeholder="PART DESIGN"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Software Principal</label>
                <input 
                  type="text" 
                  name="software" 
                  value={t(project.software)} 
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-lowest border-b border-outline px-4 py-2 outline-none focus:border-primary font-label text-[11px] uppercase"
                  placeholder="CATIA V5"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-low p-8 border border-outline-variant">
            <h4 className="font-headline font-bold uppercase tracking-tight mb-8 text-sm">Visual Assets</h4>
            <div className="space-y-8">
              {/* Thumbnail */}
              <div className="space-y-3">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Miniatura (Grid)</label>
                <div className="aspect-video bg-surface-container-lowest border border-outline-variant relative group overflow-hidden flex items-center justify-center">
                  {project.thumbnail_url ? (
                    <>
                      <img src={project.thumbnail_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => setProject({...project, thumbnail_url: ''})} className="text-white">
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <ImageIcon className="w-8 h-8 text-outline-variant" />
                      <label className="cursor-pointer text-[10px] font-bold text-primary uppercase hover:underline">
                        Subir Imagen
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} />
                      </label>
                    </div>
                  )}
                  {uploadingField === 'thumbnail_url' && (
                    <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Hero */}
              <div className="space-y-3">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Imagen Hero (Banner)</label>
                <div className="aspect-[21/9] bg-surface-container-lowest border border-outline-variant relative group overflow-hidden flex items-center justify-center">
                  {project.hero_image_url ? (
                    <>
                      <img src={project.hero_image_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => setProject({...project, hero_image_url: ''})} className="text-white">
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <ImageIcon className="w-8 h-8 text-outline-variant" />
                      <label className="cursor-pointer text-[10px] font-bold text-primary uppercase hover:underline">
                        Subir Imagen
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'hero_image_url')} />
                      </label>
                    </div>
                  )}
                  {uploadingField === 'hero_image_url' && (
                    <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* 3D Model */}
              <div className="space-y-3">
                <label className="block text-[9px] font-bold text-secondary uppercase tracking-[0.2em]">Modelo 3D (.glb)</label>
                <div className="bg-surface-container-lowest border border-outline-variant p-4 flex items-center gap-4">
                  <Box className="w-6 h-6 text-tertiary" />
                  <div className="flex-1 overflow-hidden">
                    <input 
                      type="text" 
                      name="model_url" 
                      value={project.model_url || ''} 
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none outline-none font-label text-[10px] uppercase truncate"
                      placeholder="SIN MODELO 3D"
                    />
                  </div>
                  <label className="cursor-pointer p-2 hover:bg-surface-container transition-colors">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept=".glb,.gltf" onChange={(e) => handleFileUpload(e, 'model_url')} />
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
