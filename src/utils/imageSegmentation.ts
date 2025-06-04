import { ClusterStat, ProcessingOptions } from './types';

// ===== DBSCAN5D Implementation =====
export class DBSCAN5D {
  private eps: number;
  private minPts: number;

  constructor(eps: number, minPts: number) {
    this.eps = eps;
    this.minPts = minPts;
  }

  private distance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  private regionQuery(points: number[][], pointIdx: number): number[] {
    const neighbors: number[] = [];
    for (let i = 0; i < points.length; i++) {
      if (this.distance(points[pointIdx], points[i]) <= this.eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  fit(points: number[][]): number[] {
    const labels = new Array(points.length).fill(-1);
    let clusterId = 0;

    for (let i = 0; i < points.length; i++) {
      if (labels[i] !== -1) continue;

      const neighbors = this.regionQuery(points, i);
      if (neighbors.length < this.minPts) {
        labels[i] = -1; // Noise
        continue;
      }

      clusterId++;
      labels[i] = clusterId;

      for (let j = 0; j < neighbors.length; j++) {
        const neighborIdx = neighbors[j];
        if (labels[neighborIdx] === -1) labels[neighborIdx] = clusterId;
        if (labels[neighborIdx] !== -1) continue;

        labels[neighborIdx] = clusterId;
        const newNeighbors = this.regionQuery(points, neighborIdx);
        if (newNeighbors.length >= this.minPts) {
          neighbors.push(...newNeighbors);
        }
      }
    }

    return labels;
  }
}

// ===== ImageSegmentation Class =====
export class ImageSegmentation {
  // ===== Preprocessing =====
  async preprocessImage(file: File, options: ProcessingOptions): Promise<ImageData> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = options.resize?.width || img.width;
    canvas.height = options.resize?.height || img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (options.colorSpace && options.colorSpace !== 'rgb') {
      imageData = this.convertColorSpace(imageData, options.colorSpace);
    }
    if (options.gaussianBlur && options.gaussianBlur > 0) {
      imageData = this.applyGaussianBlur(imageData, options.gaussianBlur);
    }
    if (options.edgeDetection) {
      imageData = this.applyEdgeDetection(imageData);
    }
    return imageData;
  }

  // ===== Helper Functions =====
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  private applyGaussianBlur(imageData: ImageData, radius: number): ImageData {
    // (Same as your implementation)
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    const kernelSize = Math.floor(radius) * 2 + 1;
    const half = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const nx = x + kx, ny = y + ky;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              rSum += data[idx];
              gSum += data[idx + 1];
              bSum += data[idx + 2];
              aSum += data[idx + 3];
              count++;
            }
          }
        }
        const i = (y * width + x) * 4;
        newData[i] = rSum / count;
        newData[i + 1] = gSum / count;
        newData[i + 2] = bSum / count;
        newData[i + 3] = aSum / count;
      }
    }
    return new ImageData(newData, width, height);
  }

  private applyEdgeDetection(imageData: ImageData): ImageData {
    // (Same as your implementation)
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gxR = 0, gyR = 0, gxG = 0, gyG = 0, gxB = 0, gyB = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            gxR += data[idx] * kernelX[kernelIdx];
            gyR += data[idx] * kernelY[kernelIdx];
            gxG += data[idx + 1] * kernelX[kernelIdx];
            gyG += data[idx + 1] * kernelY[kernelIdx];
            gxB += data[idx + 2] * kernelX[kernelIdx];
            gyB += data[idx + 2] * kernelY[kernelIdx];
          }
        }
        const magR = Math.min(255, Math.sqrt(gxR * gxR + gyR * gyR));
        const magG = Math.min(255, Math.sqrt(gxG * gxG + gyG * gyG));
        const magB = Math.min(255, Math.sqrt(gxB * gxB + gyB * gyB));
        const i = (y * width + x) * 4;
        newData[i] = magR;
        newData[i + 1] = magG;
        newData[i + 2] = magB;
        newData[i + 3] = 255;
      }
    }
    return new ImageData(newData, width, height);
  }

  private convertColorSpace(imageData: ImageData, colorSpace: 'lab' | 'hsv'): ImageData {
    const { data, width, height } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      let converted: [number, number, number];
      if (colorSpace === 'lab') {
        converted = this.rgbToLab(r, g, b);
      } else {
        converted = this.rgbToHsv(r, g, b);
      }
      newData[i] = converted[0];
      newData[i + 1] = converted[1];
      newData[i + 2] = converted[2];
      newData[i + 3] = data[i + 3];
    }
    return new ImageData(newData, width, height);
  }

  private rgbToLab(r: number, g: number, b: number): [number, number, number] {
    // Convert RGB to XYZ
    let [x, y, z] = this.rgbToXyz(r, g, b);
    // Convert XYZ to LAB
    const refX = 95.047, refY = 100.0, refZ = 108.883;
    x /= refX; y /= refY; z /= refZ;
    x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z) + (16 / 116);
    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const bVal = 200 * (y - z);
    // Scale LAB to 0-255 for visualization
    return [
      Math.max(0, Math.min(255, (l + 16) * 255 / 116)),
      Math.max(0, Math.min(255, a + 128)),
      Math.max(0, Math.min(255, bVal + 128))
    ];
  }

  private rgbToXyz(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100;
    const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100;
    const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100;
    return [x, y, z];
  }

  private rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60; if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    return [h / 360 * 255, s * 255, v * 255];
  }

  // ===== Clustering =====
  private initializeCenters(pixels: number[][], k: number): number[][] {
    const centers = [pixels[Math.floor(Math.random() * pixels.length)]];
    while (centers.length < k) {
      const distances = pixels.map(p =>
        Math.min(...centers.map(c => this.distance(p, c)))
      );
      const total = distances.reduce((a, b) => a + b, 0);
      const probabilities = distances.map(d => d / total);
      const cumulative = probabilities.map((sum => value => sum += value)(0));
      const rand = Math.random();
      centers.push(pixels[cumulative.findIndex(v => v >= rand)]);
    }
    return centers;
  }

  private distance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    if (!a || !b || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  private async kMeansSegmentation(
    imageData: ImageData,
    k: number = 5
  ): Promise<{
    labels: number[];
    centers: number[][];
    clusterStats: ClusterStat[];
    segmentedImageData: ImageData;
    clusterImages: ImageData[];
  }> {
    const { data, width, height } = imageData;
    const pixels: number[][] = [];
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      // Spatial coordinates are normalized and weighted
      pixels.push([
        data[i], data[i + 1], data[i + 2],
        (x / width) * 50,
        (y / height) * 50
      ]);
    }

    let centers = this.initializeCenters(pixels, k);
    let labels = new Array(pixels.length).fill(0);
    let prevLabels: number[];
    let iterations = 0;
    const maxIterations = 100;

    do {
      prevLabels = [...labels];
      // Assign pixels to nearest centers
      for (let i = 0; i < pixels.length; i++) {
        let minDist = Infinity;
        let closestCenter = 0;
        for (let j = 0; j < k; j++) {
          const dist = this.distance(pixels[i], centers[j]);
          if (dist < minDist) {
            minDist = dist;
            closestCenter = j;
          }
        }
        labels[i] = closestCenter;
      }
      // Update centers
      for (let j = 0; j < k; j++) {
        const clusterPixels = pixels.filter((_, i) => labels[i] === j);
        if (clusterPixels.length > 0) {
          for (let dim = 0; dim < 5; dim++) {
            centers[j][dim] = clusterPixels.reduce((sum, pixel) => sum + pixel[dim], 0) / clusterPixels.length;
          }
        }
      }
      iterations++;
    } while (iterations < maxIterations && !this.arraysEqual(labels, prevLabels));

    // Visualization
    const vibrantColors = [
      [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255],
      [0, 255, 255], [255, 128, 0], [128, 0, 255], [255, 128, 128], [128, 255, 128]
    ];
    const segmentedData = new Uint8ClampedArray(data.length);
    const clusterStats: ClusterStat[] = [];
    const clusterImages: ImageData[] = [];

    for (let i = 0; i < k; i++) {
      const clusterPixelIndices = labels.map((label, idx) => label === i ? idx : -1).filter(idx => idx !== -1);
      if (clusterPixelIndices.length > 0) {
        const dominantColor = vibrantColors[i % vibrantColors.length];
        clusterStats.push({
          clusterId: i,
          pixelCount: clusterPixelIndices.length,
          percentage: (clusterPixelIndices.length / pixels.length) * 100,
          dominantColor: dominantColor
        });
        const clusterImageData = new Uint8ClampedArray(data.length);
        clusterImageData.fill(0);
        for (const pixelIdx of clusterPixelIndices) {
          const dataIdx = pixelIdx * 4;
          clusterImageData[dataIdx] = dominantColor[0];
          clusterImageData[dataIdx + 1] = dominantColor[1];
          clusterImageData[dataIdx + 2] = dominantColor[2];
          clusterImageData[dataIdx + 3] = 255;
        }
        clusterImages.push(new ImageData(clusterImageData, width, height));
      }
    }
    for (let i = 0; i < labels.length; i++) {
      const dataIdx = i * 4;
      const clusterColor = vibrantColors[labels[i] % vibrantColors.length];
      segmentedData[dataIdx] = clusterColor[0];
      segmentedData[dataIdx + 1] = clusterColor[1];
      segmentedData[dataIdx + 2] = clusterColor[2];
      segmentedData[dataIdx + 3] = 255;
    }

    return {
      labels,
      centers: centers.map(center => center.slice(0, 3)),
      clusterStats: clusterStats.sort((a, b) => b.percentage - a.percentage),
      segmentedImageData: new ImageData(segmentedData, width, height),
      clusterImages
    };
  }

  private async dbscanSegmentation(
    imageData: ImageData
  ): Promise<{
    labels: number[];
    centers: number[][];
    clusterStats: ClusterStat[];
    segmentedImageData: ImageData;
    clusterImages: ImageData[];
  }> {
    const { data, width, height } = imageData;
    const pixels: number[][] = [];
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      pixels.push([
        data[i], data[i + 1], data[i + 2],
        (x / width) * 50,
        (y / height) * 50
      ]);
    }

    // Adaptive parameters
    const eps = Math.sqrt(width * height) * 0.05;
    const minPts = Math.max(4, (width * height) * 0.0005);
    const dbscan = new DBSCAN5D(eps, minPts);
    const labels = dbscan.fit(pixels);

    // Calculate cluster centers (only for clusters, not noise)
    const uniqueLabels = [...new Set(labels)].filter(label => label > 0);
    const centers: number[][] = [];
    for (const label of uniqueLabels) {
      const clusterPoints = pixels.filter((_, i) => labels[i] === label);
      const center = clusterPoints.reduce((acc, point) => {
        return acc.map((val, i) => val + point[i]);
      }, new Array(5).fill(0)).map(val => val / clusterPoints.length);
      centers.push(center.slice(0, 3));
    }

    // Visualization
    const vibrantColors = [
      [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255],
      [0, 255, 255], [255, 128, 0], [128, 0, 255], [255, 128, 128], [128, 255, 128]
    ];
    const segmentedData = new Uint8ClampedArray(data.length);
    const clusterStats: ClusterStat[] = [];
    const clusterImages: ImageData[] = [];

    for (let i = 0; i < uniqueLabels.length; i++) {
      const label = uniqueLabels[i];
      const clusterPixelIndices = labels.map((l, idx) => l === label ? idx : -1).filter(idx => idx !== -1);
      if (clusterPixelIndices.length > 0) {
        const dominantColor = vibrantColors[i % vibrantColors.length];
        clusterStats.push({
          clusterId: label,
          pixelCount: clusterPixelIndices.length,
          percentage: (clusterPixelIndices.length / pixels.length) * 100,
          dominantColor: dominantColor
        });
        const clusterImageData = new Uint8ClampedArray(data.length);
        clusterImageData.fill(0);
        for (const pixelIdx of clusterPixelIndices) {
          const dataIdx = pixelIdx * 4;
          clusterImageData[dataIdx] = dominantColor[0];
          clusterImageData[dataIdx + 1] = dominantColor[1];
          clusterImageData[dataIdx + 2] = dominantColor[2];
          clusterImageData[dataIdx + 3] = 255;
        }
        clusterImages.push(new ImageData(clusterImageData, width, height));
      }
    }
    for (let i = 0; i < labels.length; i++) {
      const dataIdx = i * 4;
      const clusterColor = labels[i] === -1 ? [0, 0, 0] : vibrantColors[labels[i] % vibrantColors.length];
      segmentedData[dataIdx] = clusterColor[0];
      segmentedData[dataIdx + 1] = clusterColor[1];
      segmentedData[dataIdx + 2] = clusterColor[2];
      segmentedData[dataIdx + 3] = 255;
    }

    return {
      labels,
      centers,
      clusterStats: clusterStats.sort((a, b) => b.percentage - a.percentage),
      segmentedImageData: new ImageData(segmentedData, width, height),
      clusterImages
    };
  }

  // ===== Mean Shift (optional, same as your implementation) =====
  private async meanShiftSegmentation(
    imageData: ImageData
  ): Promise<{
    labels: number[];
    centers: number[][];
    clusterStats: ClusterStat[];
    segmentedImageData: ImageData;
    clusterImages: ImageData[];
  }> {
    // (Same as your implementation)
    // ... (omitted for brevity, but you can keep your code here)
    throw new Error('Mean Shift implementation not included. Use your own or request it if needed.');
  }

  // ===== Public API =====
  async segmentImage(
    file: File,
    algorithm: 'kmeans' | 'dbscan' | 'meanshift',
    options: ProcessingOptions
  ): Promise<{
    algorithm: string;
    clusters: number;
    silhouetteScore: number;
    calinskiHarabasz: number;
    daviesBouldin: number;
    processingTime: number;
    originalImageUrl: string;
    segmentedImageUrl: string;
    clusterImageUrls: string[];
    edgeMapUrl?: string;
    preprocessedImageUrl?: string;
    clusterStats: ClusterStat[];
  }> {
    const startTime = performance.now();
    const preprocessedImage = await this.preprocessImage(file, options);
    let segmentationResult;
    if (algorithm === 'kmeans') {
      segmentationResult = await this.kMeansSegmentation(preprocessedImage, 5);
    } else if (algorithm === 'dbscan') {
      segmentationResult = await this.dbscanSegmentation(preprocessedImage);
    } else {
      segmentationResult = await this.meanShiftSegmentation(preprocessedImage);
    }
    const endTime = performance.now();

    // Convert ImageData to data URLs
    const originalImageUrl = await this.imageDataToDataUrl(preprocessedImage);
    const segmentedImageUrl = await this.imageDataToDataUrl(segmentationResult.segmentedImageData);
    const clusterImageUrls = await Promise.all(
      segmentationResult.clusterImages.map(imgData => this.imageDataToDataUrl(imgData))
    );

    // Placeholder metrics
    const silhouetteScore = 0.75;
    const calinskiHarabasz = 1500;
    const daviesBouldin = 0.5;

    let edgeMapUrl: string | undefined;
    if (options.edgeDetection) {
      const edgeImageData = this.applyEdgeDetection(preprocessedImage);
      edgeMapUrl = await this.imageDataToDataUrl(edgeImageData);
    }

    return {
      algorithm,
      clusters: segmentationResult.clusterStats.length,
      silhouetteScore,
      calinskiHarabasz,
      daviesBouldin,
      processingTime: (endTime - startTime) / 1000,
      originalImageUrl,
      segmentedImageUrl,
      clusterImageUrls,
      edgeMapUrl,
      preprocessedImageUrl: originalImageUrl,
      clusterStats: segmentationResult.clusterStats
    };
  }

  private imageDataToDataUrl(imageData: ImageData): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve('');
        }
      }, 'image/png');
    });
  }
}

git remote set-url origin https://github.com/Srivarun999/pixxel-prism-segment.git
git add .
git commit -m "Updated image segmentation algorithms"
git push -u origin main
