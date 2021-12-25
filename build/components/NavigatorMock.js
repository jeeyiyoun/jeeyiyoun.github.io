import { warnOnce } from "../utils/warnOnce.js";
class NavigatorMock {
    warning = () => {
        warnOnce("The Navigator API is only available inside of Framer: https://www.framer.com/");
    };
    goBack = () => this.warning();
    instant = () => this.warning();
    fade = () => this.warning();
    push = () => this.warning();
    modal = () => this.warning();
    overlay = () => this.warning();
    flip = () => this.warning();
    customTransition = () => this.warning();
    magicMotion = () => this.warning();
}
/**
 * @internal
 */
export const navigatorMock = new NavigatorMock();
//# sourceMappingURL=NavigatorMock.js.map