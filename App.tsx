import React, { useState, useCallback } from 'react';
import { FileText, FileSpreadsheet, RefreshCw, Wand2 } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { TablePreview } from './components/TablePreview';
import { ProcessingState } from './components/ProcessingState';
import { extractTableData } from './services/geminiService';
import { downloadCSV, downloadExcel, processFileForAI } from './utils/fileHelpers';
import { ProcessingStatus, TableData } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [data, setData] = useState<TableData>([]);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("Initializing...");

  const handleImageUpload = useCallback(async (file: File) => {
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    setData([]);
    setProgressMessage("Optimizing image...");

    try {
      // Optimize image if necessary to fit API limits
      const { base64, mimeType } = await processFileForAI(file);
      
      // Pass the progress callback
      const result = await extractTableData(base64, mimeType, (msg) => {
        setProgressMessage(msg);
      });
      
      if (result && result.length > 0) {
        setData(result);
        setStatus(ProcessingStatus.SUCCESS);
      } else {
        throw new Error("The AI could not detect any tabular data.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(ProcessingStatus.ERROR);
      setError(err.message || "An unexpected error occurred processing the image.");
    }
  }, []);

  const handleReset = () => {
    setStatus(ProcessingStatus.IDLE);
    setData([]);
    setError(null);
    setProgressMessage("Initializing...");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 pb-12 pt-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6">
            <Wand2 className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              ScribeTable
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Convert handwritten documents into 100% accurate digital spreadsheets using advanced Gemini AI.
            Upload, verify, and export in seconds.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 -mt-8">
        
        {/* Input Section */}
        {status === ProcessingStatus.IDLE || status === ProcessingStatus.UPLOADING || status === ProcessingStatus.PROCESSING ? (
           <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 transition-all duration-500">
              {status === ProcessingStatus.PROCESSING ? (
                <ProcessingState progress={progressMessage} />
              ) : (
                <>
                   <div className="text-center mb-6">
                     <h2 className="text-xl font-semibold text-slate-800">Upload Raw Data Image</h2>
                     <p className="text-slate-400 text-sm">PNG, JPG, or WEBP containing tabular data</p>
                   </div>
                   <ImageUploader onImageSelected={handleImageUpload} isProcessing={false} />
                   {status === ProcessingStatus.ERROR && (
                     <div className="mx-auto max-w-xl mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-center animate-in fade-in slide-in-from-top-2">
                        <p className="font-medium">Processing Failed</p>
                        <p className="text-sm mt-1 opacity-80">{error}</p>
                        <button 
                          onClick={handleReset}
                          className="mt-4 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
                        >
                          Try Again
                        </button>
                     </div>
                   )}
                </>
              )}
           </div>
        ) : null}

        {/* Results Section */}
        {status === ProcessingStatus.SUCCESS && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Action Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100 sticky top-4 z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleReset}
                  className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors tooltip"
                  title="Upload New Image"
                >
                  <RefreshCw size={20} />
                </button>
                <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                <span className="text-sm font-medium text-slate-500 hidden md:block">
                  Review data below before exporting
                </span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => downloadCSV(data)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 rounded-xl font-medium transition-all duration-200 shadow-sm"
                >
                  <FileText size={18} className="text-blue-600" />
                  Download CSV
                </button>
                <button
                  onClick={() => downloadExcel(data)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg shadow-green-600/20 transition-all duration-200 transform hover:scale-105"
                >
                  <FileSpreadsheet size={18} />
                  Download Excel
                </button>
              </div>
            </div>

            {/* Table Editor */}
            <div className="min-h-[400px]">
              <TablePreview data={data} onDataChange={setData} />
            </div>

            <div className="text-center text-sm text-slate-400 pb-8">
               <p>Tip: Click on any cell to edit content manually to ensure 100% accuracy.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;