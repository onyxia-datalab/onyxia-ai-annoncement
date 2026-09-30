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

    const { ReleaseDialog, LauncherAiAccordionBadge, LauncherAiNotice } =
        await createComponents(ctx);

    onDomChange(() => {
        if (
            getLauncherAiAccordion()?.querySelector(
                '.MuiAccordionSummary-root[aria-expanded="true"]'
            ) != null
        ) {
            updateAnnouncementState({ hasOpenedLauncherAiAccordion: true });
        }
    });

    // NOTE: The dialog renders itself in a MUI portal, the host only keeps it mounted.
    inject({
        ctx,
        getTarget: () => document.body,
        position: "append",
        hostStyle: { display: "none" },
        Component: ReleaseDialog
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
