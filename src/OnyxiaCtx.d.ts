export type { OnyxiaCtx } from "../../src/pluginSystem/pluginSystem";

declare global {
    interface Window {
        onOnyxiaCtxReady?: (onyxiaCtx: OnyxiaCtx) => void;
    }
}
