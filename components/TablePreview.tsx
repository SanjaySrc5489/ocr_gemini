import React from 'react';
import { TableData } from '../types';
import { Pencil } from 'lucide-react';

interface TablePreviewProps {
  data: TableData;
  onDataChange: (newData: TableData) => void;
}

export const TablePreview: React.FC<TablePreviewProps> = ({ data, onDataChange }) => {
  if (!data || data.length === 0) return null;

  const headers = data[0];
  const rows = data.slice(1);

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    // Create a deep copy of the row being modified to avoid direct state mutation
    const newData = data.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      }
      return row;
    });
    onDataChange(newData);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Data Preview
        </h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
          <Pencil size={12} />
          Click cells to edit
        </span>
      </div>
      
      <div className="overflow-auto custom-scrollbar flex-1 max-h-[60vh]">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 w-12 text-center font-medium text-slate-300">#</th>
              {headers.map((header, colIndex) => (
                <th key={`header-${colIndex}`} className="px-4 py-3 font-semibold min-w-[150px]">
                   <input
                    type="text"
                    value={header}
                    onChange={(e) => handleCellChange(0, colIndex, e.target.value)}
                    className="bg-transparent w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1 py-0.5 transition-all placeholder-slate-300"
                    placeholder={`Col ${colIndex + 1}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rIndex) => {
              // Calculate absolute row index in the main data array
              const absRowIndex = rIndex + 1;
              return (
                <tr key={`row-${rIndex}`} className="bg-white hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-center text-slate-300 text-xs select-none">{absRowIndex}</td>
                  {row.map((cell, cIndex) => (
                    <td key={`cell-${rIndex}-${cIndex}`} className="px-4 py-3">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(absRowIndex, cIndex, e.target.value)}
                        className="w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 text-slate-700 transition-all hover:bg-white focus:bg-white"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-8 text-center text-slate-400">
                  No data rows found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};