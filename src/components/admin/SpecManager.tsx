import React, { useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
import { Plus, Trash2, Edit2, Save, X, ChevronRight, Settings2 } from 'lucide-react';

interface Translation {
  es: string;
  en: string;
}

interface SpecLabel {
  id: string;
  name: Translation;
  created_at: string;
}

interface SpecOption {
  id: string;
  label_id: string;
  value: Translation;
  created_at: string;
}

interface SpecManagerProps {
  lang?: string;
}

export const SpecManager: React.FC<SpecManagerProps> = ({ lang = 'es' }) => {
  const [labels, setLabels] = useState<SpecLabel[]>([]);
  const [options, setOptions] = useState<SpecOption[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingLabel, setEditingLabel] = useState<SpecLabel | null>(null);
  const [editingOption, setEditingOption] = useState<SpecOption | null>(null);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isAddingOption, setIsAddingOption] = useState(false);

  const [newLabel, setNewLabel] = useState<Translation>({ es: '', en: '' });
  const [newOption, setNewOption] = useState<Translation>({ es: '', en: '' });

  const currentLang = lang as 'es' | 'en';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: labelsData } = await supabase.from('spec_labels').select('*').order('created_at', { ascending: true });
      const { data: optionsData } = await supabase.from('spec_options').select('*').order('created_at', { ascending: true });
      
      setLabels(labelsData || []);
      setOptions(optionsData || []);
      
      if (labelsData?.length && !selectedLabelId) {
        setSelectedLabelId(labelsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async () => {
    if (!newLabel.es) return;
    try {
      const { data, error } = await supabase.from('spec_labels').insert([{ name: newLabel }]).select();
      if (error) throw error;
      setLabels([...labels, data[0]]);
      setNewLabel({ es: '', en: '' });
      setIsAddingLabel(false);
      setSelectedLabelId(data[0].id);
    } catch (error) {
      console.error('Error adding label:', error);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel) return;
    try {
      const { error } = await supabase.from('spec_labels').update({ name: editingLabel.name }).eq('id', editingLabel.id);
      if (error) throw error;
      setLabels(labels.map(l => l.id === editingLabel.id ? editingLabel : l));
      setEditingLabel(null);
    } catch (error) {
      console.error('Error updating label:', error);
    }
  };

  const handleDeleteLabel = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Se eliminarán todas sus especificaciones asociadas.')) return;
    try {
      const { error } = await supabase.from('spec_labels').delete().eq('id', id);
      if (error) throw error;
      setLabels(labels.filter(l => l.id !== id));
      setOptions(options.filter(o => o.label_id !== id));
      if (selectedLabelId === id) {
        setSelectedLabelId(labels.find(l => l.id !== id)?.id || null);
      }
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  const handleAddOption = async () => {
    if (!selectedLabelId || !newOption.es) return;
    try {
      const { data, error } = await supabase.from('spec_options').insert([{ label_id: selectedLabelId, value: newOption }]).select();
      if (error) throw error;
      setOptions([...options, data[0]]);
      setNewOption({ es: '', en: '' });
      setIsAddingOption(false);
    } catch (error) {
      console.error('Error adding option:', error);
    }
  };

  const handleUpdateOption = async () => {
    if (!editingOption) return;
    try {
      const { error } = await supabase.from('spec_options').update({ value: editingOption.value }).eq('id', editingOption.id);
      if (error) throw error;
      setOptions(options.map(o => o.id === editingOption.id ? editingOption : o));
      setEditingOption(null);
    } catch (error) {
      console.error('Error updating option:', error);
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta especificación?')) return;
    try {
      const { error } = await supabase.from('spec_options').delete().eq('id', id);
      if (error) throw error;
      setOptions(options.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting option:', error);
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 font-label text-[10px] uppercase tracking-widest text-secondary">Cargando Sistema de Especificaciones...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Left Column: Labels (Categories) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-surface-container-low p-6 border-l-4 border-primary flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold uppercase tracking-tight text-lg">Categorías</h3>
            <p className="text-[10px] font-label text-secondary uppercase tracking-widest mt-1">Gestión de Etiquetas</p>
          </div>
          <button 
            onClick={() => setIsAddingLabel(true)}
            className="p-2 bg-primary text-on-primary hover:bg-primary-container transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant divide-y divide-outline-variant">
          {isAddingLabel && (
            <div className="p-4 bg-surface-container-high space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-secondary uppercase tracking-widest">Nombre (ES)</label>
                  <input 
                    type="text" 
                    value={newLabel.es}
                    onChange={(e) => setNewLabel({...newLabel, es: e.target.value})}
                    className="w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus:border-tertiary font-body text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-secondary uppercase tracking-widest">Nombre (EN)</label>
                  <input 
                    type="text" 
                    value={newLabel.en}
                    onChange={(e) => setNewLabel({...newLabel, en: e.target.value})}
                    className="w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus:border-tertiary font-body text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingLabel(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-on-surface">Cancelar</button>
                <button onClick={handleAddLabel} className="bg-primary text-on-primary px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container">Guardar</button>
              </div>
            </div>
          )}

          {labels.map(label => (
            <div 
              key={label.id}
              className={`p-4 flex items-center justify-between group transition-colors ${selectedLabelId === label.id ? 'bg-primary/5' : 'hover:bg-surface-container/50'}`}
            >
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => setSelectedLabelId(label.id)}
              >
                {editingLabel?.id === label.id ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editingLabel.name.es}
                      onChange={(e) => setEditingLabel({...editingLabel, name: {...editingLabel.name, es: e.target.value}})}
                      className="bg-surface-container-lowest border-b border-primary px-2 py-1 text-sm outline-none w-full"
                    />
                    <input 
                      type="text" 
                      value={editingLabel.name.en}
                      onChange={(e) => setEditingLabel({...editingLabel, name: {...editingLabel.name, en: e.target.value}})}
                      className="bg-surface-container-lowest border-b border-primary px-2 py-1 text-sm outline-none w-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-4 ${selectedLabelId === label.id ? 'bg-primary' : 'bg-transparent'}`}></div>
                    <div>
                      <span className="font-headline font-bold uppercase tracking-tight text-sm">{label.name[currentLang]}</span>
                      <span className="ml-2 text-[9px] font-label text-outline uppercase tracking-widest opacity-50">
                        {label.name[currentLang === 'es' ? 'en' : 'es']}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {editingLabel?.id === label.id ? (
                  <>
                    <button onClick={handleUpdateLabel} className="p-2 text-tertiary hover:bg-tertiary/10"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingLabel(null)} className="p-2 text-secondary hover:bg-secondary/10"><X className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingLabel(label)} className="p-2 text-outline hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteLabel(label.id)} className="p-2 text-outline hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    <ChevronRight className={`w-4 h-4 text-outline ${selectedLabelId === label.id ? 'opacity-100' : 'opacity-0'}`} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Options (Specifications) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-surface-container-low p-6 border-l-4 border-tertiary flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold uppercase tracking-tight text-lg">
              {selectedLabelId ? labels.find(l => l.id === selectedLabelId)?.name[currentLang] : 'Especificaciones'}
            </h3>
            <p className="text-[10px] font-label text-secondary uppercase tracking-widest mt-1">Valores Disponibles</p>
          </div>
          <button 
            onClick={() => setIsAddingOption(true)}
            disabled={!selectedLabelId}
            className="p-2 bg-tertiary text-on-tertiary hover:bg-tertiary/90 transition-all disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant">
          {isAddingOption && (
            <div className="p-6 bg-surface-container-high border-b border-outline-variant space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-secondary uppercase tracking-widest">Valor (ES)</label>
                  <input 
                    type="text" 
                    value={newOption.es}
                    onChange={(e) => setNewOption({...newOption, es: e.target.value})}
                    className="w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus:border-tertiary font-body text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-secondary uppercase tracking-widest">Valor (EN)</label>
                  <input 
                    type="text" 
                    value={newOption.en}
                    onChange={(e) => setNewOption({...newOption, en: e.target.value})}
                    className="w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus:border-tertiary font-body text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddingOption(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-on-surface">Cancelar</button>
                <button onClick={handleAddOption} className="bg-tertiary text-on-tertiary px-6 py-2 text-[10px] font-bold uppercase tracking-widest">Guardar</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-outline-variant">
            {options.filter(o => o.label_id === selectedLabelId).map(option => (
              <div key={option.id} className="p-4 flex items-center justify-between hover:bg-surface-container/30 group transition-colors">
                <div className="flex-1">
                  {editingOption?.id === option.id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editingOption.value.es}
                        onChange={(e) => setEditingOption({...editingOption, value: {...editingOption.value, es: e.target.value}})}
                        className="bg-surface-container-lowest border-b border-tertiary px-2 py-1 text-sm outline-none w-full"
                      />
                      <input 
                        type="text" 
                        value={editingOption.value.en}
                        onChange={(e) => setEditingOption({...editingOption, value: {...editingOption.value, en: e.target.value}})}
                        className="bg-surface-container-lowest border-b border-tertiary px-2 py-1 text-sm outline-none w-full"
                      />
                    </div>
                  ) : (
                    <div>
                      <span className="font-body text-sm">{option.value[currentLang]}</span>
                      <span className="ml-2 text-[10px] font-label text-outline uppercase tracking-widest opacity-50">
                        / {option.value[currentLang === 'es' ? 'en' : 'es']}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingOption?.id === option.id ? (
                    <>
                      <button onClick={handleUpdateOption} className="p-2 text-tertiary hover:bg-tertiary/10"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingOption(null)} className="p-2 text-secondary hover:bg-secondary/10"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingOption(option)} className="p-2 text-outline hover:text-tertiary transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteOption(option.id)} className="p-2 text-outline hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {!options.filter(o => o.label_id === selectedLabelId).length && (
              <div className="p-12 text-center">
                <p className="text-[10px] font-label text-secondary uppercase tracking-[0.2em]">No hay especificaciones para esta categoría</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
