
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SegmentationResult } from '@/utils/imageSegmentation';
import SegmentationDashboard from './SegmentationDashboard';

interface ResultsDisplayProps {
  results: SegmentationResult | null;
  uploadedFile: File | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, uploadedFile }) => {
  if (!results) return null;

  const downloadResults = () => {
    // Create a canvas to combine images and metrics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas size for combined layout
      canvas.width = img.width * 2 + 60; // Side by side with padding
      canvas.height = img.height + 400; // Extra space for metrics and color palette
      
      // Fill background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image
      ctx.drawImage(img, 20, 20);
      
      // Draw segmented image
      const segImg = new Image();
      segImg.onload = () => {
        ctx.drawImage(segImg, img.width + 40, 20);
        
        // Add title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Image Segmentation Results', 20, img.height + 60);
        
        // Add labels
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Original Image', 20, img.height + 90);
        ctx.fillText('Segmented Result', img.width + 40, img.height + 90);
        
        // Add metrics
        ctx.font = '18px Arial';
        let y = img.height + 130;
        const metrics = [
          `Algorithm: ${results.algorithm.toUpperCase()}`,
          `Clusters: ${results.clusters}`,
          `Silhouette Score: ${results.silhouetteScore.toFixed(3)}`,
          `Processing Time: ${results.processingTime.toFixed(2)}s`,
        ];
        
        metrics.forEach(metric => {
          ctx.fillText(metric, 20, y);
          y += 30;
        });
        
        // Add color palette section
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Color Palette:', 20, y + 30);
        y += 60;
        
        // Draw color palette
        results.clusterStats.forEach((stat, index) => {
          const x = 20 + (index % 5) * 120;
          const paletteY = y + Math.floor(index / 5) * 60;
          
          // Draw color rectangle
          ctx.fillStyle = `rgb(${stat.dominantColor.join(',')})`;
          ctx.fillRect(x, paletteY - 15, 30, 30);
          
          // Add border
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, paletteY - 15, 30, 30);
          
          // Add text
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.fillText(`C${stat.clusterId}`, x + 35, paletteY - 5);
          ctx.fillText(`${stat.percentage.toFixed(1)}%`, x + 35, paletteY + 8);
        });
        
        // Download combined image
        const link = document.createElement('a');
        link.download = `segmentation_results_${uploadedFile?.name || 'image'}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      segImg.src = results.segmentedImageUrl;
    };
    img.src = results.originalImageUrl;

    // Download detailed JSON results
    const downloadData = {
      filename: uploadedFile?.name || 'segmented_image',
      algorithm: results.algorithm,
      metrics: {
        clusters: results.clusters,
        silhouetteScore: results.silhouetteScore,
        calinskiHarabasz: results.calinskiHarabasz,
        daviesBouldin: results.daviesBouldin,
        processingTime: results.processingTime
      },
      colorPalette: results.clusterStats.map(stat => ({
        clusterId: stat.clusterId,
        dominantColor: stat.dominantColor,
        percentage: stat.percentage,
        pixelCount: stat.pixelCount
      })),
      imageUrls: {
        original: results.originalImageUrl,
        segmented: results.segmentedImageUrl,
        clusters: results.clusterImageUrls,
        edgeMap: results.edgeMapUrl,
        preprocessed: results.preprocessedImageUrl
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
    const jsonLink = document.createElement('a');
    jsonLink.download = `detailed_results_${uploadedFile?.name || 'image'}.json`;
    jsonLink.href = URL.createObjectURL(blob);
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonLink.href);
  };

  return (
    <div className="space-y-6">
      {/* Compact Results Card */}
      <Card className="max-w-6xl mx-auto bg-gray-900/95 backdrop-blur-sm border border-gray-700 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white flex items-center justify-between">
            <span>Results ({results.algorithm.toUpperCase()}) - {results.clusters} Clusters</span>
            <Button 
              onClick={downloadResults}
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Images Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 mb-2 text-sm">Original Image</p>
                  <div className="aspect-video border border-gray-600 rounded overflow-hidden bg-gray-900">
                    <img 
                      src={results.originalImageUrl} 
                      alt="Original" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 mb-2 text-sm">Segmented Result</p>
                  <div className="aspect-video border border-gray-600 rounded overflow-hidden bg-gray-900">
                    <img 
                      src={results.segmentedImageUrl} 
                      alt="Segmented" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-cyan-900/30 border border-cyan-500/30 rounded p-3 text-center">
                  <p className="text-cyan-400 font-semibold text-lg">{results.clusters}</p>
                  <p className="text-xs text-cyan-300">Clusters</p>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-500/30 rounded p-3 text-center">
                  <p className="text-emerald-400 font-semibold text-lg">{results.silhouetteScore.toFixed(3)}</p>
                  <p className="text-xs text-emerald-300">Silhouette</p>
                </div>
                <div className="bg-purple-900/30 border border-purple-500/30 rounded p-3 text-center">
                  <p className="text-purple-400 font-semibold text-lg">{results.processingTime.toFixed(1)}s</p>
                  <p className="text-xs text-purple-300">Time</p>
                </div>
                <div className="bg-orange-900/30 border border-orange-500/30 rounded p-3 text-center">
                  <p className="text-orange-400 font-semibold text-lg">{results.algorithm.toUpperCase()}</p>
                  <p className="text-xs text-orange-300">Algorithm</p>
                </div>
              </div>
            </div>

            {/* Color Palette Section */}
            <div>
              <h3 className="text-white font-semibold mb-3">Color Palette</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.clusterStats.map((stat) => (
                  <div 
                    key={stat.clusterId}
                    className="flex items-center gap-3 p-2 bg-gray-800/50 rounded"
                  >
                    <div 
                      className="w-8 h-8 rounded border border-gray-500 flex-shrink-0"
                      style={{ backgroundColor: `rgb(${stat.dominantColor.join(',')})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">Cluster {stat.clusterId}</p>
                      <p className="text-xs text-gray-400 truncate">
                        RGB({stat.dominantColor.join(', ')})
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-cyan-400 font-semibold text-sm">{stat.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400">{(stat.pixelCount / 1000).toFixed(0)}k px</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Dashboard */}
      <SegmentationDashboard results={results} />
    </div>
  );
};

export default ResultsDisplay;
