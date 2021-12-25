import type { Transition } from "framer-motion";
import type { FrameProps, FrameLayoutProperties } from "../render/presentation/Frame/index.js";
/**
 * @public
 */
export declare type NavigationTransitionSide = "left" | "right" | "top" | "bottom";
/**
 * @public
 */
export declare type NavigationTransitionPosition = Partial<Pick<FrameLayoutProperties, "top" | "right" | "bottom" | "left" | "center">>;
/**
 * @public
 */
export interface NavigationTransitionAnimation {
    /**
     * The animation defaults.
     */
    animation?: Transition;
}
/**
 * @public
 */
export interface NavigationTransitionBackdropColor {
    /**
     * Defines the backdrop color when the incoming screen is rendered over the current context. Defaults to the iOS dim color.
     */
    backdropColor?: string;
}
/**
 * @public
 */
export interface NavigationTransitionAppearsFrom extends NavigationTransitionAnimation {
    /**
     * Defines which side the target will appear from.
     * @remarks
     *
     * - `"left"`
     * - `"right"`
     * - `"top"`
     * - `"bottom"`
     */
    appearsFrom?: NavigationTransitionSide;
}
/**
 * @public
 */
export declare type FadeTransitionOptions = NavigationTransitionAnimation;
/**
 * @public
 */
export interface PushTransitionOptions extends NavigationTransitionAnimation, NavigationTransitionAppearsFrom {
}
/**
 * @public
 */
export interface ModalTransitionOptions extends NavigationTransitionAnimation, NavigationTransitionBackdropColor {
}
/**
 * @public
 */
export interface OverlayTransitionOptions extends NavigationTransitionAnimation, NavigationTransitionAppearsFrom, NavigationTransitionBackdropColor {
}
/**
 * @public
 */
export interface FlipTransitionOptions extends NavigationTransitionAnimation, NavigationTransitionAppearsFrom {
}
/**
 * Can be used to define a custom navigation transition.
 * @public
 */
export interface NavigationTransition extends NavigationTransitionAnimation, NavigationTransitionBackdropColor {
    /**
     * Defines the begin state of the incoming screen wrapper.
     */
    enter?: Partial<FrameProps>;
    /**
     * Defines the end state of the outgoing screen wrapper.
     */
    exit?: Partial<FrameProps>;
    /**
     * Defines the position and size of the incoming screen wrapper. Defaults to top, right, bottom, and left of 0.
     */
    position?: NavigationTransitionPosition;
    /**
     * Defines whether the incoming screen should render over the current context, like an overlay or modal. Defaults to false.
     */
    overCurrentContext?: boolean;
    /**
     * Defines whether a tap in the background should dismiss the screen presented over the current context. Defaults to true.
     */
    goBackOnTapOutside?: boolean;
    /**
     * Defines whether the backface of the incoming and outgoing screens should be visible, necessary for certain 3D transitions. Defaults to true.
     */
    backfaceVisible?: boolean;
    /**
     * Defines whether the incoming and outgoing screens should auto animate their children. Defaults to false.
     */
    withMagicMotion?: boolean;
}
/**
 * @internal
 */
export declare namespace TransitionDefaults {
    const Fade: NavigationTransition;
    const PushLeft: NavigationTransition;
    const PushRight: NavigationTransition;
    const PushUp: NavigationTransition;
    const PushDown: NavigationTransition;
    const Instant: NavigationTransition;
    const Modal: NavigationTransition;
    const OverlayLeft: NavigationTransition;
    const OverlayRight: NavigationTransition;
    const OverlayUp: NavigationTransition;
    const OverlayDown: NavigationTransition;
    const FlipLeft: NavigationTransition;
    const FlipRight: NavigationTransition;
    const FlipUp: NavigationTransition;
    const FlipDown: NavigationTransition;
    const MagicMotion: NavigationTransition;
}
/**
 * @internal
 */
export declare function pushTransition(options: NavigationTransitionAppearsFrom | undefined): NavigationTransition;
/**
 * @internal
 */
export declare function overlayTransition(options: NavigationTransitionAppearsFrom | undefined): NavigationTransition;
/**
 * @internal
 */
export declare function flipTransition(options: NavigationTransitionAppearsFrom | undefined): NavigationTransition;
//# sourceMappingURL=NavigationTransitions.d.ts.map