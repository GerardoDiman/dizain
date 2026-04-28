import React, { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { Plus, Trash2, Save, Loader2, Cpu, Hash } from 'lucide-react';
import { toast } from '@lib/toast';
import Select from './ui/Select';

type Translation = Record<string, string>;

interface Skill {
  id?: string;
  category: string;
  label: Translation;
  sort_order: number;
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (data) {
      const sanitizedData = data.map((s: any) => ({
        ...s,
        label: typeof s.label === 'string' ? { es: s.label, en: '' } : s.label || { es: '', en: '' }
      }));
      setSkills(sanitizedData);
    }
    setIsLoading(false);
  };

  const addSkill = () => {
    setSkills([...skills, { 
      category: 'software', 
      label: { es: '', en: '' }, 
      sort_order: skills.length 
    }]);
  };

  const updateSkill = (index: number, field: string, value: any, lang?: string) => {
    const newSkills = [...skills];
    if (field === 'label' && lang) {
      newSkills[index] = { 
        ...newSkills[index], 
        label: { ...newSkills[index].label, [lang]: value } 
      };
    } else {
      newSkills[index] = { ...newSkills[index], [field as keyof Skill]: value };
    }
    setSkills(newSkills);
  };

  const removeSkill = (index: number) => {
    const newSkills = [...skills];
    newSkills.splice(index, 1);
    setSkills(newSkills);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simplification: Delete all and re-insert
      const { error: deleteError } = await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) throw deleteError;

      const skillsToInsert = skills.map(s => ({
        category: s.category,
        label: s.label,
        sort_order: s.sort_order
      }));

      if (skillsToInsert.length > 0) {
        const { error: insertError } = await supabase.from('skills').insert(skillsToInsert);
        if (insertError) throw insertError;
      }

      toast.success('Habilidades guardadas correctamente');
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h3 className="font-headline font-bold uppercase tracking-tight flex items-center gap-3">
          <Cpu className="w-5 h-5 text-primary" />
          Habilidades Técnicas
        </h3>
        <div className="flex items-center gap-4">
          <button onClick={addSkill} className="text-[10px] font-label font-bold text-tertiary uppercase tracking-widest hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Añadir Habilidad
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2 flex items-center gap-2 transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="font-label text-[10px] font-bold uppercase tracking-widest">Guardar Cambios</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low border border-outline-variant overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container border-b border-outline">
              <th className="px-6 py-5 font-label text-[10px] font-bold text-secondary uppercase tracking-[0.2em] w-1/4">Categoría</th>
              <th className="px-6 py-5 font-label text-[10px] font-bold text-secondary uppercase tracking-[0.2em] w-[30%]">Etiqueta (ES)</th>
              <th className="px-6 py-5 font-label text-[10px] font-bold text-secondary uppercase tracking-[0.2em] w-[30%]">Etiqueta (EN)</th>
              <th className="px-6 py-5 font-label text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Orden</th>
              <th className="px-6 py-5 font-label text-[10px] font-bold text-secondary uppercase tracking-[0.2em] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill, index) => (
              <tr key={index} className="border-b border-outline-variant hover:bg-surface-container/30 transition-colors">
                <td className="px-6 py-4 min-w-[160px]">
                  <Select 
                    value={skill.category}
                    onChange={(val) => updateSkill(index, 'category', val)}
                    options={[
                      { value: 'software', label: 'Software' },
                      { value: 'education', label: 'Educación' },
                      { value: 'languages', label: 'Idiomas' },
                      { value: 'design', label: 'Diseño' },
                    ]}
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    value={skill.label.es}
                    onChange={(e) => updateSkill(index, 'label', e.target.value, 'es')}
                    className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-body text-sm w-full"
                    placeholder="E.g. SolidWorks"
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    value={skill.label.en}
                    onChange={(e) => updateSkill(index, 'label', e.target.value, 'en')}
                    className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-body text-sm w-full"
                    placeholder="E.g. SolidWorks"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-outline" />
                    <input 
                      type="number" 
                      value={skill.sort_order}
                      onChange={(e) => updateSkill(index, 'sort_order', parseInt(e.target.value))}
                      className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-body text-sm w-12 text-center"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => removeSkill(index)} className="p-2 text-outline hover:text-error transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
