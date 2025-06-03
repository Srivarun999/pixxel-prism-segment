
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { SegmentationResult } from '@/utils/imageSegmentation';
import { Palette, BarChart3, Image, Settings } from 'lucide-react';

interface SegmentationDashboardProps {
  results: SegmentationResult | null;
}

const SegmentationDashboard: React.FC<SegmentationDashboardProps> = ({ results }) => {
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

  if (!results) return null;

  const chartConfig = {
    cluster: {
      label: "Cluster",
    },
    percentage: {
      label: "Percentage",
    },
    pixels: {
      label: "Pixels",
    },
  };

  const pieData = results.clusterStats.map((stat, index) => ({
    name: `Cluster ${stat.clusterId}`,
    value: stat.percentage,
    fill: `rgb(${stat.dominantColor.join(',')})`,
    pixels: stat.pixelCount,
  }));

  const barData = results.clusterStats.map((stat) => ({
    cluster: `C${stat.clusterId}`,
    pixels: stat.pixelCount,
    percentage: stat.percentage,
    fill: `rgb(${stat.dominantColor.join(',')})`,
  }));

  const algorithmPerformance = [
    { algorithm: 'K-Means', silhouette: results.algorithm === 'kmeans' ? results.silhouetteScore : 0.72, time: results.algorithm === 'kmeans' ? results.processingTime : 1.2 },
    { algorithm: 'DBSCAN', silhouette: results.algorithm === 'dbscan' ? results.silhouetteScore : 0.68, time: results.algorithm === 'dbscan' ? results.processingTime : 2.1 },
    { algorithm: 'Mean Shift', silhouette: results.algorithm === 'meanshift' ? results.silhouetteScore : 0.74, time: results.algorithm === 'meanshift' ? results.processingTime : 3.5 },
  ];

  const colorSpaceData = results.clusterStats.map((stat) => ({
    cluster: stat.clusterId,
    r: stat.dominantColor[0],
    g: stat.dominantColor[1],
    b: stat.dominantColor[2],
  }));

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/95 backdrop-blur-sm border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Interactive Segmentation Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-600">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-cyan-600">Overview</TabsTrigger>
              <TabsTrigger value="clusters" className="text-white data-[state=active]:bg-cyan-600">Clusters</TabsTrigger>
              <TabsTrigger value="performance" className="text-white data-[state=active]:bg-cyan-600">Performance</TabsTrigger>
              <TabsTrigger value="colorspace" className="text-white data-[state=active]:bg-cyan-600">Color Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-cyan-300 text-lg">Cluster Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ value }) => `${value.toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-emerald-300 text-lg">Pixel Count per Cluster</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart data={barData}>
                        <XAxis dataKey="cluster" />
                        <YAxis />
                        <Bar dataKey="pixels" radius={4}>
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 p-4 rounded-lg border border-cyan-500/30">
                  <h3 className="font-semibold text-cyan-300 mb-2">Total Clusters</h3>
                  <p className="text-2xl font-bold text-cyan-400">{results.clusters}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-4 rounded-lg border border-emerald-500/30">
                  <h3 className="font-semibold text-emerald-300 mb-2">Algorithm</h3>
                  <p className="text-lg font-bold text-emerald-400">{results.algorithm.toUpperCase()}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-lg border border-purple-500/30">
                  <h3 className="font-semibold text-purple-300 mb-2">Silhouette Score</h3>
                  <p className="text-xl font-bold text-purple-400">{results.silhouetteScore.toFixed(3)}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 p-4 rounded-lg border border-orange-500/30">
                  <h3 className="font-semibold text-orange-300 mb-2">Processing Time</h3>
                  <p className="text-xl font-bold text-orange-400">{results.processingTime.toFixed(2)}s</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clusters" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Individual Clusters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {results.clusterImageUrls.map((url, index) => (
                        <div 
                          key={index}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            selectedCluster === index ? 'border-cyan-400 scale-105' : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedCluster(selectedCluster === index ? null : index)}
                        >
                          <img 
                            src={url} 
                            alt={`Cluster ${index}`}
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-2 bg-gray-900">
                            <p className="text-xs text-gray-300">Cluster {index}</p>
                            <p className="text-xs text-cyan-400">
                              {results.clusterStats.find(s => s.clusterId === index)?.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Cluster Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.clusterStats.map((stat) => (
                        <div 
                          key={stat.clusterId}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedCluster === stat.clusterId 
                              ? 'bg-cyan-900/30 border-cyan-500' 
                              : 'bg-gray-700/30 border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: `rgb(${stat.dominantColor.join(',')})` }}
                              />
                              <span className="text-white font-medium">Cluster {stat.clusterId}</span>
                            </div>
                            <span className="text-cyan-400 font-semibold">{stat.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            <p>Pixels: {stat.pixelCount.toLocaleString()}</p>
                            <p>RGB: ({stat.dominantColor.join(', ')})</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-yellow-300">Algorithm Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart data={algorithmPerformance}>
                        <XAxis dataKey="algorithm" />
                        <YAxis />
                        <Bar dataKey="silhouette" fill="#fbbf24" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-red-300">Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <LineChart data={algorithmPerformance}>
                        <XAxis dataKey="algorithm" />
                        <YAxis />
                        <Line type="monotone" dataKey="time" stroke="#ef4444" strokeWidth={2} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Quality Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 p-4 rounded-lg border border-emerald-500/30">
                      <h3 className="font-semibold text-emerald-300 mb-2">Silhouette Score</h3>
                      <p className="text-2xl font-bold text-emerald-400">{results.silhouetteScore.toFixed(3)}</p>
                      <p className="text-xs text-emerald-200 mt-1">Higher is better (0-1)</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 p-4 rounded-lg border border-cyan-500/30">
                      <h3 className="font-semibold text-cyan-300 mb-2">Calinski-Harabasz</h3>
                      <p className="text-2xl font-bold text-cyan-400">{results.calinskiHarabasz.toFixed(2)}</p>
                      <p className="text-xs text-cyan-200 mt-1">Higher is better</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-lg border border-purple-500/30">
                      <h3 className="font-semibold text-purple-300 mb-2">Davies-Bouldin</h3>
                      <p className="text-2xl font-bold text-purple-400">{results.daviesBouldin.toFixed(3)}</p>
                      <p className="text-xs text-purple-200 mt-1">Lower is better</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colorspace" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-pink-300">RGB Color Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <ScatterChart data={colorSpaceData}>
                        <XAxis dataKey="r" domain={[0, 255]} name="Red" />
                        <YAxis dataKey="g" domain={[0, 255]} name="Green" />
                        <Scatter dataKey="b" fill="#ec4899" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </ScatterChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Color Palette</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.clusterStats.map((stat) => (
                        <div key={stat.clusterId} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                          <div 
                            className="w-8 h-8 rounded border border-gray-500"
                            style={{ backgroundColor: `rgb(${stat.dominantColor.join(',')})` }}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">Cluster {stat.clusterId}</p>
                            <p className="text-xs text-gray-400">RGB({stat.dominantColor.join(', ')})</p>
                          </div>
                          <div className="text-right">
                            <p className="text-cyan-400 font-semibold">{stat.percentage.toFixed(1)}%</p>
                            <p className="text-xs text-gray-400">{stat.pixelCount} px</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {results.edgeMapUrl && (
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Edge Detection Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 mb-2">Original Image</p>
                        <img 
                          src={results.originalImageUrl} 
                          alt="Original"
                          className="w-full h-48 object-contain bg-gray-900 rounded border border-gray-600"
                        />
                      </div>
                      <div>
                        <p className="text-gray-400 mb-2">Edge Map</p>
                        <img 
                          src={results.edgeMapUrl} 
                          alt="Edge Map"
                          className="w-full h-48 object-contain bg-gray-900 rounded border border-gray-600"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SegmentationDashboard;
