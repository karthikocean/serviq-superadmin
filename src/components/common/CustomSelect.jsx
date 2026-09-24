import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X } from 'lucide-react';

/**
 * Reusable custom React dropdown component supporting both single-select and multi-select.
 * Works seamlessly with `options` array, `<option>` children, and both direct value or event onChange handlers.
 * Renders popup via createPortal to prevent any clipping from overflow:hidden/auto parent containers.
 */
export default function CustomSelect({
  options = [],
  children,
  value,
  onChange,
  isMulti = false,
  placeholder = 'Select...',
  disabled = false,
  error = null,
  name = '',
  style = {},
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Parse options from either `options` prop or `<option>` children
  let parsedOptions = Array.isArray(options) && options.length > 0 ? options : [];
  if (parsedOptions.length === 0 && children) {
    parsedOptions = React.Children.toArray(children)
      .filter(child => React.isValidElement(child))
      .map(child => {
        const val = child.props.value !== undefined ? child.props.value : child.props.children;
        const lbl = child.props.children !== undefined ? child.props.children : val;
        return {
          value: val,
          label: lbl,
          disabled: child.props.disabled
        };
      });
  }

  // Calculate position and handle boundary / collision detection with the viewport
  const updatePosition = () => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const count = parsedOptions.length || 5;
    const estimatedHeight = Math.min(count * 38 + 12, 230);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpwards = spaceBelow < estimatedHeight + 10 && spaceAbove > spaceBelow;

    let left = rect.left;
    const menuWidth = Math.max(rect.width, 120);
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }
    if (left < 10) left = 10;

    const top = openUpwards
      ? Math.max(10, rect.top - estimatedHeight - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - estimatedHeight - 10);

    setCoords({
      top,
      left,
      width: rect.width
    });
  };

  // Close dropdown when clicking outside and recalculate position on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('pointerdown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen, parsedOptions.length]);

  const handleSelect = (optionValue) => {
    if (disabled) return;

    if (isMulti) {
      let newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== optionValue);
      } else {
        newValue.push(optionValue);
      }
      triggerChange(newValue);
    } else {
      triggerChange(optionValue);
      setIsOpen(false);
    }
  };

  const triggerChange = (selectedVal) => {
    if (typeof onChange === 'function') {
      const rawVal = (typeof selectedVal === 'object' && selectedVal !== null && 'target' in selectedVal) ? selectedVal.target.value : selectedVal;
      const syntheticEvent = {
        target: { name: name || 'select', value: rawVal },
        currentTarget: { name: name || 'select', value: rawVal },
        value: rawVal
      };
      onChange(syntheticEvent, rawVal);
    }
  };

  const removePill = (e, optionValue) => {
    e.stopPropagation();
    if (disabled) return;
    if (isMulti && Array.isArray(value)) {
      const newValue = value.filter((v) => v !== optionValue);
      triggerChange(newValue);
    }
  };

  const getOptionLabel = (optVal) => {
    const found = parsedOptions.find(o => {
      const v = typeof o === 'object' && o !== null ? o.value : o;
      return String(v) === String(optVal);
    });
    if (!found) return optVal;
    return typeof found === 'object' && found !== null ? found.label : found;
  };

  const renderSelected = () => {
    if (isMulti) {
      const selectedArray = Array.isArray(value) ? value : [];
      if (selectedArray.length === 0) {
        return <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem' }}>{placeholder}</span>;
      }
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {selectedArray.map((val) => {
            const optionLabel = getOptionLabel(val);
            return (
              <span
                key={val}
                style={{
                  background: 'rgba(249, 94, 16, 0.1)',
                  color: '#F95E10',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {optionLabel}
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removePill(e, val)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      color: '#F95E10',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      );
    } else {
      if (value === undefined || value === null || value === '') {
        return <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem' }}>{placeholder}</span>;
      }
      const optionLabel = getOptionLabel(value);
      return <span style={{ color: 'var(--text-main, #0f172a)', fontSize: '0.82rem', fontWeight: '600' }}>{optionLabel}</span>;
    }
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', userSelect: 'none', ...style }}
      ref={dropdownRef}
    >
      <div
        onClick={() => {
          if (!disabled) {
            updatePosition();
            setIsOpen(!isOpen);
          }
        }}
        style={{
          padding: '9px 12px',
          borderRadius: '8px',
          border: `1.5px solid ${error ? '#ef4444' : isOpen ? '#F95E10' : 'var(--border-color, #cbd5e1)'}`,
          background: error ? 'rgba(239,68,68,0.04)' : disabled ? 'var(--bg-app, #f8fafc)' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '38px',
          boxSizing: 'border-box',
          opacity: disabled ? 0.65 : 1,
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(249, 94, 16, 0.12)' : 'none'
        }}
      >
        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {renderSelected()}
        </div>
        <ChevronDown
          size={15}
          style={{
            color: 'var(--text-muted, #94a3b8)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            marginLeft: '8px',
            flexShrink: 0
          }}
        />
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="animate-fade-in custom-select-invisible-menu"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
            minWidth: '140px',
            background: '#ffffff',
            border: '1px solid var(--border-color, #cbd5e1)',
            borderRadius: '10px',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 6px 12px -2px rgba(0, 0, 0, 0.08)',
            zIndex: 9999999,
            padding: '4px 0',
            maxHeight: '230px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            .custom-select-invisible-menu::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
          `}</style>
          {parsedOptions.length === 0 ? (
            <div style={{ padding: '10px 16px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem', textAlign: 'center' }}>
              No options available
            </div>
          ) : (
            parsedOptions.map((opt, index) => {
              const optValue = typeof opt === 'object' && opt !== null ? opt.value : opt;
              const optLabel = typeof opt === 'object' && opt !== null ? opt.label : opt;
              const isOptDisabled = typeof opt === 'object' && opt !== null ? opt.disabled : false;

              let isSelected = false;
              if (isMulti) {
                isSelected = Array.isArray(value) && value.some(v => String(v) === String(optValue));
              } else {
                isSelected = String(value) === String(optValue);
              }

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (!isOptDisabled) handleSelect(optValue);
                  }}
                  style={{
                    padding: '8px 14px',
                    cursor: isOptDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.82rem',
                    color: isOptDisabled ? 'var(--text-muted, #94a3b8)' : isSelected ? '#F95E10' : 'var(--text-main, #0f172a)',
                    background: isSelected && !isMulti ? 'rgba(249, 94, 16, 0.08)' : 'transparent',
                    fontWeight: isSelected ? '700' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    opacity: isOptDisabled ? 0.5 : 1,
                    transition: 'background 0.12s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isOptDisabled && !(isSelected && !isMulti)) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isOptDisabled && !(isSelected && !isMulti)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isMulti && (
                      <div
                        style={{
                          width: '15px',
                          height: '15px',
                          border: `1.5px solid ${isSelected ? '#F95E10' : 'var(--border-color, #cbd5e1)'}`,
                          borderRadius: '4px',
                          background: isSelected ? '#F95E10' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={11} />}
                      </div>
                    )}
                    <span>{optLabel}</span>
                  </div>
                  {isSelected && !isMulti && (
                    <Check size={14} style={{ color: '#F95E10', flexShrink: 0 }} />
                  )}
                </div>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * Reusable ValidatedSelect with label, error indicator, and custom React dropdown UI.
 */
export function ValidatedSelect({
  label,
  value,
  onChange,
  required = false,
  error = null,
  setError = null,
  children,
  options = [],
  placeholder = 'Select...',
  name = '',
  style = {},
  disabled = false,
  ...rest
}) {
  const handleChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
    if (error && typeof setError === 'function') {
      
      setError('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', ...style }}>
      {label && (
        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main, #0f172a)' }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <CustomSelect
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        name={name}
        {...rest}
      >
        {children}
      </CustomSelect>
      {error && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '600' }}>{error}</span>}
    </div>
  );
}
