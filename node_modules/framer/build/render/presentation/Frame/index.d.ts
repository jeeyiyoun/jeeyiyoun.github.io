import * as React from "react";
import { WithEventsProperties } from "../../../components/hoc/WithEvents.js";
import { DeprecatedCoreFrameProps } from "./DeprecatedFrame.js";
import { FrameProps } from "./FrameWithMotion.js";
export { isDeprecatedFrameProps } from "./isDeprecatedFrameProps.js";
export { DeprecatedFrame } from "./DeprecatedFrame.js";
export type { DeprecatedCoreFrameProps, DeprecatedFrameProperties } from "./DeprecatedFrame.js";
export { FrameWithMotion } from "./FrameWithMotion.js";
export type { FrameProps } from "./FrameWithMotion.js";
export type { BaseFrameProps, FrameLayoutProperties, CSSTransformProperties, VisualProperties } from "./types.js";
/** @public */
export declare type DeprecatedFrameWithEventsProps = DeprecatedCoreFrameProps & WithEventsProperties;
/** @public */
export declare const DeprecatedFrameWithEvents: React.ComponentClass<Partial<DeprecatedFrameWithEventsProps>>;
/** @public */
export declare const Frame: React.ForwardRefExoticComponent<Partial<FrameProps> & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=index.d.ts.map