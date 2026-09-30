import { createComponents } from "./components";
import { inject, onDomChange } from "./inject";
import { updateAnnouncementState } from "./announcementState";
import {
    getLauncherAiAccordion,
    getLauncherFirstAccordionIfAiGroup
} from "./launcherDom";

/** After this date the plugin does nothing, no need to redeploy to end the announcement. */
const ANNOUNCEMENT_END_DATE = new Date("2026-10-31T23:59:59");

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
        getTarget: getLauncherFirstAccordionIfAiGroup,
        position: "before",
        hostStyle: { display: "block" },
        Component: LauncherAiNotice
    });
};
