import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  progress: string;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ progress }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <div className="relative bg-white p-5 rounded-full shadow-xl border border-blue-100">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <div className="absolute -top-2 -right-2 bg-amber-400 p-2 rounded-full shadow-lg animate-bounce delay-100">
            <Sparkles size={14} className="text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">Processing Image</h3>
      
      <div className="w-full max-w-xs bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
        <div className="bg-blue-500 h-1.5 rounded-full animate-[loading_2s_ease-in-out_infinite] w-1/2 relative">
          <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]"></div>
        </div>
      </div>

      <p className="text-sm font-medium text-blue-600 animate-pulse">
        {progress}
      </p>
      
      <p className="mt-2 text-slate-400 text-xs max-w-sm text-center">
        Gemini is analyzing handwriting patterns and converting to structured data.
      </p>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
