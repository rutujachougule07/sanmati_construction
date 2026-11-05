import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X, Check, Search } from 'lucide-react';

export const EditableSelect = ({
  options = [],
  value = '',
  onChange,
  onAddOption,
  onRemoveOption,
  placeholder = 'Select option...',
  required = false,
  error = '',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown and reset input state when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsAddingCustom(false);
      setNewOption('');
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    const trimmed = newOption.trim();
    if (!trimmed) return;

    if (onAddOption) {
      onAddOption(trimmed);
    }
    if (onChange) {
      onChange(trimmed);
    }
    setNewOption('');
    setSearchTerm('');
    setIsAddingCustom(false);
  };

  const handleRemove = (e, opt) => {
    e.stopPropagation();
    if (onRemoveOption) {
      onRemoveOption(opt);
    }
    if (value === opt && onChange) {
      onChange('');
    }
  };

  const filteredOptions = options.filter(opt =>
    String(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${isOpen ? 'z-30' : 'z-0'} ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm('');
            setIsAddingCustom(false);
          }
        }}
        className={`erp-input w-full flex items-center justify-between text-left cursor-pointer transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : ''
        } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
      >
        <span className={`truncate text-xs ${value ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-1.5 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-red-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[220px]">
          {/* Search Filter (if > 5 items) */}
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter options..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      if (onChange) onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-red-50 text-red-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{opt}</span>
                    </div>

                    {/* Remove Sign Button */}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, opt)}
                      title={`Remove "${opt}"`}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-center text-xs text-slate-400 italic">
                {searchTerm ? 'No matching options' : 'No options in list'}
              </div>
            )}
          </div>

          {/* Bottom Section: Clickable "+ Add Other / Custom Option" button or Input Box */}
          {!isAddingCustom ? (
            <div className="p-1 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddingCustom(true);
                  if (searchTerm) setNewOption(searchTerm);
                  setTimeout(() => inputRef.current?.focus(), 60);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-lg transition-colors cursor-pointer group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>+ Add Other / Custom</span>
              </button>
            </div>
          ) : (
            <div className="p-2 border-t border-slate-200 bg-slate-50" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsAddingCustom(false);
                      setNewOption('');
                    }
                  }}
                  placeholder="Enter custom option..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-800"
                  autoFocus
                />
                {/* Done (Check) Confirmation Button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newOption.trim()}
                  title="Done / Confirm Add"
                  className="w-7 h-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer flex-shrink-0 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                </button>
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCustom(false);
                    setNewOption('');
                  }}
                  title="Cancel"
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
