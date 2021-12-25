import * as React from "react";
import { DeprecatedFrameWithEventsProps, FrameProps } from "../render/presentation/Frame/index.js";
import { Transition } from "framer-motion";
import type { NavigationTransitionPosition } from "./NavigationTransitions.js";
export interface Props {
    index: number;
    isLayeredContainer?: boolean;
    position: NavigationTransitionPosition | undefined;
    isInitial?: boolean;
    initialProps?: Partial<FrameProps> | undefined;
    transitionProps: Partial<FrameProps> | undefined;
    exitProps?: Partial<FrameProps> | undefined;
    instant: boolean;
    animation: Transition;
    exitAnimation?: Transition;
    visible: boolean;
    backfaceVisible?: boolean;
    exitBackfaceVisible?: boolean;
    onTapBackdrop?: (() => void) | undefined;
    backdropColor?: string | undefined;
    withMagicMotion?: boolean;
    areMagicMotionLayersPresent?: false | undefined;
    isPrevious?: boolean;
    isCurrent?: boolean;
    isOverlayed?: boolean;
    children: React.ReactNode;
    id?: string;
    withOverflowScrolling?: boolean;
}
export declare type AnimatingProperties = Partial<DeprecatedFrameWithEventsProps> & {
    dimOpacity: number;
};
export declare const NavigationContainer: React.NamedExoticComponent<Props>;
export declare const allAnimatableProperties: Partial<FrameProps>;
//# sourceMappingURL=NavigationContainer.d.ts.map