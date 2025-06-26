<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore.ts';
import type { HeaderData } from '@shared/types.ts';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';


const props = defineProps<{
    headerData: HeaderData;
}>();

const boardStore = useBoardStore();

const showButtonOverlay = ref(false);
const isButtonOverlayLocked = ref(false);
const isEditing = ref(false);
const headerTitle = ref(props.headerData.title);

const handleUpdate = () => {
    boardStore.updateHeader(props.headerData.id, {
        title: headerTitle.value,
    });
    isEditing.value = false;
    showButtonOverlay.value = false;
    isButtonOverlayLocked.value = true; // Lock overlay until mouse leaves
};

const handleMouseEnter = () => {
    if (!isButtonOverlayLocked.value) showButtonOverlay.value = true;
};

const handleMouseLeave = () => {
    showButtonOverlay.value = false;
    isButtonOverlayLocked.value = false;
};

const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleUpdate();
    }
};
</script>

<template>
    <div
        :id="`header-${headerData.id}`"
        class="card header"
        :class="isEditing ? 'editing' : ''"
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
            <Button
                icon="pi pi-pencil"
                text
                severity="primary"
                @click="isEditing = true"
            />
        </div>

        <!-- Header editing -->
        <div
            v-if="isEditing"
            class="flex gap-x-1"
        >
            <InputText
                v-model="headerTitle"
                class="py-1 px-2 border w-full"
                placeholder="Column Header Title ..."
                autofocus
                @keydown="handleKeyDown"
                @blur="handleUpdate"
            />
            <Button
                icon="pi pi-save"
                text
                severity="secondary"
                size="small"
                @click="handleUpdate"
            />
        </div>

        <!-- Header content -->
        <div
            v-else
            class="flex flex-col"
        >
            <h3 class="title font-medium truncate">
                {{ headerData.title }}
            </h3>
        </div>
    </div>
</template>

<style scoped>
@reference "../index.css";
.header {
    @apply w-[var(--card-width)];
    @apply flex justify-center items-center;
    @apply h-full min-h-11 p-1;
    @apply bg-primary-600 text-white;
}
.header .overlay {
    @apply absolute w-full h-full;
    @apply flex items-center justify-center;
    @apply bg-primary-600;
}
.header .overlay button {
    @apply text-white;
    @apply hover:text-surface-800;
}
.header.editing {
    @apply h-full;
    @apply bg-[var(--card-footer-color)];
}
.header .title {
    @apply text-center text-lg;
}
.header .p-inputtext{
    @apply text-sm;
}
</style>
