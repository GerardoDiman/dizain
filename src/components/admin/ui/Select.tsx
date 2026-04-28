import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
}

export default function Select({ value, onChange, options, label, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col gap-1 ${className}`} ref={containerRef}>
      {label && (
        <label className="font-label text-[9px] uppercase tracking-[0.2em] text-secondary font-bold mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-surface-container-high border-b ${isOpen ? 'border-primary' : 'border-outline'} px-4 py-2.5 outline-none transition-all hover:bg-surface-container-highest group`}
          style={{ borderRadius: '0px' }}
        >
          <span className="font-label text-[11px] uppercase tracking-wider text-primary font-bold truncate pr-4">
            {selectedOption?.label}
          </span>
          <ChevronDown 
            size={14} 
            className={`text-outline transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`} 
            strokeWidth={3} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-[100] bg-white border border-outline-variant shadow-2xl mt-px overflow-hidden"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex flex-col">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 font-label text-[10px] uppercase tracking-widest transition-colors ${
                      value === opt.value 
                        ? 'bg-primary text-on-primary' 
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
