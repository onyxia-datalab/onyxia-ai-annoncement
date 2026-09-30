import type { OnyxiaCtx } from "./OnyxiaCtx";
import {
    type AnnouncementState,
    getAnnouncementState,
    subscribeToAnnouncementState,
    updateAnnouncementState
} from "./announcementState";
import { scrollToAndOpenLauncherAiAccordion } from "./launcherDom";

// TODO: Replace with the documentation page of the AI feature.
const LEARN_MORE_URL =
    "https://www.sspcloud.fr/document?path=SSPCloud%E2%90%A3Documentation%E2%80%BAUsing%E2%90%A3the%E2%90%A3Datalab%E2%80%BAUsing%E2%90%A3AI%E2%90%A3models%E2%90%A3in%E2%90%A3the%E2%90%A3Datalab";

// NOTE: Resolved from this bundle (`js/index.mjs`) so it works wherever the plugin
// is placed in the custom resources.
const RELEASE_DIALOG_COVER_URL = new URL(
    "../assets/ai-release-cover.jpg",
    import.meta.url
).href;

let isReleaseDialogClosed = false;

export async function createComponents(ctx: OnyxiaCtx) {
    const [
        React,
        { tss },
        { routes, useRoute },
        { useLang },
        { Dialog },
        { Button },
        { useCoreState },
        { Icon },
        { IconButton },
        { getIconUrlByName }
    ] = await Promise.all([
        ctx.import("react"),
        ctx.import("tss"),
        ctx.import("ui/routes"),
        ctx.import("ui/i18n"),
        ctx.import("onyxia-ui/Dialog"),
        ctx.import("onyxia-ui/Button"),
        ctx.import("core"),
        ctx.import("onyxia-ui/Icon"),
        ctx.import("onyxia-ui/IconButton"),
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

    function NewBadge(props: { size: "small" | "medium" }) {
        const { size } = props;

        const { classes, cx } = useNewBadgeStyles();

        const isFrench = useIsFrench();

        return (
            <span className={cx(classes.root, size === "small" && classes.small)}>
                {isFrench ? "Nouveau" : "New"}
            </span>
        );
    }

    const useNewBadgeStyles = tss
        .withName("OnyxiaAiAnnouncementNewBadge")
        .create(({ theme }) => ({
            root: {
                display: "inline-block",
                padding: theme.spacing({ topBottom: 1, rightLeft: 3 }),
                borderRadius: 100,
                backgroundColor: theme.colors.useCases.alertSeverity.info.main,
                // NOTE: Dark text in both modes, the info color is light.
                color: theme.colors.palette.dark.main,
                whiteSpace: "nowrap",
                verticalAlign: "middle",
                ...theme.typography.variants["label 2"].style
            },
            small: {
                padding: "1px 7px",
                fontSize: 11,
                lineHeight: "16px"
            }
        }));

    // NOTE: Shown as long as the notice at the top of the launcher is.
    function LauncherAiAccordionBadge() {
        const { isLauncherNoticeDismissed } = useAnnouncementState();

        if (isLauncherNoticeDismissed) {
            return null;
        }

        return <NewBadge size="small" />;
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
                <NewBadge size="medium" />
                <div className={classes.text}>
                    <span className={classes.title}>
                        {isFrench
                            ? "Ce service peut désormais utiliser un assistant IA"
                            : "This service can now use an AI assistant"}
                    </span>
                    <span className={classes.subtitle}>
                        {isFrench ? (
                            <>
                                Gérez vos fournisseurs depuis{" "}
                                <a {...accountAiTabLink}>votre compte</a>.
                            </>
                        ) : (
                            <>
                                Manage your providers from{" "}
                                <a {...accountAiTabLink}>your account</a>.
                            </>
                        )}
                    </span>
                </div>
                <button
                    type="button"
                    className={classes.goToAccordionButton}
                    onClick={scrollToAndOpenLauncherAiAccordion}
                >
                    {isFrench ? "Configurer l'assistant IA" : "Set up the AI assistant"}
                    <Icon
                        className={classes.goToAccordionButtonIcon}
                        icon={getIconUrlByName("ArrowDownward")}
                    />
                </button>
                <IconButton
                    icon={getIconUrlByName("Close")}
                    aria-label={isFrench ? "Masquer" : "Dismiss"}
                    onClick={() =>
                        updateAnnouncementState({ isLauncherNoticeDismissed: true })
                    }
                />
            </div>
        );
    }

    const useLauncherAiNoticeStyles = tss
        .withName("OnyxiaAiAnnouncementLauncherNotice")
        .create(({ theme }) => {
            const { main: infoColor } = theme.colors.useCases.alertSeverity.info;

            return {
                root: {
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing(3),
                    marginBottom: theme.spacing(3),
                    padding: theme.spacing(3),
                    borderRadius: 12,
                    border: `1px solid ${infoColor}`,
                    backgroundColor: `color-mix(in srgb, ${infoColor} 20%, transparent)`,
                    color: theme.colors.useCases.typography.textPrimary
                },
                text: {
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column"
                },
                title: {
                    ...theme.typography.variants["label 1"].style,
                    fontWeight: 600
                },
                subtitle: {
                    ...theme.typography.variants["body 2"].style,
                    "& a": {
                        color: "inherit",
                        whiteSpace: "nowrap"
                    }
                },
                goToAccordionButton: {
                    display: "inline-flex",
                    alignItems: "center",
                    gap: theme.spacing(1),
                    padding: theme.spacing({ topBottom: 1, rightLeft: 3 }),
                    border: "none",
                    borderRadius: 100,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    // NOTE: Inverse colors, like the secondary action of the design system.
                    backgroundColor: theme.colors.useCases.typography.textPrimary,
                    color: theme.colors.useCases.surfaces.background,
                    ...theme.typography.variants["label 2"].style
                },
                goToAccordionButtonIcon: {
                    fontSize: 16,
                    width: 16,
                    height: 16
                }
            };
        });

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
                            src={RELEASE_DIALOG_COVER_URL}
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
