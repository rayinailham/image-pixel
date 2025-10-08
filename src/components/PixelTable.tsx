import React, { useState, useMemo } from 'react';
import { getPixelRGBA, PixelRGBA, rgbaToHex } from '../utils/imageCompression';

interface PixelTableProps {
  pixelData: Uint8ClampedArray;
  width?: number;
  height?: number;
}

export const PixelTable: React.FC<PixelTableProps> = ({ 
  pixelData, 
  width = 500, 
  height = 500 
}) => {
  const [showMode, setShowMode] = useState<'rgba' | 'hex' | 'color'>('rgba');
  
  // Generate all rows data
  const allRowsData = useMemo(() => {
    const rows: Array<Array<PixelRGBA>> = [];
    
    for (let y = 0; y < height; y++) {
      const row: Array<PixelRGBA> = [];
      for (let x = 0; x < width; x++) {
        const rgba = getPixelRGBA(pixelData, x, y, width);
        row.push(rgba);
      }
      rows.push(row);
    }
    
    return rows;
  }, [pixelData, width, height]);

  const formatRGBA = (rgba: PixelRGBA): string => {
    return `${rgba.r},${rgba.g},${rgba.b},${rgba.a}`;
  };

  const formatHex = (rgba: PixelRGBA): string => {
    return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
  };

  const getBackgroundColor = (rgba: PixelRGBA): string => {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a / 255})`;
  };

  const renderCell = (rgba: PixelRGBA, x: number, y: number) => {
    switch (showMode) {
      case 'hex':
        return (
          <div className="text-xs font-mono text-center px-1 py-1 leading-tight text-black" title={`X:${x}, Y:${y}`}>
            {formatHex(rgba)}
          </div>
        );
      case 'color':
        return (
          <div 
            className="w-full h-6 border border-gray-300" 
            style={{ backgroundColor: getBackgroundColor(rgba) }}
            title={`X:${x}, Y:${y} - RGBA(${formatRGBA(rgba)})`}
          />
        );
      default: // rgba
        return (
          <div className="text-xs font-mono text-center px-1 py-1 leading-tight text-black" title={`X:${x}, Y:${y}`}>
            <div>{rgba.r},{rgba.g}</div>
            <div>{rgba.b},{rgba.a}</div>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Pixel Coordinate Table ({width} × {height})
        </h3>
        
        {/* Display Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowMode('rgba')}
            className={`px-3 py-1 text-sm rounded ${
              showMode === 'rgba' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            RGBA
          </button>
          <button
            onClick={() => setShowMode('hex')}
            className={`px-3 py-1 text-sm rounded ${
              showMode === 'hex' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            HEX
          </button>
          <button
            onClick={() => setShowMode('color')}
            className={`px-3 py-1 text-sm rounded ${
              showMode === 'color' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Color
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white shadow">
        <div className="overflow-auto max-h-96">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 py-1 text-left border-r sticky left-0 bg-gray-50 z-20 min-w-[40px] text-black">Y\X</th>
                {Array.from({ length: width }, (_, x) => (
                  <th key={x} className="px-1 py-1 text-center border-r min-w-[50px] max-w-[60px] text-black">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allRowsData.map((row, y) => (
                <tr key={y} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1 font-medium border-r sticky left-0 bg-white z-10 text-xs text-black">
                    {y}
                  </td>
                  {row.map((rgba, x) => (
                    <td key={x} className="border-r min-w-[50px] max-w-[60px] p-0">
                      {renderCell(rgba, x, y)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Info */}
      <div className="mt-4 text-sm text-gray-600">
        <p>Total pixels: {(width * height).toLocaleString()}</p>
        <p>Use the mode buttons to switch between RGBA values, HEX codes, and color preview</p>
        <p>Scroll horizontally and vertically to explore all pixel coordinates</p>
      </div>
    </div>
  );
};