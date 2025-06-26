<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore';
import type { FooterData } from '@shared/types';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import { useConfirm } from 'primevue/useconfirm';
import { ref } from 'vue';


const props = defineProps<{
    footerData: FooterData;
}>();

const confirm = useConfirm();
const boardStore = useBoardStore();

const showButtonOverlay = ref(false);
const isButtonOverlayLocked = ref(false);
const isEditing = ref(false);
const footerDescription = ref(props.footerData.description);

const handleMouseEnter = () => {
    if (!isButtonOverlayLocked.value) showButtonOverlay.value = true;
};

const handleMouseLeave = () => {
    showButtonOverlay.value = false;
    isButtonOverlayLocked.value = false;
};

const handleUpdate = () => {
    boardStore.updateFooter(props.footerData.id, {
        description: footerDescription.value,
    });
    isEditing.value = false;
    showButtonOverlay.value = false;
    isButtonOverlayLocked.value = true; // Lock overlay until mouse leaves
};

const handleClear = () => {
    footerDescription.value = '';
    handleUpdate();
};

const showClearConfirmation = () => {
    confirm.require({
        acceptClass: 'confirm-deletion',
        acceptLabel: 'Delete Note',
        rejectClass: 'hidden',
        accept: handleClear,
    });
};
</script>

<template>
    <div
        v-if="footerData.description || isEditing"
        :id="`footer-${footerData.id}`"
        class="card footer group"
        :class="isEditing ? 'editing' : 'filled'"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
        <!-- Overlayed action buttons -->
        <div
            v-if="!isEditing"
            :class="[
                'overlay z-10 transition-opacity duration-200',
                showButtonOverlay
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
            ]"
        >
            <div class="flex w-full justify-around">
                <Button
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    size="small"
                    @click="showClearConfirmation"
                />
                <Button
                    icon="pi pi-pencil"
                    text
                    severity="secondary"
                    size="small"
                    @click="isEditing = true"
                />
            </div>
        </div>

        <!-- Footer editing -->
        <div
            v-if="isEditing"
            class="flex gap-x-1"
        >
            <Textarea
                v-model="footerDescription"
                rows="2"
                auto-resize
                class="py-1 px-2 border"
                placeholder="Add a note to this column ..."
                autofocus
                @blur="handleUpdate"
            />
            <Button
                icon="pi pi-save"
                text
                severity="secondary"
                @click="handleUpdate"
            />
        </div>

        <!-- Footer content -->
        <div
            v-else
            class="description whitespace-pre-line"
        >
            {{ footerData.description }}
        </div>
    </div>

    <!-- Empty footer card -->
    <div
        v-else
        :id="`footer-${footerData.id}`"
        class="card footer empty"
    >
        <Button
            icon="pi pi-file-edit"
            size="large"
            text
            severity="secondary"
            class="py-0"
            @click="isEditing = true"
        />
    </div>
</template>

<style scoped>
@reference "../index.css";
.footer {
    @apply w-[var(--card-width)];
    @apply bg-[var(--card-footer-color)];
    @apply p-1;
}
.footer .overlay {
    @apply absolute w-full h-full;
    @apply flex items-center justify-center;
    @apply bg-[var(--card-footer-color)];
}
.footer.editing {
    @apply h-full text-xs;
}
.footer.empty {
    @apply flex justify-center items-center;
    @apply h-full;
}
.footer.filled {
    @apply flex justify-center items-center;
    @apply h-full text-sm;
    @apply text-[var(--card-footer-text-color)];
}
.footer .p-textarea {
    @apply text-sm;
}
</style>
