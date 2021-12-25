import type { NavigationInterface } from "./Navigation.js";
declare class NavigatorMock implements NavigationInterface {
    warning: () => void;
    goBack: () => void;
    instant: () => void;
    fade: () => void;
    push: () => void;
    modal: () => void;
    overlay: () => void;
    flip: () => void;
    customTransition: () => void;
    magicMotion: () => void;
}
/**
 * @internal
 */
export declare const navigatorMock: NavigatorMock;
export {};
//# sourceMappingURL=NavigatorMock.d.ts.map