export interface ColorLayer {
    color: string;
    maxVelocity?: number;
    orbs?: number;
    radius?: number;
    splitX?: number;
    splitY?: number;
}
export interface GaussianBackgroundOptions {
    blurRadius?: number;
    fpsCap?: number;
    scale?: number;
}
declare class GaussianBackground {
    private fpsAverage?;
    private canvas;
    private context;
    private animationFrame;
    private timestep;
    private firstCallTime;
    private lastCallTime;
    private timeElapsed;
    private fpsTotal;
    private layers;
    private options;
    constructor(node: HTMLCanvasElement, options?: GaussianBackgroundOptions);
    run(layers: ColorLayer[]): void;
    private generateLayer;
    private createOrb;
    private displayLoop;
    drawBackground(): void;
    private drawBlur;
    private updateLayers;
    updateOptions({ blurRadius, fpsCap, scale, }: Partial<GaussianBackgroundOptions>): void;
    prototype(): void;
    play(): void;
}
export default GaussianBackground;
