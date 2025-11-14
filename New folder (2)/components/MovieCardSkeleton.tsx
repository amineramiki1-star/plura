import React from 'react';

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg animate-pulse">
      <div className="w-full h-40 md:h-48 lg:h-64 bg-white/20"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-white/20 rounded w-3/4"></div>
        <div className="h-4 bg-white/20 rounded w-1/2"></div>
        <div className="space-y-2 pt-2">
            <div className="h-3 bg-white/20 rounded"></div>
            <div className="h-3 bg-white/20 rounded"></div>
            <div className="h-3 bg-white/20 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};
