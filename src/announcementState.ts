/**
 * Persisted "has the user seen it" state, shared by every injected component.
 * Stored in localStorage: per browser, which is enough for an announcement.
 */

export type AnnouncementState = {
    isLauncherNoticeDismissed: boolean;
    isReleaseDialogDismissed: boolean;
};

const STORAGE_KEY = "onyxia-ai-announcement";

const initialState: AnnouncementState = {
    isLauncherNoticeDismissed: false,
    isReleaseDialogDismissed: false
};

let state: AnnouncementState = (() => {
    try {
        const serialized = localStorage.getItem(STORAGE_KEY);

        if (serialized === null) {
            return initialState;
        }

        return {
            ...initialState,
            ...(JSON.parse(serialized) as Partial<AnnouncementState>)
        };
    } catch {
        return initialState;
    }
})();

const listeners = new Set<() => void>();

export function getAnnouncementState(): AnnouncementState {
    return state;
}

export function updateAnnouncementState(update: Partial<AnnouncementState>) {
    if (
        Object.entries(update).every(
            ([key, value]) => state[key as keyof AnnouncementState] === value
        )
    ) {
        return;
    }

    state = { ...state, ...update };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Private browsing or storage disabled: the badges will just come back on reload.
    }

    listeners.forEach(listener => listener());
}

export function subscribeToAnnouncementState(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}
