export { BackgroundImage };
/** @public */
export declare type ImageFit = "fill" | "fit" | "stretch";
/** @public */
interface BackgroundImage {
    src: string;
    pixelWidth?: number;
    pixelHeight?: number;
    intrinsicWidth?: number;
    intrinsicHeight?: number;
    fit?: ImageFit;
}
/** @public */
declare namespace BackgroundImage {
    const isImageObject: (image: any) => image is object & BackgroundImage;
}
//# sourceMappingURL=BackgroundImage.d.ts.map