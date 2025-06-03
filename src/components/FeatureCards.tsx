
import React from 'react';
import { Brain, Zap, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeatureCards: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Intelligent Clustering",
      description: "Advanced algorithms automatically determine optimal cluster numbers",
      color: "purple"
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Optimized algorithms for quick and efficient image analysis",
      color: "yellow"
    },
    {
      icon: Target,
      title: "Precise Results",
      description: "High-quality segmentation with detailed performance metrics",
      color: "emerald"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: "text-purple-400 hover:bg-purple-900/20 border-purple-500/30",
      yellow: "text-yellow-400 hover:bg-yellow-900/20 border-yellow-500/30",
      emerald: "text-emerald-400 hover:bg-emerald-900/20 border-emerald-500/30"
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {features.map((feature, index) => (
        <Card key={index} className={`bg-gray-900/80 backdrop-blur-sm border ${getColorClasses(feature.color)} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}>
          <CardContent className="p-6 text-center">
            <feature.icon className={`h-12 w-12 ${getColorClasses(feature.color).split(' ')[0]} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeatureCards;
