import { createComponents } from "./components";
import { inject, onDomChange } from "./inject";
import { updateAnnouncementState } from "./announcementState";

/** After this date the plugin does nothing, no need to redeploy to end the announcement. */
const ANNOUNCEMENT_END_DATE = new Date("2026-12-31T23:59:59");

/** Title of the top level group in the InseeFrLab interactive services charts (`properties.ai`). */
const LAUNCHER_AI_GROUP_TITLE = "AI Assistant";

function getLauncherAiAccordion(): Element | null {
    for (const element of document.querySelectorAll(
        `[data-title="${LAUNCHER_AI_GROUP_TITLE}"]`
    )) {
        // NOTE: Some charts also have a nested `userPreferences.aiAssistant` group with the same title.
        if (element.parentElement?.closest("[data-title]") === null) {
            return element;
        }
    }

    return null;
}

window.onOnyxiaCtxReady = async ctx => {
    if (Date.now() > ANNOUNCEMENT_END_DATE.getTime()) {
        return;
    }

    const {
        LeftBarAccountBadge,
        AccountAiTabBadge,
        LauncherAiAccordionBadge,
        LauncherAiNotice
    } = await createComponents(ctx);

    onDomChange(() => {
        if (/\/account\/ai\/?$/.test(location.pathname)) {
            updateAnnouncementState({ hasVisitedAiTab: true });
        }

        if (
            getLauncherAiAccordion()?.querySelector(
                '.MuiAccordionSummary-root[aria-expanded="true"]'
            ) != null
        ) {
            updateAnnouncementState({ hasOpenedLauncherAiAccordion: true });
        }
    });

    inject({
        ctx,
        getTarget: () => document.querySelector("a#account > div:first-child"),
        position: "append",
        hostStyle: {
            position: "absolute",
            top: "6px",
            right: "12px",
            zIndex: "3"
        },
        Component: LeftBarAccountBadge
    });

    inject({
        ctx,
        getTarget: () => document.querySelector('[data-onyxia-anchor="account-tab-ai"]'),
        position: "append",
        hostStyle: { display: "inline-flex", marginLeft: "8px" },
        Component: AccountAiTabBadge
    });

    inject({
        ctx,
        getTarget: () =>
            getLauncherAiAccordion()?.querySelector(".MuiAccordionSummary-content") ??
            null,
        position: "append",
        hostStyle: { display: "inline-flex", alignSelf: "center" },
        Component: LauncherAiAccordionBadge
    });

    inject({
        ctx,
        getTarget: getLauncherAiAccordion,
        position: "before",
        hostStyle: { display: "block" },
        Component: LauncherAiNotice
    });
};
