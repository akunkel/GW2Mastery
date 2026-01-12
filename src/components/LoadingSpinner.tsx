interface LoadingSpinnerProps {
  progress?: number;
  total?: number;
  message?: string;
}

export default function LoadingSpinner({ progress, total, message }: LoadingSpinnerProps) {
  const showProgress = progress !== undefined && total !== undefined && total > 0;
  const percentage = showProgress ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative w-full max-w-md">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-400 text-center">
          {message || 'Loading achievements...'}
        </p>
        {showProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Progress</span>
              <span>{progress} / {total}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-center text-slate-500 text-sm mt-2">{percentage}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
