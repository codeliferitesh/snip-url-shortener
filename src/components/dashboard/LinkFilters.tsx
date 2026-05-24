import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useLinksStore } from '@/store/linksStore';
import type { SortField } from '@/types';

export default function LinkFilters() {
  const { filter, setFilter } = useLinksStore();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={filter.search}
          onChange={e => setFilter({ search: e.target.value })}
          placeholder="Search links..."
          className="input-base pl-10 text-sm"
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2">
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <select
            value={filter.sortBy}
            onChange={e => setFilter({ sortBy: e.target.value as SortField })}
            className="input-base pl-9 pr-8 text-sm appearance-none cursor-pointer"
            style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            <option value="createdAt">Date Created</option>
            <option value="totalClicks">Most Clicks</option>
            <option value="lastClickAt">Last Clicked</option>
          </select>
        </div>

        <button
          onClick={() => setFilter({ sortDirection: filter.sortDirection === 'asc' ? 'desc' : 'asc' })}
          className="btn-ghost w-10 h-10 p-0 rounded-xl shrink-0"
          title={`Sort ${filter.sortDirection === 'asc' ? 'descending' : 'ascending'}`}>
          <ArrowUpDown className="w-4 h-4" />
        </button>

        <label className="flex items-center gap-2 btn-ghost px-3 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filter.showExpired}
            onChange={e => setFilter({ showExpired: e.target.checked })}
            className="w-3.5 h-3.5 accent-brand-500"
          />
          Expired
        </label>
      </div>
    </div>
  );
}
