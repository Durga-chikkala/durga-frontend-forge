
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, Calendar, BookOpen, Video, Clock } from 'lucide-react';

interface AdvancedSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  searchQuery: string;
  activeFilters: FilterOptions;
}

export interface FilterOptions {
  category: string;
  difficulty: string;
  duration: string;
  status: string;
  week: string;
  dateRange: string;
}

export const AdvancedSearchFilter = ({ onSearch, onFilter, searchQuery, activeFilters }: AdvancedSearchFilterProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(activeFilters);

  const filterCategories = [
    { key: 'category', label: 'Category', icon: BookOpen, options: ['all', 'html', 'css', 'javascript', 'react', 'projects'] },
    { key: 'difficulty', label: 'Difficulty', icon: BookOpen, options: ['all', 'beginner', 'intermediate', 'advanced'] },
    { key: 'duration', label: 'Duration', icon: Clock, options: ['all', 'short', 'medium', 'long'] },
    { key: 'status', label: 'Status', icon: Video, options: ['all', 'not-started', 'in-progress', 'completed'] },
    { key: 'week', label: 'Week', icon: Calendar, options: ['all', 'week1', 'week2', 'week3', 'week4', 'week5', 'week6'] },
  ];

  const applyFilters = () => {
    onFilter(tempFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      difficulty: 'all',
      duration: 'all',
      status: 'all',
      week: 'all',
      dateRange: 'all'
    };
    setTempFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== 'all').length;
  };

  const getFilterLabel = (key: string, value: string) => {
    if (value === 'all') return null;
    return `${key}: ${value}`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search courses, topics, or content..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-colors"
          />
        </div>

        {/* Filter Toggle and Active Filters */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 border-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Filter className="w-4 h-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge className="bg-blue-600 text-white ml-1 px-2 py-1 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>

            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 hover:text-red-600 text-sm"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              const label = getFilterLabel(key, value);
              if (!label) return null;
              
              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 px-3 py-1 flex items-center gap-1"
                >
                  {label}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      const newFilters = { ...activeFilters, [key]: 'all' };
                      onFilter(newFilters);
                    }}
                  />
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="border-t pt-4 space-y-4 bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Advanced Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterCategories.map((category) => (
                <div key={category.key} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </label>
                  <Select
                    value={tempFilters[category.key as keyof FilterOptions]}
                    onValueChange={(value) => 
                      setTempFilters(prev => ({ ...prev, [category.key]: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {category.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
