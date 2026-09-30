import type { ReactNode } from "react";
import type { OnyxiaCtx } from "./OnyxiaCtx";

const domChangeListeners = new Set<() => void>();

/**
 * Calls `listener` now and after every DOM mutation.
 * A single MutationObserver is shared by all listeners.
 */
export function onDomChange(listener: () => void) {
    if (domChangeListeners.size === 0) {
        new MutationObserver(() =>
            domChangeListeners.forEach(listener => listener())
        ).observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["aria-expanded"]
        });
    }

    domChangeListeners.add(listener);

    listener();
}

/**
 * Renders `Component` next to (or inside) an element owned by Onyxia, without replacing it.
 *
 * `declareComponent().mount()` hides every child of the element it mounts into,
 * so we create our own host element, insert it where we want, and mount into it.
 * The host is re-placed if React moves things around, and re-created if the target
 * element is re-rendered from scratch.
 */
export function inject(params: {
    ctx: OnyxiaCtx;
    getTarget: () => Element | null;
    position: "append" | "before";
    hostStyle?: Partial<CSSStyleDeclaration>;
    Component: () => ReactNode;
}) {
    const { ctx, getTarget, position, hostStyle = {}, Component } = params;

    const { mount } = ctx.declareComponent(Component);

    let target_current: Element | null = null;
    let host: HTMLElement | undefined = undefined;

    onDomChange(() => {
        const target = getTarget();

        if (target !== target_current) {
            target_current = target;

            host?.remove();
            host = undefined;

            if (target === null) {
                mount(null);
                return;
            }

            host = document.createElement("span");
            host.setAttribute("data-onyxia-ai-announcement", "");
            Object.assign(host.style, hostStyle);
        }

        if (target === null || host === undefined) {
            return;
        }

        switch (position) {
            case "append":
                if (host.parentElement !== target || host.nextSibling !== null) {
                    target.appendChild(host);
                }
                break;
            case "before":
                if (host.nextSibling !== target) {
                    target.before(host);
                }
                break;
        }

        if (host.childElementCount === 0) {
            mount(host);
        }
    });
}
