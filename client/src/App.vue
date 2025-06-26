<script setup lang="ts">
import BoardView from '@client/components/BoardView.vue';
import { useNavigationGuard } from '@client/composables/useUnsavedChangesWarning';
import { useBoardStore } from '@client/stores/BoardStore';
import { EntityType } from '@shared/constants.ts';
import type { BoardData, BoardInfo } from '@shared/types.ts';
import Button from 'primevue/button';
import ConfirmPopup from 'primevue/confirmpopup';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { nextTick, onMounted, ref } from 'vue';
import BoardModal from './components/BoardModal.vue';


const toast = useToast();
const boardStore = useBoardStore();

const CREATE_ID = '__create__'; // Special ID for creating a new board
const URL_BOARD_ID_PARAM = 'board-id'; // URL parameter for pre selected board ID

const urlParams = new URLSearchParams(window.location.search);
const activeBoardId = ref<string | null>(null);
const selectedBoardId = ref<string>();

const boardInfos = ref<BoardInfo[]>([]);
const isBoardModalOpen = ref(false);
const boardToEdit = ref<BoardData | null>(null);
const isSelectTeleportReady = ref(false);

// Warns users about unsaved board data changes when leaving the page
useNavigationGuard();

const assertBoardId = (boardId: string | null): string => {
    // Ensure, selected boardId exists in the list of available boardinfos
    if (boardId && boardInfos.value.some((boardInfo) => boardInfo.id === boardId)) {
        return boardId;
    }

    // If no valid board is selected, default to the currently active boardid
    if (activeBoardId.value) {
        return activeBoardId.value;
    }

    // if no active board is set, default to the first valid board
    const firstValidBoard = boardInfos.value.find((boardInfo) => boardInfo.id !== CREATE_ID);
    if (firstValidBoard && firstValidBoard.id) {
        return firstValidBoard.id;
    }

    // Else, return the CREATE new board ID
    return CREATE_ID;
};

const setActiveBoardId = async (boardId: string) => {
    if (boardId === activeBoardId.value) {
        return;
    }

    // Ensure select UI updates before proceeding
    await nextTick();

    // Warn about unsaved changes before switching boards
    if (boardStore.boardHasUnsavedChanges) {
        // eslint-disable-next-line no-alert
        const confirmChange = window.confirm(
            'You have unsaved changes. Are you sure you want to switch boards and lose your changes?',
        );
        if (!confirmChange) {
            const assertedBoardId = assertBoardId(activeBoardId.value);
            selectedBoardId.value = assertedBoardId;
            return;
        }
    }

    selectedBoardId.value = boardId;
    activeBoardId.value = boardId;
    urlParams.set(URL_BOARD_ID_PARAM, boardId);
    window.history.replaceState({}, '', `?${urlParams.toString()}`);
};

const fetchAvailableBoardInfos = async (): Promise<BoardInfo[]> => {
    let infos : BoardInfo[] = [];

    // Fetch available board infos from the backend
    try {
        infos = await boardStore.fetchAvailableBoardInfos();
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Error fetching available boards',
            detail: (e as Error).message,
            life: 4000,
        });
    }

    // Add a special option for creating a new board
    infos.unshift({
        type: EntityType.BoardInfo,
        id: CREATE_ID,
        name: '+ Add new board',
    });
    return infos;
};

const handleBoardSelect = async (event: { value: string }) => {
    if (event.value === CREATE_ID) {
        boardToEdit.value = null;
        isBoardModalOpen.value = true;
        return;
    }
    await setActiveBoardId(event.value);
};

const handleEditBoardClick = async () => {
    const assertedBoardId = assertBoardId(activeBoardId.value);

    try {
        boardToEdit.value = await boardStore.fetch(assertedBoardId);
        isBoardModalOpen.value = true;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: `Error loading board '${assertedBoardId}' for editing`,
            detail: (e as Error).message,
            life: 4000,
        });
        boardToEdit.value = null;
        isBoardModalOpen.value = false;
    }
};

const handleBoardModalClose = async (newBoardId: string | null) => {
    boardToEdit.value = null;
    isBoardModalOpen.value = false;

    // If BoardModal was closed without creating or updating a board, just return
    if (!newBoardId) {
        await nextTick();
        selectedBoardId.value = assertBoardId(activeBoardId.value);
        return;
    }

    // If a new board was created or existing board was updated, refresh the board infos
    // and switch to the new or updated board
    boardInfos.value = await fetchAvailableBoardInfos();
    const assertedBoardId = assertBoardId(newBoardId);
    await setActiveBoardId(assertedBoardId);
};

onMounted(async () => {
    const initialBoardId = urlParams.get(URL_BOARD_ID_PARAM) || null;
    boardInfos.value = await fetchAvailableBoardInfos();
    const assertedBoardId = assertBoardId(initialBoardId);
    await handleBoardSelect({ value: assertedBoardId });

    // Give DOM time to mount BoardView before teleporting the select to it
    requestAnimationFrame(() => {
        isSelectTeleportReady.value = true;
    });
});
</script>

<template>
    <div class="min-h-screen bg-[var(--board-bg-color)]">
        <teleport
            v-if="isSelectTeleportReady"
            to="#board-select-teleport-target"
        >
            <div class="flex space-x-6">
                <Select
                    v-model="selectedBoardId"
                    :options="boardInfos"
                    option-label="name"
                    option-value="id"
                    placeholder="Select a board"
                    class="w-full text-2xl"
                    scroll-height="24rem"
                    @change="handleBoardSelect"
                />
                <Button
                    label="Edit"
                    icon="pi pi-pencil"
                    severity="secondary"
                    variant="outlined"
                    class="text-2xl w-32"
                    @click="handleEditBoardClick"
                />
            </div>
        </teleport>

        <BoardView :board-id="activeBoardId" />

        <BoardModal
            v-if="isBoardModalOpen"
            v-model:visible="isBoardModalOpen"
            :board-data="boardToEdit"
            @close="handleBoardModalClose"
        />

        <ToastContainer position="top-center" />

        <ConfirmPopup
            :pt="{
                content: 'hidden',
                footer: 'px-2 py-2 ',
            }"
        />
    </div>
</template>

<style scoped>

</style>
