// src/announcementState.ts
var STORAGE_KEY = "onyxia-ai-announcement";
var initialState = {
  hasOpenedLauncherAiAccordion: false,
  isLauncherNoticeDismissed: false,
  isReleaseDialogDismissed: false
};
var state = (() => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return initialState;
    }
    return {
      ...initialState,
      ...JSON.parse(serialized)
    };
  } catch {
    return initialState;
  }
})();
var listeners = /* @__PURE__ */ new Set();
function getAnnouncementState() {
  return state;
}
function updateAnnouncementState(update) {
  if (Object.entries(update).every(
    ([key, value]) => state[key] === value
  )) {
    return;
  }
  state = { ...state, ...update };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
  }
  listeners.forEach((listener) => listener());
}
function subscribeToAnnouncementState(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// src/launcherDom.ts
var LAUNCHER_AI_GROUP_TITLE = "AI Assistant";
function isTopLevelAccordion(element) {
  return element.parentElement?.closest("[data-title]") === null;
}
function getLauncherAiAccordion() {
  for (const element of document.querySelectorAll(
    `[data-title="${LAUNCHER_AI_GROUP_TITLE}"]`
  )) {
    if (isTopLevelAccordion(element)) {
      return element;
    }
  }
  return null;
}
function getLauncherFirstAccordionIfAiGroup() {
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
function scrollToAndOpenLauncherAiAccordion() {
  const accordion = getLauncherAiAccordion();
  if (accordion === null) {
    return;
  }
  accordion.scrollIntoView({ behavior: "smooth", block: "start" });
  const summary = accordion.querySelector(".MuiAccordionSummary-root");
  if (summary !== null && summary.getAttribute("aria-expanded") !== "true") {
    summary.click();
  }
}

// src/components.tsx
var LEARN_MORE_URL = "https://docs.sspcloud.fr";
var RELEASE_DIALOG_COVER_URL = new URL(
  "../assets/ai-release-cover.jpg",
  import.meta.url
).href;
var isReleaseDialogClosed = false;
async function createComponents(ctx) {
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
  function useAnnouncementState() {
    return React.useSyncExternalStore(
      subscribeToAnnouncementState,
      getAnnouncementState
    );
  }
  function useIsFrench() {
    const { lang } = useLang();
    return lang === "fr";
  }
  function NewBadge(props) {
    const { size } = props;
    const { classes, cx } = useNewBadgeStyles();
    const isFrench = useIsFrench();
    return /* @__PURE__ */ React.createElement("span", { className: cx(classes.root, size === "small" && classes.small) }, isFrench ? "Nouveau" : "New");
  }
  const useNewBadgeStyles = tss.withName("OnyxiaAiAnnouncementNewBadge").create(({ theme }) => ({
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
  function LauncherAiAccordionBadge() {
    const { hasOpenedLauncherAiAccordion } = useAnnouncementState();
    if (hasOpenedLauncherAiAccordion) {
      return null;
    }
    return /* @__PURE__ */ React.createElement(NewBadge, { size: "small" });
  }
  function LauncherAiNotice() {
    const { isLauncherNoticeDismissed } = useAnnouncementState();
    const { classes } = useLauncherAiNoticeStyles();
    const isFrench = useIsFrench();
    if (isLauncherNoticeDismissed) {
      return null;
    }
    const accountAiTabLink = routes.account({ tabId: "ai" }).link;
    return /* @__PURE__ */ React.createElement("div", { className: classes.root, role: "note" }, /* @__PURE__ */ React.createElement(NewBadge, { size: "medium" }), /* @__PURE__ */ React.createElement("div", { className: classes.text }, /* @__PURE__ */ React.createElement("span", { className: classes.title }, isFrench ? "Ce service peut d\xE9sormais utiliser un assistant IA" : "This service can now use an AI assistant"), /* @__PURE__ */ React.createElement("span", { className: classes.subtitle }, isFrench ? /* @__PURE__ */ React.createElement(React.Fragment, null, "G\xE9rez vos fournisseurs depuis", " ", /* @__PURE__ */ React.createElement("a", { ...accountAiTabLink }, "votre compte"), ".") : /* @__PURE__ */ React.createElement(React.Fragment, null, "Manage your providers from", " ", /* @__PURE__ */ React.createElement("a", { ...accountAiTabLink }, "your account"), "."))), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: classes.goToAccordionButton,
        onClick: scrollToAndOpenLauncherAiAccordion
      },
      isFrench ? "Configurer l'assistant IA" : "Set up the AI assistant",
      /* @__PURE__ */ React.createElement(
        Icon,
        {
          className: classes.goToAccordionButtonIcon,
          icon: getIconUrlByName("ArrowDownward")
        }
      )
    ), /* @__PURE__ */ React.createElement(
      IconButton,
      {
        icon: getIconUrlByName("Close"),
        "aria-label": isFrench ? "Masquer" : "Dismiss",
        onClick: () => updateAnnouncementState({ isLauncherNoticeDismissed: true })
      }
    ));
  }
  const useLauncherAiNoticeStyles = tss.withName("OnyxiaAiAnnouncementLauncherNotice").create(({ theme }) => {
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
    return /* @__PURE__ */ React.createElement(
      Dialog,
      {
        isOpen: isUserLoggedIn && !isReleaseDialogDismissed && !isClosed,
        onClose: close,
        showCloseButton: true,
        maxWidth: false,
        muiDialogClasses: { paper: classes.paper },
        title: isFrench ? "Les mod\xE8les d'IA sont disponibles dans vos services" : "AI models are now available in your services",
        body: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
          "img",
          {
            className: classes.cover,
            src: RELEASE_DIALOG_COVER_URL,
            alt: ""
          }
        ), isFrench ? "Connectez des fournisseurs d'IA, choisissez vos mod\xE8les et utilisez-les directement dans les services Onyxia compatibles." : "Connect AI providers, choose your models, and use them directly in compatible Onyxia services."),
        doNotShowNextTimeText: isFrench ? "Ne plus afficher ce message" : "Do not show this message again",
        onDoShowNextTimeValueChange: (doShowNextTime) => setDoNotShowAgain(!doShowNextTime),
        buttons: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { variant: "secondary", href: LEARN_MORE_URL }, isFrench ? "En savoir plus" : "Learn more"), /* @__PURE__ */ React.createElement(
          Button,
          {
            onClick: () => {
              close();
              if (route.name === "account" && route.params.tabId === "ai") {
                return;
              }
              routes.account({ tabId: "ai" }).push();
            }
          },
          isFrench ? "Configurer les fournisseurs d'IA" : "Set up AI providers"
        ))
      }
    );
  }
  const useReleaseDialogStyles = tss.withName("OnyxiaAiAnnouncementReleaseDialog").create(({ theme }) => ({
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

// src/inject.ts
var domChangeListeners = /* @__PURE__ */ new Set();
function onDomChange(listener) {
  if (domChangeListeners.size === 0) {
    new MutationObserver(
      () => domChangeListeners.forEach((listener2) => listener2())
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
function inject(params) {
  const { ctx, getTarget, position, hostStyle = {}, Component } = params;
  const { mount } = ctx.declareComponent(Component);
  let target_current = null;
  let host = void 0;
  onDomChange(() => {
    const target = getTarget();
    if (target !== target_current) {
      target_current = target;
      host?.remove();
      host = void 0;
      if (target === null) {
        mount(null);
        return;
      }
      host = document.createElement("span");
      host.setAttribute("data-onyxia-ai-announcement", "");
      Object.assign(host.style, hostStyle);
    }
    if (target === null || host === void 0) {
      return;
    }
    switch (position) {
      case "prepend":
        if (host.parentElement !== target || host.previousSibling !== null) {
          target.prepend(host);
        }
        break;
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

// src/main.ts
var ANNOUNCEMENT_END_DATE = /* @__PURE__ */ new Date("2026-10-31T23:59:59");
window.onOnyxiaCtxReady = async (ctx) => {
  if (Date.now() > ANNOUNCEMENT_END_DATE.getTime()) {
    return;
  }
  const { ReleaseDialog, LauncherAiAccordionBadge, LauncherAiNotice } = await createComponents(ctx);
  onDomChange(() => {
    if (getLauncherAiAccordion()?.querySelector(
      '.MuiAccordionSummary-root[aria-expanded="true"]'
    ) != null) {
      updateAnnouncementState({ hasOpenedLauncherAiAccordion: true });
    }
  });
  inject({
    ctx,
    getTarget: () => document.body,
    position: "append",
    hostStyle: { display: "none" },
    Component: ReleaseDialog
  });
  inject({
    ctx,
    getTarget: () => getLauncherAiAccordion()?.querySelector(".MuiAccordionSummary-content") ?? null,
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
