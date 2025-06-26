<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore';
import type { BodyData } from '@shared/types.ts';
import Button from 'primevue/button';
import { useConfirm } from 'primevue/useconfirm';


const props = defineProps<{
    bodyData: BodyData;
    sourceRowId: string;
}>();

const emit = defineEmits<{
    dragStart: [bodyId: string];
    clickEdit: [card: BodyData];
}>();

const confirm = useConfirm();
const boardStore = useBoardStore();

const handleDragStart = (e: DragEvent) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', props.bodyData.id);
    emit('dragStart', props.bodyData.id);
};

const handleDelete = () => {
    boardStore.deleteBody(props.bodyData.id);
};

const showDeleteConfirmation = () => {
    confirm.require({
        acceptClass: 'confirm-deletion',
        acceptLabel: 'Delete Body Card',
        rejectClass: 'hidden',
        accept: handleDelete,
    });
};
</script>

<template>
    <div
        :id="`card-${bodyData.id}`"
        draggable="true"
        class="card body"
        @dragstart="handleDragStart"
    >
        <h3 class="px-3 pt-2 font-medium truncate">
            {{ bodyData.title }}
        </h3>
        <p class="px-3 text-sm grow whitespace-pre-line">
            {{ bodyData.description }}
        </p>
        <p
            v-if="bodyData.note"
            class="px-3 note"
        >
            {{ bodyData.note }}
        </p>
        <div class="buttons flex justify-between">
            <Button
                icon="pi pi-trash"
                text
                severity="danger"
                @click="showDeleteConfirmation"
            />
            <Button
                icon="pi pi-pencil"
                text
                severity="secondary"
                @click="$emit('clickEdit', bodyData)"
            />
        </div>
    </div>
</template>

<style scoped>
@reference "../index.css";
.body {
    @apply bg-[var(--card-body-color)];
    @apply text-[var(--card-body-text-color)];
    @apply flex flex-col;
    @apply w-[var(--card-width)];
    @apply h-full;
    @apply shadow-md relative z-20 break-words;
    @apply cursor-move transition-all transition-transform duration-200;
    @apply hover:shadow-2xl hover:-translate-y-1;
}
.body .note {
    @apply text-xs  text-right bg-surface-800/50;
    @apply text-[var(--card-footer-text-color)];
    @apply bg-[var(--card-footer-color)]/50;
}
.body .buttons {
    @apply px-1 pb-1;
}
</style>
