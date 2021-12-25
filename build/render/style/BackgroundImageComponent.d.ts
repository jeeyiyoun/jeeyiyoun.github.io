/// <reference types="react" />
import type { BackgroundImage } from "../types/BackgroundImage.js";
import type { Size } from "../types/Size.js";
export declare function cssImageRendering(image: BackgroundImage, containerSize?: Size): "auto" | "pixelated";
interface Props {
    image: BackgroundImage;
    containerSize?: Size;
    nodeId?: string;
    layoutId?: string;
}
export declare function BackgroundImageComponent({ layoutId, ...rest }: Props): JSX.Element;
export {};
//# sourceMappingURL=BackgroundImageComponent.d.ts.map