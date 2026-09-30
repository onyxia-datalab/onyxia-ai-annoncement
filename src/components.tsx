import type { OnyxiaCtx } from "./OnyxiaCtx";
import {
    type AnnouncementState,
    getAnnouncementState,
    subscribeToAnnouncementState,
    updateAnnouncementState
} from "./announcementState";

export async function createComponents(ctx: OnyxiaCtx) {
    const [React, { tss }, { routes }, { useLang }] = await Promise.all([
        ctx.import("react"),
        ctx.import("tss"),
        ctx.import("ui/routes"),
        ctx.import("ui/i18n")
    ]);

    function useAnnouncementState(): AnnouncementState {
        return React.useSyncExternalStore(
            subscribeToAnnouncementState,
            getAnnouncementState
        );
    }

    function useIsFrench() {
        const { lang } = useLang();

        return lang === "fr";
    }

    function NewBadge(props: { variant: "pill" | "dot" }) {
        const { variant } = props;

        const { classes } = useNewBadgeStyles();

        const isFrench = useIsFrench();

        if (variant === "dot") {
            return <span className={classes.dot} aria-hidden="true" />;
        }

        return <span className={classes.pill}>{isFrench ? "Nouveau" : "New"}</span>;
    }

    const useNewBadgeStyles = tss
        .withName("OnyxiaAiAnnouncementNewBadge")
        .create(({ theme }) => ({
            pill: {
                display: "inline-block",
                padding: "1px 7px",
                borderRadius: 10,
                backgroundColor: theme.colors.useCases.typography.textFocus,
                color: theme.colors.useCases.surfaces.background,
                fontSize: 11,
                fontWeight: 600,
                lineHeight: "16px",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
                verticalAlign: "middle",
                // NOTE: The badge may be portaled inside a link owned by Onyxia. React events
                // follow the React tree, so a click here would skip the link's SPA onClick.
                pointerEvents: "none"
            },
            dot: {
                display: "block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: theme.colors.useCases.typography.textFocus,
                boxShadow: `0 0 0 2px ${theme.colors.useCases.surfaces.background}`,
                pointerEvents: "none"
            }
        }));

    function LeftBarAccountBadge() {
        const { hasVisitedAiTab } = useAnnouncementState();

        if (hasVisitedAiTab) {
            return null;
        }

        return <NewBadge variant="dot" />;
    }

    function AccountAiTabBadge() {
        const { hasVisitedAiTab } = useAnnouncementState();

        // NOTE: Keep it visible during the first visit so the user sees what was new.
        const [hadVisitedAiTabOnMount] = React.useState(hasVisitedAiTab);

        if (hadVisitedAiTabOnMount) {
            return null;
        }

        return <NewBadge variant="pill" />;
    }

    function LauncherAiAccordionBadge() {
        const { hasOpenedLauncherAiAccordion } = useAnnouncementState();

        if (hasOpenedLauncherAiAccordion) {
            return null;
        }

        return <NewBadge variant="pill" />;
    }

    function LauncherAiNotice() {
        const { isLauncherNoticeDismissed } = useAnnouncementState();

        const { classes } = useLauncherAiNoticeStyles();

        const isFrench = useIsFrench();

        if (isLauncherNoticeDismissed) {
            return null;
        }

        const accountAiTabLink = routes.account({ tabId: "ai" }).link;

        return (
            <div className={classes.root} role="note">
                <NewBadge variant="pill" />
                <span className={classes.text}>
                    {isFrench ? (
                        <>
                            Ce service peut désormais utiliser un assistant IA. Choisissez
                            vos fournisseurs et votre modèle par défaut dans{" "}
                            <a {...accountAiTabLink}>Mon compte → IA</a>, ils seront
                            préconfigurés dans la section « AI Assistant » ci-dessous.
                        </>
                    ) : (
                        <>
                            This service can now use an AI assistant. Pick your providers
                            and default model in{" "}
                            <a {...accountAiTabLink}>My account → AI</a>, they will be
                            preconfigured in the “AI Assistant” section below.
                        </>
                    )}
                </span>
                <button
                    type="button"
                    className={classes.closeButton}
                    aria-label={isFrench ? "Masquer" : "Dismiss"}
                    onClick={() =>
                        updateAnnouncementState({ isLauncherNoticeDismissed: true })
                    }
                >
                    ×
                </button>
            </div>
        );
    }

    const useLauncherAiNoticeStyles = tss
        .withName("OnyxiaAiAnnouncementLauncherNotice")
        .create(({ theme }) => ({
            root: {
                display: "flex",
                alignItems: "center",
                gap: theme.spacing(3),
                margin: `${theme.spacing(3)}px 0`,
                padding: theme.spacing({ topBottom: 3, rightLeft: 4 }),
                borderRadius: 8,
                backgroundColor: theme.colors.useCases.surfaces.surfaceFocus1,
                color: theme.colors.useCases.typography.textPrimary,
                ...theme.typography.variants["body 1"].style
            },
            text: {
                flex: 1,
                "& a": {
                    color: theme.colors.useCases.typography.textFocus
                }
            },
            closeButton: {
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 20,
                lineHeight: 1,
                color: theme.colors.useCases.typography.textSecondary
            }
        }));

    return {
        LeftBarAccountBadge,
        AccountAiTabBadge,
        LauncherAiAccordionBadge,
        LauncherAiNotice
    };
}
