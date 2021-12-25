import { runtime } from "../../utils/runtimeInjection.js";
import { RenderTarget } from "../types/RenderEnvironment.js";
// #region copied from src/app/assets/src/assetReference.ts to remove dependency on assets.
// This includes the comma that separates the media type from the data.
const mediaType = "framer/asset-reference,";
export function isAssetReference(value) {
    return value.startsWith(`data:${mediaType}`);
}
// #endregion
/**
 * @internal
 */
export function imageUrlForAsset(asset, size) {
    if (/^\w+:/.test(asset) && !isAssetReference(asset))
        return asset;
    if (typeof size !== "number")
        size = undefined;
    else if (size <= 512)
        size = 512;
    else if (size <= 1024)
        size = 1024;
    else if (size <= 2048)
        size = 2048;
    else
        size = 4096;
    const isExport = RenderTarget.current() === RenderTarget.export;
    return runtime.assetResolver(asset, { size, isExport }) ?? "";
}
//# sourceMappingURL=imageUrlForAsset.js.map