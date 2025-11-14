import React from 'react';
import { useFocusable } from '../hooks/useFocus';

interface CategoryTabsProps<T extends string> {
  categories: { id: T; label: string }[];
  activeCategory: T;
  onCategoryChange: (category: T) => void;
}

interface CategoryButtonProps<T extends string> {
  category: { id: T; label: string };
  isActive: boolean;
  onClick: (category: T) => void;
}

// FIX: Changed to a const arrow function component to help TypeScript's type inference with generic components and JSX, resolving the error about the 'key' prop.
const CategoryButton = <T extends string>({ category, isActive, onClick }: CategoryButtonProps<T>): React.ReactElement => {
    const { focusableProps } = useFocusable({ id: `category-${category.id}` });
    return (
        <button
            {...focusableProps}
            onClick={() => {
                focusableProps.onClick();
                onClick(category.id);
            }}
            className={`${focusableProps.className} px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/20 focus:ring-cyan-400 ${
              isActive
                ? 'bg-cyan-500/80 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
        >
            {category.label}
        </button>
    )
}

export function CategoryTabs<T extends string>({ categories, activeCategory, onCategoryChange }: CategoryTabsProps<T>) {
  return (
    <div className="w-full mb-6 px-4 md:px-8">
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={onCategoryChange}
          />
        ))}
      </div>
    </div>
  );
}
