import { useBoardStore } from '@client/stores/BoardStore';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted } from 'vue';


/**
 * Sets up a navigation guard that warns the user about unsaved changes
 * when attempting to leave the page (e.g., closing the tab or refreshing).
 *
 * This composable listens for the `beforeunload` event and, if there are
 * unsaved changes in the board (as determined by `boardHasUnsavedChanges`),
 * prompts the user with a browser-native confirmation dialog.
 *
 * @remarks
 * - The confirmation dialog is controlled by setting `event.returnValue`.
 * - The event listener is registered on mount and cleaned up on unmount.
 *
 * @example
 * ```typescript
 * import { useNavigationGuard } from '@client/composables/useUnsavedChangesWarning';
 * useNavigationGuard();
 * ```
 */
export function useNavigationGuard() {
    const boardStore = useBoardStore();
    const { boardHasUnsavedChanges } = storeToRefs(boardStore);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (boardHasUnsavedChanges.value) {
            event.preventDefault();
            // eslint-disable-next-line no-param-reassign
            event.returnValue = ''; // Still required for Chrome, even though deprecated
        }
    };

    onMounted(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    });
}
