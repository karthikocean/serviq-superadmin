import React from 'react';
import { Search } from 'lucide-react';
import CustomSelect from './CustomSelect';

export const TableTopControls = ({
  entriesPerPage = 10,
  itemsPerPage,
  onEntriesPerPageChange = () => {},
  onItemsPerPageChange,
  searchTerm = '',
  searchQuery = '',
  onSearchChange = () => {},
  searchPlaceholder = 'Search...',
  placeholder = '',
  showEntriesSelector = true,
  showSearch = true
}) => {
  const currentEntries = itemsPerPage !== undefined ? itemsPerPage : entriesPerPage;
  const handleEntriesChange = onItemsPerPageChange || onEntriesPerPageChange;
  const currentSearch = searchTerm || searchQuery || '';
  const currentPlaceholder = placeholder || searchPlaceholder || 'Search...';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {showEntriesSelector ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>
          <span>Show</span>
          <div style={{ width: '80px' }}>
            <CustomSelect
              options={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 100, label: '100' }
              ]}
              value={currentEntries}
              onChange={(val) => handleEntriesChange(Number(typeof val === 'object' && val !== null && val.target ? val.target.value : val))}
            />
          </div>
          <span>entries</span>
        </div>
      ) : <div />}

      {showSearch ? (
        <div style={{ position: 'relative', width: '240px' }}>
          <Search style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '15px',
            height: '15px',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            value={currentSearch}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
                e.preventDefault();
              }
            }}
            onChange={(e) => onSearchChange(e.target.value.replace(/\s+/g, ''))}
            placeholder={currentPlaceholder}
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.82rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export const TableBottomPagination = ({
  totalEntries,
  totalItems,
  currentPage = 0,
  entriesPerPage,
  itemsPerPage,
  onPageChange = () => {}
}) => {
  const count = Number((totalEntries !== undefined ? totalEntries : totalItems) ?? 0);
  const limit = Number((entriesPerPage !== undefined ? entriesPerPage : itemsPerPage) ?? 10) || 10;
  const totalPages = Math.ceil(count / limit) || 1;
  const safeCurrentPage = count === 0 ? 0 : Math.min(Math.max(0, currentPage), totalPages - 1);
  const startEntry = count === 0 ? 0 : (safeCurrentPage) * limit + 1;
  const endEntry = Math.min((safeCurrentPage + 1) * limit, count);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, safeCurrentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-color)',
      borderRadius: '0 0 16px 16px',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '12px'
    }}>
      {/* Left Info Text */}
      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
        Showing {startEntry} to {endEntry} of {count} entries
      </div>

      {/* Right Pagination Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          disabled={safeCurrentPage === 0}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: safeCurrentPage === 0 ? '#f8fafc' : '#ffffff',
            color: safeCurrentPage === 0 ? '#cbd5e1' : '#334155',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: safeCurrentPage === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Prev
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            style={{
              minWidth: '34px',
              height: '34px',
              padding: '0 8px',
              borderRadius: '8px',
              border: page === safeCurrentPage ? 'none' : '1px solid #e2e8f0',
              background: page === safeCurrentPage ? '#000000' : '#ffffff',
              color: page === safeCurrentPage ? '#ffffff' : '#334155',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: page === safeCurrentPage ? '0 3px 10px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {page + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={safeCurrentPage >= totalPages - 1}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            background: safeCurrentPage >= totalPages - 1 ? '#f8fafc' : '#ffffff',
            color: safeCurrentPage >= totalPages - 1 ? '#cbd5e1' : '#334155',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: safeCurrentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};
