
import React, { useRef } from 'react';
import { Upload, FileImage, FileText, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  uploadedFile: File | null;
  isProcessing: boolean;
  progress: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessImage: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  uploadedFile,
  isProcessing,
  progress,
  onFileUpload,
  onProcessImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="max-w-4xl mx-auto mb-8 bg-gray-900/95 backdrop-blur-sm border border-gray-700 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
          <Upload className="h-6 w-6 text-cyan-400" />
          Upload Your Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          onClick={triggerFileInput}
          className="border-2 border-dashed border-cyan-400/50 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.pdf"
            onChange={onFileUpload}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <FileImage className="h-12 w-12 text-cyan-400 group-hover:scale-110 transition-transform" />
              <FileText className="h-12 w-12 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-lg font-medium text-white mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-400">
                Supported formats: JPEG, JPG, PDF (Max size: 10MB)
              </p>
            </div>
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-6 p-4 bg-emerald-950/50 rounded-lg border border-emerald-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {uploadedFile.type.includes('pdf') ? (
                  <FileText className="h-8 w-8 text-red-400" />
                ) : (
                  <FileImage className="h-8 w-8 text-cyan-400" />
                )}
                <div>
                  <p className="font-medium text-white">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                onClick={onProcessImage} 
                disabled={isProcessing}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border-0"
              >
                {isProcessing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Image
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Processing...</span>
              <span className="text-sm text-cyan-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-800" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
