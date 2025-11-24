import React from 'react';

export interface CelebrationBannerProps {
  storeName?: string | null;
  percent?: number | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const CelebrationBanner: React.FC<CelebrationBannerProps> = ({
  storeName,
  percent,
  loading,
  error,
  className,
}) => {
  const hasPercent = typeof percent === 'number' && !Number.isNaN(percent);
  const formattedPercent = hasPercent ? percent!.toFixed(2) : null;
  const name = storeName ?? 'Unknown Store';

  const baseClasses =
    'relative overflow-hidden rounded-xl border p-4 md:p-6 flex flex-col md:flex-row items-center gap-4';
  const successClasses =
    'bg-gradient-to-r from-pink-50 via-rose-50 to-red-50 border-rose-200';
  const fallbackClasses = 'bg-amber-50 border-amber-200';
  const textClasses = 'text-sm md:text-base';

  const showConfetti = hasPercent && !loading && !error;

  return (
    <div
      className={`${baseClasses} ${showConfetti ? successClasses : fallbackClasses} ${
        className ?? ''
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4 w-full">
        <img
          src="/celebrate.png"
          alt="Celebrate"
          className="h-12 w-12 md:h-16 md:w-16 shrink-0"
        />
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-b-0 border-rose-500"></span>
              <span className="text-muted-foreground text-sm">Loading celebration...</span>
            </div>
          ) : error ? (
            <div className="text-amber-900 text-sm">
              {error}
            </div>
          ) : (
            <div className={textClasses}>
              <span className="font-semibold text-rose-700">Congrats to store </span>
              <span className="font-bold text-rose-900">{name}</span>
              <span className="font-semibold text-rose-700"> for passing </span>
              <span className="font-bold text-rose-900">
                {formattedPercent ?? 'N/A'}%
              </span>
            </div>
          )}
          {!hasPercent && !loading && !error && (
            <div className="mt-1 text-xs text-amber-800">
              HNR metrics unavailable. Showing limited celebration info.
            </div>
          )}
        </div>
        {showConfetti && (
          <div className="text-3xl md:text-4xl select-none" aria-hidden>
            🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default CelebrationBanner;