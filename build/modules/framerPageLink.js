import { isString } from "../utils/utils.js";
import { isRoute } from "./useNavigate.js";
function isTransition(value) {
    switch (value) {
        case "instant":
        case "push":
        case "fade":
            return true;
        default:
            return false;
    }
}
const framerPageLinkAttributeVerification = {
    transition: isTransition,
};
// This includes the comma that separates the media type from the data.
const mediaType = "framer/page-link,";
/**
 * @internal
 */
export function isFramerPageLink(value) {
    return isString(value) && value.startsWith(`data:${mediaType}`);
}
/**
 * @internal
 */
export function createFramerPageLink(targetId = null, options = {}) {
    const target = targetId ? targetId : "none";
    const link = new URL(`data:${mediaType}${target}`);
    for (const optionKey in options)
        link.searchParams.append(optionKey, options[optionKey]);
    return link.href;
}
/**
 * @internal
 */
export function parseFramerPageLink(link) {
    if (!isFramerPageLink(link))
        return;
    try {
        const url = new URL(link);
        const target = url.pathname.substring(mediaType.length);
        const attributes = {};
        url.searchParams.forEach((value, key) => {
            if (key in framerPageLinkAttributeVerification)
                attributes[key] = value;
        });
        return {
            target: target === "none" ? null : target,
            attributes,
            attributeString: url.search.substring(1),
        };
    }
    catch {
        return;
    }
}
/** A regex that searches for html tags, and href values. */
const regex = /(<([a-z]+)(?:\s+(?!href[\s=])[^=\s]+=(?:'[^']*'|"[^"]*"))*)(?:(\s+href\s*=)(?:'([^']*)'|"([^"]*)"))?((?:\s+[^=\s]+=(?:'[^']*'|"[^"]*"))*>)/gi;
/**
 * Escape html characters that would result in invalid paths.
 * https://www.30secondsofcode.org/js/s/escape-html
 */
const escapeHTML = (str) => str.replace(/[&<>'"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
}[tag] || tag));
/**
 * @internal
 */
export function replaceFramerPageLinks(rawHTML, routes) {
    return rawHTML.replace(regex, (original, pre1, tag, pre2, value1, value2, post) => {
        if (tag.toLowerCase() !== "a")
            return original;
        const pageLink = parseFramerPageLink(value1 || value2);
        if (!pageLink || !pageLink.target)
            return original;
        const route = routes[pageLink.target];
        if (!route || !isRoute(route) || !route.path)
            return original;
        const attributes = ` ${"data-framer-page-link-target" /* Page */}="${pageLink.target}" ${"data-framer-page-link-transition" /* Transition */}="${pageLink.attributeString}"`;
        return pre1 + pre2 + `"${escapeHTML(route.path)}"` + attributes + post;
    });
}
//# sourceMappingURL=framerPageLink.js.map