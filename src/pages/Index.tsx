
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import FeatureCards from '@/components/FeatureCards';
import ProcessingOptions from '@/components/ProcessingOptions';
import { ImageSegmentation, SegmentationResult, ProcessingOptions as ProcessingOptionsType } from '@/utils/imageSegmentation';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SegmentationResult | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'kmeans' | 'dbscan' | 'meanshift'>('kmeans');
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptionsType>({
    resize: { width: 600, height: 400 },
    colorSpace: 'rgb',
    edgeDetection: false,
    gaussianBlur: 0
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setUploadedFile(file);
        setResults(null);
        toast({
          title: "File uploaded successfully!",
          description: `${file.name} is ready for processing with ${selectedAlgorithm.toUpperCase()}.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG image or PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const processImage = async () => {
    if (!uploadedFile) return;
    
    if (uploadedFile.type === 'application/pdf') {
      toast({
        title: "PDF Processing",
        description: "PDF segmentation is coming soon. Please upload an image file.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    // Enhanced progress simulation
    const progressSteps = [
      { step: 10, message: "Initializing..." },
      { step: 25, message: "Preprocessing image..." },
      { step: 40, message: "Applying color space conversion..." },
      { step: 55, message: `Running ${selectedAlgorithm.toUpperCase()} algorithm...` },
      { step: 70, message: "Analyzing clusters..." },
      { step: 85, message: "Generating visualizations..." },
      { step: 95, message: "Finalizing results..." }
    ];
    
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        setProgress(progressSteps[currentStep].step);
        toast({
          title: "Processing...",
          description: progressSteps[currentStep].message,
        });
        currentStep++;
      } else {
        clearInterval(progressInterval);
      }
    }, 300);
    
    try {
      const segmentation = new ImageSegmentation();
      const result = await segmentation.segmentImage(uploadedFile, selectedAlgorithm, processingOptions);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setResults(result);
        setIsProcessing(false);
        toast({
          title: "Processing complete!",
          description: `Image successfully segmented into ${result.clusters} clusters using ${selectedAlgorithm.toUpperCase()}.`,
        });
      }, 500);
      
    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
      toast({
        title: "Processing failed",
        description: "An error occurred during image segmentation. Please try again.",
        variant: "destructive",
      });
      console.error('Segmentation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-purple-600/10 to-emerald-600/10"></div>
        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center text-white mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              Advanced Image Segmentation Suite
            </h1>
            <p className="text-xl mb-2 text-cyan-200">ML-Powered Cluster Analysis & Visualization</p>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              State-of-the-art unsupervised learning algorithms with interactive dashboards, 
              advanced preprocessing, and comprehensive analytics for professional image analysis.
            </p>
          </div>

          {/* Processing Options */}
          <ProcessingOptions
            options={processingOptions}
            onOptionsChange={setProcessingOptions}
            algorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
          />

          {/* Upload Section */}
          <FileUpload 
            uploadedFile={uploadedFile}
            isProcessing={isProcessing}
            progress={progress}
            onFileUpload={handleFileUpload}
            onProcessImage={processImage}
          />

          {/* Results Section */}
          <ResultsDisplay results={results} uploadedFile={uploadedFile} />

          {/* Features Section */}
          <FeatureCards />
        </div>
      </div>
    </div>
  );
};

export default Index;
