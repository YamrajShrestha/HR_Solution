import React, { useState } from 'react';
import { UploadIcon, FileTextIcon, EyeIcon, TrashIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const Documents = ({ documents = [], employeeId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', file.name);
    formData.append('type', 'employee-document');

    setUploading(true);
    try {
      await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        body: formData
      });
      toast.success('Document uploaded successfully');
      onUploadComplete();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Documents</h3>
        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload Document
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {uploading && <p className="text-sm text-blue-600">Uploading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc, index) => (
          <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <FileTextIcon className="h-10 w-10 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-500 hover:text-blue-600">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="text-gray-500 hover:text-green-600">
                  <DownloadIcon className="h-4 w-4" />
                </button>
                <button className="text-gray-500 hover:text-red-600">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;