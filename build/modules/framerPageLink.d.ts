import { Routes } from "./useNavigate.js";
/**
 * @internal
 */
export declare type FramerPageLinkTransitionOption = "instant" | "push" | "fade";
/**
 * @internal
 */
export interface FramerPageLinkAttributes {
    transition?: FramerPageLinkTransitionOption;
}
/**
 * @internal
 */
export declare function isFramerPageLink(value: unknown): value is string;
/**
 * @internal
 */
export declare function createFramerPageLink(targetId?: string | null, options?: FramerPageLinkAttributes): string;
/**
 * @internal
 */
export interface PageLinkParsedResult {
    target: string | null;
    attributes: FramerPageLinkAttributes;
    attributeString: string;
}
/**
 * @internal
 */
export declare function parseFramerPageLink(link: unknown): PageLinkParsedResult | undefined;
/**
 * @internal
 */
export declare const enum PageLinkAttribute {
    Page = "data-framer-page-link-target",
    Transition = "data-framer-page-link-transition"
}
/**
 * @internal
 */
export declare function replaceFramerPageLinks(rawHTML: string, routes: Routes): string;
//# sourceMappingURL=framerPageLink.d.ts.map