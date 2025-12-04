// frontend/src/pages/Reports/ReportExport.jsx
import React, { useState } from 'react';
import { FileTextIcon, DownloadIcon, XIcon } from 'lucide-react';

const ReportExport = ({ onExport, onCancel, reportType }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Document', icon: FileTextIcon },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileTextIcon },
    { value: 'csv', label: 'CSV File', icon: FileTextIcon },
    { value: 'json', label: 'JSON Data', icon: FileTextIcon }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat, {
        includeCharts,
        includeSummary
      });
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Format</h3>
        <div className="space-y-3">
          {exportFormats.map((format) => {
            const Icon = format.icon;
            return (
              <label
                key={format.value}
                className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  selectedFormat === format.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={selectedFormat === format.value}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="sr-only"
                />
                <Icon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-900">{format.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSummary}
              onChange={(e) => setIncludeSummary(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Include executive summary</span>
          </label>
        </div>
      </div>

      {/* Format-specific Options */}
      {selectedFormat === 'pdf' && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">PDF Options</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• High-quality charts and graphs</li>
            <li>• Professional formatting</li>
            <li>• Suitable for presentations</li>
            <li>• Password protection available</li>
          </ul>
        </div>
      )}

      {selectedFormat === 'excel' && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">Excel Options</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Multiple worksheets</li>
            <li>• Formulas and calculations</li>
            <li>• Filtering and sorting</li>
            <li>• Charts embedded</li>
          </ul>
        </div>
      )}

      {selectedFormat === 'csv' && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">CSV Options</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Raw data export</li>
            <li>• Compatible with Excel, Google Sheets</li>
            <li>• Lightweight format</li>
            <li>• No formatting</li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReportExport;