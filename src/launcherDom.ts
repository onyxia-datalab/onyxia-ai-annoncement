/** Title of the top level group in the InseeFrLab interactive services charts (`properties.ai`). */
const LAUNCHER_AI_GROUP_TITLE = "AI Assistant";

function isTopLevelAccordion(element: Element) {
    // NOTE: Some charts also have a nested `userPreferences.aiAssistant` group with the same title.
    return element.parentElement?.closest("[data-title]") === null;
}

export function getLauncherAiAccordion(): Element | null {
    for (const element of document.querySelectorAll(
        `[data-title="${LAUNCHER_AI_GROUP_TITLE}"]`
    )) {
        if (isTopLevelAccordion(element)) {
            return element;
        }
    }

    return null;
}

/** Only set when the chart has an AI Assistant group, so the notice is not shown for other services. */
export function getLauncherFirstAccordionIfAiGroup(): Element | null {
    if (getLauncherAiAccordion() === null) {
        return null;
    }

    for (const element of document.querySelectorAll("[data-title]")) {
        if (isTopLevelAccordion(element)) {
            return element;
        }
    }

    return null;
}

export function scrollToAndOpenLauncherAiAccordion() {
    const accordion = getLauncherAiAccordion();

    if (accordion === null) {
        return;
    }

    accordion.scrollIntoView({ behavior: "smooth", block: "start" });

    const summary = accordion.querySelector<HTMLElement>(".MuiAccordionSummary-root");

    if (summary !== null && summary.getAttribute("aria-expanded") !== "true") {
        summary.click();
    }
}
