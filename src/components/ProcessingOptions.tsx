
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { ProcessingOptions as ProcessingOptionsType } from '@/utils/imageSegmentation';

interface ProcessingOptionsProps {
  options: ProcessingOptionsType;
  onOptionsChange: (options: ProcessingOptionsType) => void;
  algorithm: 'kmeans' | 'dbscan' | 'meanshift';
  onAlgorithmChange: (algorithm: 'kmeans' | 'dbscan' | 'meanshift') => void;
}

const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  options,
  onOptionsChange,
  algorithm,
  onAlgorithmChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOption = <K extends keyof ProcessingOptionsType>(
    key: K,
    value: ProcessingOptionsType[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const presetConfigs = {
    basic: {
      resize: { width: 400, height: 300 },
      colorSpace: 'rgb' as const,
      edgeDetection: false,
      gaussianBlur: 0
    },
    enhanced: {
      resize: { width: 600, height: 450 },
      colorSpace: 'lab' as const,
      edgeDetection: true,
      gaussianBlur: 1
    }
  };

  return (
    <Card className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Settings className="h-4 w-4 text-cyan-400" />
            Processing Options
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Always visible: Algorithm Selection */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(['kmeans', 'dbscan', 'meanshift'] as const).map((alg) => (
            <Button
              key={alg}
              variant={algorithm === alg ? "default" : "outline"}
              onClick={() => onAlgorithmChange(alg)}
              size="sm"
              className={`${
                algorithm === alg 
                  ? 'bg-cyan-600 hover:bg-cyan-700 border-cyan-500' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {alg === 'kmeans' ? 'K-Means' : alg === 'dbscan' ? 'DBSCAN' : 'Mean Shift'}
            </Button>
          ))}
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Quick Presets */}
            <div>
              <h4 className="text-sm text-emerald-300 mb-2">Quick Presets</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presetConfigs).map(([name, config]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => onOptionsChange(config)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 capitalize"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Compact Settings */}
            <div className="grid grid-cols-2 gap-4">
              {/* Image Size */}
              <div>
                <label className="text-gray-300 text-xs mb-1 block">Size</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="W"
                    value={options.resize?.width || 600}
                    onChange={(e) => updateOption('resize', { 
                      width: parseInt(e.target.value) || 600, 
                      height: options.resize?.height || 400 
                    })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                  <input
                    type="number"
                    placeholder="H"
                    value={options.resize?.height || 400}
                    onChange={(e) => updateOption('resize', { 
                      width: options.resize?.width || 600, 
                      height: parseInt(e.target.value) || 400 
                    })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>

              {/* Color Space */}
              <div>
                <label className="text-gray-300 text-xs mb-1 block">Color Space</label>
                <select
                  value={options.colorSpace || 'rgb'}
                  onChange={(e) => updateOption('colorSpace', e.target.value as 'rgb' | 'lab' | 'hsv')}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="rgb">RGB</option>
                  <option value="lab">LAB</option>
                  <option value="hsv">HSV</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-gray-300 text-xs">Blur: {options.gaussianBlur || 0}px</label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.5"
                  value={options.gaussianBlur || 0}
                  onChange={(e) => updateOption('gaussianBlur', parseFloat(e.target.value))}
                  className="w-16"
                />
              </div>
              <Button
                variant={options.edgeDetection ? "default" : "outline"}
                size="sm"
                onClick={() => updateOption('edgeDetection', !options.edgeDetection)}
                className={`text-xs ${
                  options.edgeDetection 
                    ? 'bg-cyan-600 hover:bg-cyan-700' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Edge Detection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingOptions;
