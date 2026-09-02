import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  FileText,
  X,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FileWithPreview extends File {
  preview: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function UploadReport() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mappedFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prev) => [...prev, ...mappedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.png', '.jpg'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
    maxSize: 20 * 1024 * 1024,
  } as any);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return toast.error('Please select at least one file');
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('accessToken');
      let lastReportId: string | null = null;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('report_name', file.name);
        formData.append('report_type', file.type);

        const response = await axios.post(`${API_URL}/reports/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percent);
          },
        });

        const id =
          response.data?.data?.id ||
          response.data?.data?.report?.id ||
          response.data?.id;
        if (id) lastReportId = id;
      }

      toast.success('Reports uploaded successfully!');

      if (lastReportId) {
        navigate(`/dashboard/analysis/${lastReportId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Medical Reports</h1>
        <p className="text-muted-foreground">
          Securely upload your medical reports for AI analysis.
        </p>
      </div>

      <Card className="border-2 border-dashed border-muted-foreground/20 rounded-[2.5rem] overflow-hidden bg-muted/10 hover:bg-muted/20 transition-colors">
        <div
          {...getRootProps()}
          className={`p-12 md:p-20 flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px] ${
            isDragActive ? 'bg-primary/5' : ''
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
            <UploadIcon className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {isDragActive ? 'Drop your files here' : 'Drag & drop reports here'}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Support PDF, JPG, PNG, DOCX (Max 20MB)
          </p>
          <Button variant="secondary" className="mt-8 px-8 h-12 rounded-xl">
            Browse Files
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Selected Files ({files.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((file) => (
                <motion.div
                  key={file.name}
                  layout
                  className="relative border rounded-2xl p-4 bg-background"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.name)}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    {file.type.includes('image') ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-12 w-12 text-primary/50" />
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Card className="rounded-3xl p-8 shadow-xl">
              {isUploading ? (
                <div className="space-y-6">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    Your report will be analyzed by AI once uploaded
                  </p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-bold">Ready to Process</h4>
                    <p className="text-sm text-muted-foreground">
                      AI analysis takes few seconds.
                    </p>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="h-14 px-12 rounded-2xl text-lg"
                  >
                    Start AI Analysis
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8 pt-8">
        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Privacy First
          </h4>
          <p className="text-sm text-muted-foreground">
            All files are securely encrypted and stored safely.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Medical Disclaimer
          </h4>
          <p className="text-sm text-muted-foreground">
            AI analysis is informational only. Consult doctors for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
