
<script setup lang="ts">
import BodyCardModal from '@client/components/BodyCardModal.vue';
import RowModal from '@client/components/RowModal.vue';
import RowPanel from '@client/components/RowPanel.vue';
import { useBoardStore } from '@client/stores/BoardStore.ts';
import { useDarkModeStore } from '@client/stores/DarkModeStore.ts';
import type { BodyData, RowData } from '@shared/types.ts';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, watch } from 'vue';


const darkModeStore = useDarkModeStore();
darkModeStore.init();

const boardStore = useBoardStore();
const toast = useToast();

const props = defineProps<{
    boardId: string | null;
}>();

const isLoading = ref(true);
const isBoardValid = ref(false);

const loadBoard = async (boardId: string | null) => {
    isLoading.value = true;
    if (!boardId) {
        isBoardValid.value = false;
        return;
    }
    try {
        const boardData = await boardStore.fetch(boardId);
        boardStore.init(boardData);
        isBoardValid.value = true;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: `Error loading board '${boardId}'`,
            detail: (e as Error).message,
            life: 4000,
        });
        isBoardValid.value = false;
    }
    isLoading.value = false;
};

onMounted(() => {
    loadBoard(props.boardId);
});

watch(() => props.boardId, (newId, oldId) => {
    if (newId === oldId) {
        return;
    }
    loadBoard(newId);
});

const isRowModalOpen = ref(false);
const currentRow = ref<RowData | null>(null);

const isBodyCardModalOpen = ref(false);
const currentBodyCard = ref<BodyData | null>(null);
const currentBodyCardRowId = ref<string | null>(null);

const draggedCard = ref<{ cardId: string; sourceRowId: string } | null>(null);

const handleDragStart = (cardId: string, sourceRowId: string) => {
    draggedCard.value = { cardId, sourceRowId };
};

const handleDrop = (targetRowId: string, targetIndex: number) => {
    if (!draggedCard.value) return;
    const { cardId, sourceRowId } = draggedCard.value;

    const sourceRow = boardStore.rowById(sourceRowId);
    const targetRow = boardStore.rowById(targetRowId);
    if (!sourceRow || !targetRow) return;

    const cardIndex = sourceRow.bodies.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) return;

    // Remove the card from the source row
    const [movedCard] = sourceRow.bodies.splice(cardIndex, 1);

    // Adjust index if moving forward in same row, taking 'removal' into account
    let targetIndexAdjusted = targetIndex;
    if (sourceRowId === targetRowId && cardIndex < targetIndex) {
        targetIndexAdjusted -= 1;
    }

    targetRow.bodies.splice(targetIndexAdjusted, 0, movedCard);

    draggedCard.value = null;
};

const handleSaveClick = () => {
    boardStore.save()
        .then(() => {
            toast.add({
                severity: 'success',
                summary: 'Board saved successfully',
                life: 2000,
            });
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Error saving board',
                detail: (e as Error).message,
                life: 4000,
            });
        });
};

const handleHistoryClick = () => {
    toast.add({
        severity: 'info',
        summary: 'History action',
        detail: 'This feature is not implemented yet.',
        life: 2000,
    });
};

const handleCreateRowClick = () => {
    // Open a modal to create a new row
    currentRow.value = null;
    isRowModalOpen.value = true;
};

const handleEditRowClick = (rowData: RowData) => {
    // Open a modal with the selected row data
    currentRow.value = rowData;
    isRowModalOpen.value = true;
};

const handleAddBodyClick = (rowId: string) => {
    // Open a modal to create a new card
    currentBodyCard.value = null;
    currentBodyCardRowId.value = rowId;
    isBodyCardModalOpen.value = true;
};

const handleEditBodyClick = (bodyData: BodyData) => {
    // Open a modal with the selected card data
    currentBodyCard.value = bodyData;
    currentBodyCardRowId.value = null;
    isBodyCardModalOpen.value = true;
};
</script>

<template>
    <div class="p-6 min-h-screen">
        <div class="max-w-full mx-auto">
            <div class="flex justify-between items-center mb-6">
                <div id="board-select-teleport-target" />
                <div
                    v-if="isBoardValid"
                    class="flex space-x-6"
                >
                    <Button
                        label="New Row"
                        icon="pi pi-plus"
                        severity="primary"
                        variant="outlined"
                        class="text-2xl"
                        @click="handleCreateRowClick"
                    />

                    <Button
                        label="Save"
                        icon="pi pi-save"
                        severity="primary"
                        variant="outlined"
                        class="text-2xl"
                        @click="handleSaveClick"
                    />

                    <Button
                        label="History"
                        icon="pi pi-history"
                        severity="secondary"
                        variant="outlined"
                        class="text-2xl"
                        @click="handleHistoryClick"
                    />

                    <Button
                        :icon="'pi ' + (darkModeStore.isEnabled ? 'pi-moon' : 'pi-sun')"
                        severity="secondary"
                        variant="outlined"
                        class="text-2xl"
                        @click="darkModeStore.toggle()"
                    />
                </div>
            </div>

            <div
                v-if="isLoading"
                class="flex justify-center items-center h-32 text-3xl"
            >
                <span>Loading board...</span>
            </div>

            <div
                v-else-if="!isBoardValid"
                class="rowerror"
            >
                <span>
                    The board '{{ boardId }}' could not be loaded.
                    Please check the board ID or try again later.
                </span>
            </div>

            <div
                v-else-if="boardStore.rows.length > 0"
                class="space-y-8"
            >
                <RowPanel
                    v-for="row in boardStore.rows"
                    :key="row.id"
                    :row="row"
                    @drag-start="handleDragStart"
                    @drop="handleDrop"
                    @click-add-body="handleAddBodyClick"
                    @click-edit-body="handleEditBodyClick"
                    @click-edit-row="handleEditRowClick"
                />
            </div>

            <div
                v-else
                class="rowinfo space-y-8"
            >
                <span>This board has no rows yet.</span>
                <Button
                    label="Add your first row"
                    icon="pi pi-plus"
                    severity="primary"
                    variant="outlined"
                    class="text-2xl"
                    @click="handleCreateRowClick"
                />
            </div>
        </div>

        <RowModal
            v-if="isRowModalOpen"
            v-model:visible="isRowModalOpen"
            :row-data="currentRow"
        />

        <BodyCardModal
            v-if="isBodyCardModalOpen"
            v-model:visible="isBodyCardModalOpen"
            :row-id="currentBodyCardRowId"
            :body-data="currentBodyCard"
        />
    </div>
</template>

<style scoped>
@reference "../index.css";
.rowinfo {
    @apply p-8 text-2xl;
    @apply bg-[var(--p-panel-background)];
    @apply border-1 border-[var(--p-panel-border-color)];
    @apply flex flex-col space-y-8 min-h-32 justify-center items-center;
}
.rowerror {
    @apply p-8 text-2xl;
    @apply bg-[var(--p-toast-error-background)];
    @apply text-[var(--p-toast-error-color)];
    @apply flex min-h-32 justify-center items-center;
}
</style>
