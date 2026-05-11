import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOption = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));

  return (
    <div className={`relative w-full flex flex-col gap-1 ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <div 
        className={`w-full min-h-[41px] flex items-center justify-between bg-surface-container-high border-b ${isOpen ? 'border-primary' : 'border-outline'} px-4 py-2 outline-none transition-all hover:bg-surface-container-highest group cursor-pointer flex-wrap gap-2`}
        style={{ borderRadius: '0px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedOptions.length === 0 && (
            <span className="font-label text-[11px] uppercase tracking-wider text-secondary font-bold truncate">
              {placeholder}
            </span>
          )}
          {selectedOptions.map(opt => (
            <span 
              key={opt.id} 
              className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm flex items-center gap-1 font-label text-[10px] uppercase tracking-wider font-bold"
            >
              {opt.label}
              <button 
                onClick={(e) => removeOption(e, opt.id)}
                className="hover:text-error transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown 
          size={14} 
          className={`text-outline transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`} 
          strokeWidth={3} 
        />
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-[100] bg-white border border-outline-variant shadow-2xl mt-px overflow-y-auto max-h-60"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex flex-col">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-secondary text-[10px] uppercase tracking-widest font-label italic">No hay opciones disponibles</div>
              ) : (
                options.map(opt => {
                  const isSelected = selectedIds.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={(e) => { e.stopPropagation(); toggleOption(opt.id); }}
                      className={`w-full text-left px-4 py-3 font-label text-[10px] uppercase tracking-widest transition-colors flex items-center justify-between ${
                        isSelected 
                          ? 'bg-primary/10 text-primary font-bold' 
                          : 'text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
