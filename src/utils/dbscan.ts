export class DBSCAN3D {
    constructor(
        private eps: number = 30,
        private minPts: number = 4
    ) {}

    fit(data: number[][]): number[] {
        const labels: number[] = new Array(data.length).fill(-1);
        let clusterId = 0;

        for (let pointIdx = 0; pointIdx < data.length; pointIdx++) {
            if (labels[pointIdx] !== -1) continue;

            const neighbors = this.getNeighbors(data, pointIdx);
            if (neighbors.length < this.minPts) {
                labels[pointIdx] = 0; // Noise point
                continue;
            }

            clusterId++;
            labels[pointIdx] = clusterId;
            
            const queue = [...neighbors];
            while (queue.length > 0) {
                const currentPoint = queue.shift()!;
                
                if (labels[currentPoint] === 0) { // Noise becomes border point
                    labels[currentPoint] = clusterId;
                    continue;
                }
                
                if (labels[currentPoint] !== -1) continue;
                
                labels[currentPoint] = clusterId;
                
                const currentNeighbors = this.getNeighbors(data, currentPoint);
                if (currentNeighbors.length >= this.minPts) {
                    queue.push(...currentNeighbors.filter(n => labels[n] === -1));
                }
            }
        }

        return labels;
    }

    private getNeighbors(data: number[][], pointIdx: number): number[] {
        const neighbors: number[] = [];
        for (let i = 0; i < data.length; i++) {
            if (i !== pointIdx && this.calculateDistance(data[pointIdx], data[i]) <= this.eps) {
                neighbors.push(i);
            }
        }
        return neighbors;
    }

    private calculateDistance(point1: number[], point2: number[]): number {
        const colorDist = Math.sqrt(
            Math.pow(point1[0] - point2[0], 2) +
            Math.pow(point1[1] - point2[1], 2) +
            Math.pow(point1[2] - point2[2], 2)
        );
        const spatialDist = Math.sqrt(
            Math.pow(point1[3] - point2[3], 2) +
            Math.pow(point1[4] - point2[4], 2)
        );
        return colorDist + spatialDist * 0.3; // Weight spatial coordinates less
    }
}