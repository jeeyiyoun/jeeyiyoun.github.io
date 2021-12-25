import * as React from "react";
import type { BackgroundImage } from "../types/BackgroundImage.js";
import type { MotionDivProps } from "./Frame/types.js";
/** @public */
interface BackgroundImageProps {
    background: Exclude<BackgroundImage, "src"> & {
        src: string | undefined;
    };
}
/** @public */
interface ImageProps extends MotionDivProps, BackgroundImageProps {
}
/** @public */
export declare const Image: React.ForwardRefExoticComponent<Partial<ImageProps> & React.RefAttributes<HTMLDivElement>>;
export {};
//# sourceMappingURL=Image.d.ts.map