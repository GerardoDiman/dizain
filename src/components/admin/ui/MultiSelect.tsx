import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

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
    <div className={`relative w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={containerRef}>
      <div 
        className="min-h-10 w-full bg-surface-container-lowest border-b border-outline px-3 py-2 outline-none focus-within:border-tertiary font-body text-sm flex items-center justify-between cursor-pointer flex-wrap gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {selectedOptions.length === 0 && (
            <span className="text-secondary">{placeholder}</span>
          )}
          {selectedOptions.map(opt => (
            <span 
              key={opt.id} 
              className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-sm flex items-center gap-1 font-label text-[10px] uppercase tracking-wider"
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
        <ChevronDown className="w-4 h-4 text-secondary flex-shrink-0" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-surface-container-highest border border-outline-variant shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-secondary text-sm italic">No hay opciones disponibles</div>
          ) : (
            options.map(opt => {
              const isSelected = selectedIds.includes(opt.id);
              return (
                <div 
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`px-3 py-2 flex items-center justify-between cursor-pointer text-sm transition-colors ${
                    isSelected ? 'bg-tertiary/10 text-tertiary font-bold' : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
