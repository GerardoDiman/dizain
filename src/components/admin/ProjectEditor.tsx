import React, { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { Save, Trash2, Plus, Upload, X, Loader2, ChevronLeft, Image as ImageIcon, Box, Globe, Eye, Maximize2, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@lib/toast';
import Select from './ui/Select';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Estado para archivos que están pendientes de subirse
  const [pendingFiles, setPendingFiles] = useState<{
    thumbnail?: File;
    hero?: File;
    model?: File;
    gallery: { file: File; preview: string; id: string }[];
  }>({
    gallery: []
  });

  // URLs que deben ser eliminadas del bucket al guardar con éxito
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);

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
        .select('*, project_specs(*), project_images(*)')
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
        })) || [],
        project_images: data.project_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!project.slug) {
      toast.error('Define un Slug antes de añadir archivos para organizar la carpeta');
      return;
    }

    if (field === 'gallery') {
      const newPendingGallery = [...pendingFiles.gallery];
      const newProjectImages = [...(project.project_images || [])];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const preview = URL.createObjectURL(file);
        const tempId = `temp-${Date.now()}-${i}`;
        
        newPendingGallery.push({ file, preview, id: tempId });
        newProjectImages.push({
          image_url: preview, // Usamos la preview temporal para mostrarla ya
          alt_text: project.title.es || 'Project Image',
          sort_order: newProjectImages.length,
          id: tempId // Guardamos el ID temporal para identificarlo al guardar
        } as any);
      }
      
      setPendingFiles({ ...pendingFiles, gallery: newPendingGallery });
      setProject({ ...project, project_images: newProjectImages });
    } else {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      
      // Si ya había una imagen guardada en este campo, marcarla para borrar
      const oldUrl = project[field as keyof typeof project] as string;
      if (oldUrl && !oldUrl.startsWith('blob:')) {
        setUrlsToDelete(prev => [...prev, oldUrl]);
      }

      setPendingFiles({ ...pendingFiles, [field.replace('_url', '')]: file });
      setProject({ ...project, [field]: preview });
    }
    
    // Limpiar el input para permitir subir el mismo archivo si se borra
    e.target.value = '';
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const cleanSlug = folder.trim().replace(/^\/+|\/+$/g, '').replace(/\s+/g, '-');
    const filePath = `${cleanSlug}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('project-assets')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('project-assets')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const moveGalleryImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...(project.project_images || [])];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    
    // Swap
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    
    // Refresh all sort_orders based on new position
    const reordered = newImages.map((img, i) => ({
      ...img,
      sort_order: i
    }));
    
    setProject({ ...project, project_images: reordered });
  };

  const removeGalleryImage = (index: number) => {
    const img = project.project_images?.[index];
    const newImages = [...(project.project_images || [])];
    newImages.splice(index, 1);
    
    if (img) {
      // Si era una imagen ya guardada en el servidor (no temporal), marcar para borrar
      if (img.image_url && !img.image_url.startsWith('blob:')) {
        setUrlsToDelete(prev => [...prev, img.image_url]);
      }
      
      // Si era una imagen pendiente de subir, quitarla de pendingFiles
      if (img.id?.startsWith('temp-')) {
        const newPendingGallery = pendingFiles.gallery.filter(p => p.id !== img.id);
        setPendingFiles({ ...pendingFiles, gallery: newPendingGallery });
      }
    }
    
    setProject({ ...project, project_images: newImages });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Subir archivos pendientes
      let finalThumbnail = project.thumbnail_url;
      let finalHero = project.hero_image_url;
      let finalModel = project.model_url;
      
      if (pendingFiles.thumbnail) {
        setUploadingField('thumbnail_url');
        finalThumbnail = await uploadFile(pendingFiles.thumbnail, project.slug);
      }
      if (pendingFiles.hero) {
        setUploadingField('hero_image_url');
        finalHero = await uploadFile(pendingFiles.hero, project.slug);
      }
      if (pendingFiles.model) {
        setUploadingField('model_url');
        finalModel = await uploadFile(pendingFiles.model, project.slug);
      }

      const finalGalleryImages = [...(project.project_images || [])];
      for (let i = 0; i < finalGalleryImages.length; i++) {
        const img = finalGalleryImages[i];
        if (img.id?.startsWith('temp-')) {
          setUploadingField('gallery');
          const pending = pendingFiles.gallery.find(p => p.id === img.id);
          if (pending) {
            const uploadedUrl = await uploadFile(pending.file, project.slug);
            finalGalleryImages[i] = {
              ...img,
              image_url: uploadedUrl,
              id: undefined // Quitar ID temporal
            };
          }
        }
      }

      setUploadingField(null);

      const projectData = { 
        title: project.title,
        slug: project.slug,
        subtitle: project.subtitle,
        description: project.description,
        workbench: project.workbench,
        software: project.software,
        thumbnail_url: finalThumbnail,
        hero_image_url: finalHero,
        model_url: finalModel,
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

      // Handle Gallery Images
      await supabase.from('project_images').delete().eq('project_id', pId);
      if (finalGalleryImages.length) {
        const imagesToInsert = finalGalleryImages.map(img => ({
          image_url: img.image_url,
          alt_text: img.alt_text,
          caption: img.caption,
          sort_order: img.sort_order,
          project_id: pId
        }));
        const { error: imgError } = await supabase.from('project_images').insert(imagesToInsert);
        if (imgError) throw imgError;
      }
      
      // Limpiar archivos pendientes tras éxito
      setPendingFiles({ gallery: [] });

      // Actualizar el estado local con las URLs finales del servidor
      setProject({ 
        ...project, 
        thumbnail_url: finalThumbnail, 
        hero_image_url: finalHero, 
        model_url: finalModel, 
        project_images: finalGalleryImages 
      });

      // 4. Eliminar físicamente los archivos del bucket que fueron descartados
      if (urlsToDelete.length > 0) {
        try {
          const pathsToDelete = urlsToDelete.map(url => {
            // Decodificar la URL para manejar espacios y caracteres especiales
            const decodedUrl = decodeURIComponent(url);
            const parts = decodedUrl.split('/');
            
            // Buscar el nombre del bucket o la palabra 'objects' como punto de referencia
            let idx = parts.indexOf('project-assets');
            if (idx === -1) idx = parts.indexOf('objects');
            
            // La ruta real empieza justo después del nombre del bucket o de 'objects'
            const path = parts.slice(idx + 1).join('/');
            
            // Si el primer elemento del path resultante es 'objects', lo quitamos (caso InsForge)
            if (path.startsWith('objects/')) {
              return path.replace('objects/', '');
            }
            return path;
          }).filter(path => path.length > 0 && !path.startsWith('http'));

          if (pathsToDelete.length > 0) {
            const { error: deleteError } = await supabase.storage.from('project-assets').remove(pathsToDelete);
            if (deleteError) {
              console.error('Error al eliminar archivos del bucket:', deleteError);
            } else {
              console.log('Archivos eliminados del bucket:', pathsToDelete);
              toast.success(`${pathsToDelete.length} archivos antiguos eliminados del servidor`);
            }
          }
          setUrlsToDelete([]);
        } catch (storageErr) {
          console.error('Error crítico limpiando bucket:', storageErr);
        }
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
      {/* Top Action Bar - Sticky-ready or more compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 border-b border-outline-variant pb-8">
        <div className="flex items-center gap-6">
          <a 
            href={`/${lang}/admin/projects`} 
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em]">Volver a Proyectos</span>
          </a>
          <div className="w-px h-4 bg-outline-variant"></div>
          <div className="flex gap-1">
            <button 
              onClick={() => setEditingLang('es')}
              className={`px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest transition-all ${editingLang === 'es' ? 'text-primary underline underline-offset-4' : 'text-secondary hover:text-primary'}`}
            >
              ES
            </button>
            <button 
              onClick={() => setEditingLang('en')}
              className={`px-3 py-1 font-label text-[10px] font-bold uppercase tracking-widest transition-all ${editingLang === 'en' ? 'text-primary underline underline-offset-4' : 'text-secondary hover:text-primary'}`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {projectId !== 'new' && (
            <a 
              href={`/${lang}/projects/${project.slug}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold text-tertiary uppercase tracking-widest hover:underline bg-tertiary/5 px-4 py-2 border border-tertiary/20"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Vista Previa Pública
            </a>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-label font-bold uppercase tracking-[0.2em] text-secondary">Estado</span>
            <Select 
              value={project.is_published ? 'true' : 'false'}
              onChange={(val) => setProject({...project, is_published: val === 'true'})}
              options={[
                { value: 'false', label: 'BORRADOR' },
                { value: 'true', label: 'PUBLICADO' },
              ]}
              className="min-w-[130px]"
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-on-primary px-10 py-3.5 flex items-center gap-4 transition-all shadow-lg shadow-primary/20"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="font-label text-[11px] font-bold uppercase tracking-[0.2em]">Guardar Cambios</span>
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

      {/* Galería Full Width */}
      <section className="mt-12 bg-surface-container-low p-10 border border-outline-variant">
        <div className="flex items-center justify-between mb-8">
          <h4 className="font-headline font-bold uppercase tracking-tight text-sm flex items-center gap-3">
            <span className="w-1 h-4 bg-primary"></span>
            Galería de Imágenes del Proyecto
          </h4>
          <div className="flex gap-6">
            {project.project_images && project.project_images.length > 0 && (
              <button 
                onClick={() => setProject({ ...project, project_images: [] })}
                className="text-[10px] font-bold text-error uppercase hover:underline flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Limpiar Galería
              </button>
            )}
            <label className="cursor-pointer text-[10px] font-bold text-primary uppercase hover:underline flex items-center gap-2">
              <Plus className="w-3 h-3" /> Añadir Imágenes
              <input type="file" className="hidden" multiple onChange={(e) => handleFileUpload(e, 'gallery')} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {project.project_images?.map((img, index) => (
            <div key={`${img.image_url}-${index}`} className="aspect-square bg-surface-container-lowest border border-outline-variant relative group overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img src={img.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={() => setPreviewImage(img.image_url)}
                  className="bg-white text-primary p-2.5 hover:scale-110 transition-transform"
                  title="Vista previa completa"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => moveGalleryImage(index, 'left')}
                    disabled={index === 0}
                    className="bg-white/20 text-white p-1.5 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveGalleryImage(index, 'right')}
                    disabled={index === (project.project_images?.length || 0) - 1}
                    className="bg-white/20 text-white p-1.5 hover:bg-white/40 disabled:opacity-30 disabled:hover:bg-white/20 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => removeGalleryImage(index)}
                  className="bg-error text-white p-2.5 hover:scale-110 transition-transform"
                  title="Eliminar imagen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-surface/95 backdrop-blur-md border-t border-outline-variant translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <input 
                  type="text" 
                  value={img.alt_text}
                  onChange={(e) => {
                    const newImages = [...(project.project_images || [])];
                    newImages[index].alt_text = e.target.value;
                    setProject({ ...project, project_images: newImages });
                  }}
                  className="w-full bg-transparent border-none outline-none font-label text-[9px] uppercase tracking-widest text-secondary focus:text-primary transition-colors"
                  placeholder="DESCRIPCIÓN ALT"
                />
              </div>
            </div>
          ))}
          
          {uploadingField === 'gallery' && (
            <div className="aspect-square border border-outline-variant border-dashed flex flex-col items-center justify-center bg-surface-container-highest animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="font-label text-[8px] uppercase tracking-widest mt-2">Subiendo...</span>
            </div>
          )}

          {!project.project_images?.length && !uploadingField && (
            <div className="col-span-full py-20 border border-outline-variant border-dashed flex flex-col items-center justify-center opacity-40 bg-surface-container-lowest">
              <ImageIcon className="w-12 h-12 mb-4 text-outline" />
              <span className="font-label text-[10px] uppercase tracking-[0.3em]">No hay imágenes adicionales en la galería</span>
              <p className="text-[9px] mt-2 text-secondary">AÑADE IMÁGENES PARA MOSTRAR EL PROCESO TÉCNICO</p>
            </div>
          )}
        </div>
      </section>
      {/* Lightbox Preview */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-20 animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-10 right-10 text-white/40 hover:text-white transition-all hover:scale-110 z-10"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-10 h-10" />
          </button>
          
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-8" onClick={e => e.stopPropagation()}>
            <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
              <img 
                src={previewImage} 
                className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
                alt="Full Preview"
              />
            </div>
            
            <div className="shrink-0 flex flex-col items-center gap-3">
              <p className="font-headline text-white/60 text-[10px] uppercase tracking-[0.6em] font-bold">Detalle Técnico / Inspección Visual</p>
              <div className="w-12 h-px bg-primary"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
