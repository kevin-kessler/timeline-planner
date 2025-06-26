<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore';
import { EntityType } from '@shared/constants';
import type { BoardData, BoardInfo } from '@shared/types.ts';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { ref, watch } from 'vue';


const props = defineProps<{
    visible: boolean;
    boardData: BoardData | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'close': [boardId: string | null];
}>();

const toast = useToast();
const boardStore = useBoardStore();
const boardId = ref<string>('');
const boardName = ref<string>('');

watch(() => props.boardData, (editBoard) => {
    if (editBoard) {
        boardId.value = editBoard.boardInfo.id;
        boardName.value = editBoard.boardInfo.name;
    } else {
        boardId.value = '';
        boardName.value = '';
    }
}, { immediate: true });

const handleCreate = async () => {
    if (!boardId.value || !boardName.value) {
        toast.add({
            severity: 'error',
            summary: 'Board ID and Name are required.',
            life: 4000,
        });
        return;
    }

    const newBoardInfo : BoardInfo = {
        type: EntityType.BoardInfo,
        id: boardId.value,
        name: boardName.value,
    };

    try {
        await boardStore.createBoard(newBoardInfo);
        toast.add({
            severity: 'success',
            summary: `Sucessfuly created board '${newBoardInfo.id}'!`,
            life: 4000,
        });
        emit('close', newBoardInfo.id);
        emit('update:visible', false);
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: `Error creating board '${newBoardInfo.id}'`,
            detail: (e as Error).message,
            life: 4000,
        });
    }
};

const handleUpdate = async () => {
    if (!props.boardData) return;

    if (!boardId.value || !boardName.value) {
        toast.add({
            severity: 'error',
            summary: 'Board ID and Name are required.',
            life: 4000,
        });
        return;
    }
    const updatedBoardInfo : BoardInfo = {
        type: EntityType.BoardInfo,
        id: boardId.value,
        name: boardName.value,
    };

    try {
        await boardStore.updateBoardInfo(props.boardData.boardInfo.id, updatedBoardInfo);
        toast.add({
            severity: 'success',
            summary: 'Successfully updated board info!',
            life: 4000,
        });
        emit('close', updatedBoardInfo.id);
        emit('update:visible', false);
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: `Error updating board '${props.boardData.boardInfo.id}' to '${updatedBoardInfo.id}, ${updatedBoardInfo.name}' `,
            detail: (e as Error).message,
            life: 4000,
        });
    }
};
</script>

<template>
    <Dialog
        :visible="visible"
        :modal="true"
        :header="boardData ? 'Edit Board' : 'Create Board'"
        :position="'top'"
        class="w-full max-w-md"
        @update:visible="
            $emit('update:visible', $event);
            emit('close', boardData ? boardData.boardInfo.id : null);
        "
    >
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label
                    for="board-id"
                    class="text-sm font-medium"
                >Board ID</label>
                <InputText
                    id="board-id"
                    v-model="boardId"
                    required
                    autofocus
                    placeholder="my-board-id"
                    class="border py-1 px-2"
                />
                <label
                    for="header-prefix"
                    class="text-sm font-medium"
                >Board Name</label>
                <InputText
                    id="header-prefix"
                    v-model="boardName"
                    placeholder="Human Readable Board Name"
                    class="border py-1 px-2"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between w-full">
                <Button
                    label="Cancel"
                    severity="danger"
                    @click="
                        $emit('update:visible', false)
                        $emit('close', boardData ? boardData.boardInfo.id : null);
                    "
                />
                <Button
                    :label="boardData ? 'Update' : 'Create'"
                    severity="primary"
                    @click="boardData ? handleUpdate() : handleCreate();"
                />
            </div>
        </template>
    </Dialog>
</template>
