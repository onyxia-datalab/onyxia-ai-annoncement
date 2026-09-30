import type { OnyxiaCtx } from "./OnyxiaCtx";
import {
    type AnnouncementState,
    getAnnouncementState,
    subscribeToAnnouncementState,
    updateAnnouncementState
} from "./announcementState";
import { scrollToAndOpenLauncherAiAccordion } from "./launcherDom";

// TODO: Replace with the documentation page of the AI feature.
const LEARN_MORE_URL = "https://docs.sspcloud.fr";

let isReleaseDialogClosed = false;

export async function createComponents(ctx: OnyxiaCtx) {
    const [
        React,
        { tss },
        { routes, useRoute },
        { useLang },
        { PUBLIC_URL },
        { Dialog },
        { Button },
        { useCoreState },
        { Icon },
        { getIconUrlByName }
    ] = await Promise.all([
        ctx.import("react"),
        ctx.import("tss"),
        ctx.import("ui/routes"),
        ctx.import("ui/i18n"),
        ctx.import("env"),
        ctx.import("onyxia-ui/Dialog"),
        ctx.import("onyxia-ui/Button"),
        ctx.import("core"),
        ctx.import("onyxia-ui/Icon"),
        ctx.import("lazy-icons")
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

    function NewBadge() {
        const { classes } = useNewBadgeStyles();

        const isFrench = useIsFrench();

        return <span className={classes.root}>{isFrench ? "Nouveau" : "New"}</span>;
    }

    const useNewBadgeStyles = tss
        .withName("OnyxiaAiAnnouncementNewBadge")
        .create(({ theme }) => ({
            root: {
                display: "inline-block",
                padding: "1px 7px",
                borderRadius: 10,
                backgroundColor: theme.colors.useCases.alertSeverity.info.main,
                color: theme.colors.useCases.surfaces.background,
                fontSize: 11,
                fontWeight: 600,
                lineHeight: "16px",
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
                verticalAlign: "middle"
            }
        }));

    function LauncherAiAccordionBadge() {
        const { hasOpenedLauncherAiAccordion } = useAnnouncementState();

        if (hasOpenedLauncherAiAccordion) {
            return null;
        }

        return <NewBadge />;
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
                <NewBadge />
                <span className={classes.text}>
                    {isFrench ? (
                        <>
                            Ce service peut désormais utiliser un assistant IA,
                            préconfiguré avec les fournisseurs et le modèle choisis dans{" "}
                            <a {...accountAiTabLink}>Mon compte → IA</a>.
                        </>
                    ) : (
                        <>
                            This service can now use an AI assistant, preconfigured with
                            the providers and model you pick in{" "}
                            <a {...accountAiTabLink}>My account → AI</a>.
                        </>
                    )}
                </span>
                <button
                    type="button"
                    className={classes.goToAccordionButton}
                    onClick={scrollToAndOpenLauncherAiAccordion}
                >
                    {isFrench ? "Configurer l'assistant IA" : "Set up the AI assistant"}
                    <Icon icon={getIconUrlByName("ArrowDownward")} size="small" />
                </button>
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
                marginBottom: theme.spacing(3),
                padding: theme.spacing({ topBottom: 3, rightLeft: 4 }),
                borderRadius: 8,
                border: `1px solid ${theme.colors.useCases.alertSeverity.info.main}`,
                backgroundColor: theme.colors.useCases.alertSeverity.info.background,
                color: theme.colors.useCases.typography.textPrimary,
                ...theme.typography.variants["body 1"].style
            },
            text: {
                flex: 1,
                "& a": {
                    color: theme.colors.useCases.alertSeverity.info.main
                }
            },
            goToAccordionButton: {
                display: "inline-flex",
                alignItems: "center",
                gap: theme.spacing(2),
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                whiteSpace: "nowrap",
                color: theme.colors.useCases.alertSeverity.info.main,
                ...theme.typography.variants["label 1"].style
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

    function ReleaseDialog() {
        const { isReleaseDialogDismissed } = useAnnouncementState();

        const { isUserLoggedIn } = useCoreState("userAuthentication", "main");

        const route = useRoute();

        // NOTE: Closing without ticking the checkbox only hides it until the next page load.
        // Kept outside of React so that a remount of the plugin component does not reopen it.
        const [isClosed, setIsClosed] = React.useState(isReleaseDialogClosed);
        const [doNotShowAgain, setDoNotShowAgain] = React.useState(false);

        const { classes } = useReleaseDialogStyles();

        const isFrench = useIsFrench();

        const close = () => {
            isReleaseDialogClosed = true;
            setIsClosed(true);

            if (doNotShowAgain) {
                updateAnnouncementState({ isReleaseDialogDismissed: true });
            }
        };

        return (
            <Dialog
                isOpen={isUserLoggedIn && !isReleaseDialogDismissed && !isClosed}
                onClose={close}
                showCloseButton={true}
                maxWidth={false}
                muiDialogClasses={{ paper: classes.paper }}
                title={
                    isFrench
                        ? "Les modèles d'IA sont disponibles dans vos services"
                        : "AI models are now available in your services"
                }
                body={
                    <>
                        <img
                            className={classes.cover}
                            src={`${PUBLIC_URL}/custom-resources/assets/ai-release-cover.jpg`}
                            alt=""
                        />
                        {isFrench
                            ? "Connectez des fournisseurs d'IA, choisissez vos modèles et utilisez-les directement dans les services Onyxia compatibles."
                            : "Connect AI providers, choose your models, and use them directly in compatible Onyxia services."}
                    </>
                }
                doNotShowNextTimeText={
                    isFrench
                        ? "Ne plus afficher ce message"
                        : "Do not show this message again"
                }
                onDoShowNextTimeValueChange={doShowNextTime =>
                    setDoNotShowAgain(!doShowNextTime)
                }
                buttons={
                    <>
                        <Button variant="secondary" href={LEARN_MORE_URL}>
                            {isFrench ? "En savoir plus" : "Learn more"}
                        </Button>
                        <Button
                            onClick={() => {
                                close();

                                if (
                                    route.name === "account" &&
                                    route.params.tabId === "ai"
                                ) {
                                    return;
                                }

                                routes.account({ tabId: "ai" }).push();
                            }}
                        >
                            {isFrench
                                ? "Configurer les fournisseurs d'IA"
                                : "Set up AI providers"}
                        </Button>
                    </>
                }
            />
        );
    }

    const useReleaseDialogStyles = tss
        .withName("OnyxiaAiAnnouncementReleaseDialog")
        .create(({ theme }) => ({
            paper: {
                width: 717,
                maxWidth: "calc(100% - 32px)"
            },
            cover: {
                display: "block",
                width: "100%",
                height: 200,
                objectFit: "cover",
                marginBottom: theme.spacing(4)
            }
        }));

    return {
        ReleaseDialog,
        LauncherAiAccordionBadge,
        LauncherAiNotice
    };
}
