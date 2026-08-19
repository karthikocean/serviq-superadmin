import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

/**
 * A reusable custom select dropdown component with support for single and multi-select.
 *
 * @param {Object} props
 * @param {Array<string|Object>} props.options - Array of options. Can be strings or objects with { label, value }.
 * @param {string|Array<string>} props.value - Currently selected value(s).
 * @param {Function} props.onChange - Callback fired when selection changes. Passes the new value.
 * @param {boolean} [props.isMulti=false] - If true, enables multi-select with pills.
 * @param {string} [props.placeholder='Select...'] - Placeholder text.
 */
export default function CustomSelect({
  options = [],
  value,
  onChange,
  isMulti = false,
  placeholder = 'Select...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (isMulti) {
      let newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== optionValue);
      } else {
        newValue.push(optionValue);
      }
      onChange(newValue);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removePill = (e, optionValue) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  const renderSelected = () => {
    if (isMulti) {
      const selectedArray = Array.isArray(value) ? value : [];
      if (selectedArray.length === 0) {
        return <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>;
      }
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedArray.map((val) => {
            const optionLabel = typeof options[0] === 'object' 
              ? options.find(o => o.value === val)?.label || val
              : val;
              
            return (
              <span key={val} style={{
                background: 'rgba(249, 94, 16, 0.1)',
                color: '#F95E10',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {optionLabel}
                <button
                  type="button"
                  onClick={(e) => removePill(e, val)}
                  style={{
                    background: 'transparent', border: 'none', padding: 0,
                    color: '#F95E10', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      );
    } else {
      if (!value) return <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>;
      const optionLabel = typeof options[0] === 'object'
        ? options.find(o => o.value === value)?.label || value
        : value;
      return <span style={{ color: 'var(--text-main)' }}>{optionLabel}</span>;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 14px',
          borderRadius: '8px',
          border: `1px solid ${isOpen ? '#F95E10' : 'var(--border-color)'}`,
          background: 'var(--bg-app)',
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '42px',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(249, 94, 16, 0.1)' : 'none'
        }}
      >
        <div style={{ flex: 1 }}>{renderSelected()}</div>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }} 
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 50,
          padding: '8px 0',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {options.length === 0 ? (
            <div style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            options.map((opt, index) => {
              const optValue = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              
              let isSelected = false;
              if (isMulti) {
                isSelected = Array.isArray(value) && value.includes(optValue);
              } else {
                isSelected = value === optValue;
              }

              return (
                <div
                  key={index}
                  onClick={() => handleSelect(optValue)}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: isSelected ? (isMulti ? 'var(--text-main)' : '#F95E10') : 'var(--text-main)',
                    background: isSelected && !isMulti ? 'rgba(249, 94, 16, 0.05)' : 'transparent',
                    fontWeight: isSelected && !isMulti ? '700' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!(isSelected && !isMulti)) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!(isSelected && !isMulti)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {isMulti && (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: `1px solid ${isSelected ? '#F95E10' : 'var(--border-color)'}`,
                      borderRadius: '4px',
                      background: isSelected ? '#F95E10' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      {isSelected && <Check size={12} />}
                    </div>
                  )}
                  {optLabel}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
