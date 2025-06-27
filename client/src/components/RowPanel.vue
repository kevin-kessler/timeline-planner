<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore';
import type { BodyData, RowData } from '@shared/types';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import { useConfirm } from 'primevue/useconfirm';
import { computed, ref } from 'vue';
import ColumnBody from './BodyCard.vue';
import ColumnFooter from './FooterCard.vue';
import ColumnHeader from './HeaderCard.vue';


const props = defineProps<{
    row: RowData;
}>();

const confirm = useConfirm();
const boardStore = useBoardStore();

const emit = defineEmits<{
    dragStart: [cardId: string, sourceRowId: string];
    drop: [targetRowId: string, targetIndex: number];
    clickAddBody: [rowId: string];
    clickEditBody: [card: BodyData];
    clickEditRow: [rowData: RowData];
}>();

const CARD_GAP = 4; // Gap between cards in tailwind spacing units

const isWrapEnabled = ref(false);

const activeDropZone = ref<number | null>(null);
const isEmptyDropZoneActive = ref(false);

const extraDropZoneWidthStyle = computed(() => {
    const numOfEmptyColumns = props.row.headers.length - props.row.bodies.length;
    const style = `calc(${numOfEmptyColumns} * var(--card-width) + (${numOfEmptyColumns} - 1) * calc(var(--spacing) * ${CARD_GAP}))`;
    return style;
});

const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    const cardElement = (e.currentTarget as HTMLElement).closest('[id^="card-"]');
    if (!cardElement) return;

    // Every card has two drop zones (left and right).
    // Find the closest one based on mouse coordinates and set the active drop zone accordingly.
    const rect = cardElement.getBoundingClientRect();
    const isLeft = e.clientX < rect.left + rect.width / 2;
    activeDropZone.value = isLeft ? index : index + 1;
};

const handleDragLeave = (e: DragEvent) => {
    // Check if we're actually leaving the drop zone and not entering a child element
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('.drop-zone')) {
        activeDropZone.value = null;
    }
};

const handleDrop = (e: DragEvent, index: number) => {
    e.preventDefault();
    activeDropZone.value = null;
    emit('drop', props.row.id, index);
};

const handleEmptyDragOver = (e: DragEvent) => {
    e.preventDefault();
    isEmptyDropZoneActive.value = true;
};

const handleEmptyDragLeave = () => {
    isEmptyDropZoneActive.value = false;
};

const handleEmptyDrop = (e: DragEvent, index: number) => {
    e.preventDefault();
    isEmptyDropZoneActive.value = false;
    handleDrop(e, index);
};

const handleDelete = () => {
    boardStore.deleteRow(props.row.id);
};

const showDeleteRowConfirmation = () => {
    confirm.require({
        acceptClass: 'confirm-deletion',
        acceptLabel: 'Delete Row',
        rejectClass: 'hidden',
        accept: handleDelete,
    });
};
</script>

<template>
    <Panel
        toggleable
        :pt="{
            headerActions: 'flex items-center gap-x-2',
            pcToggleButton: {
                root: 'rounded-none',
            },
        }"
    >
        <template #header>
            <div class="flex items-center gap-10">
                <span class="font-bold text-lg">{{ row.title }}</span>
                <div class="flex items-center gap-5">
                    <Button
                        icon="pi pi-pencil"
                        severity="secondary"
                        text
                        @click="emit('clickEditRow', row);"
                    />
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        @click="showDeleteRowConfirmation"
                    />
                    <Button
                        icon="pi pi-file-plus"
                        severity="primary"
                        text
                        @click="$emit('clickAddBody', row.id)"
                    />
                </div>
            </div>
        </template>
        <template #icons>
            <Button
                v-if="row.headers.length <= 0"
                :icon="'pi ' + (isWrapEnabled ? 'pi-arrows-v' : 'pi-arrows-h')"
                severity="secondary"
                text
                @click="isWrapEnabled = !isWrapEnabled"
            />
        </template>

        <div
            class="overflow-x-auto"
            @dragover.prevent
        >
            <div class="row">
                <!-- Header Cards -->
                <div
                    v-if="row.headers.length > 0"
                    :class="`flex gap-${CARD_GAP}`"
                >
                    <div
                        v-for="(header) in row.headers"
                        :key="header.id"
                        class="relative shrink-0"
                    >
                        <ColumnHeader
                            :header-data="header"
                        />
                    </div>
                </div>

                <!-- Draggable Cards -->
                <div
                    class="rowbody"
                    :class="[{ 'flex-wrap': isWrapEnabled }, `gap-${CARD_GAP}`]"
                    @dragover.prevent
                >
                    <template v-if="row.bodies.length > 0">
                        <div
                            v-for="(body, index) in row.bodies"
                            :key="body.id"
                            class="relative shrink-0"
                        >
                            <!-- Drop zone before card -->
                            <div
                                class="drop-zone half-card inset-y-0 -left-2 transition-colors"
                                :class="{ 'drop-zone-active': activeDropZone === index }"
                                @dragover="handleDragOver($event, index)"
                                @dragleave="handleDragLeave"
                                @drop="handleDrop($event, index)"
                            />

                            <ColumnBody
                                :body-data="body"
                                :source-row-id="row.id"
                                @dragover="handleDragOver($event, index)"
                                @dragleave="handleDragLeave"
                                @drag-start="(cardId) => $emit('dragStart', cardId, row.id)"
                                @click-edit="$emit('clickEditBody', $event)"
                            />

                            <!-- Drop zone after card -->
                            <div
                                class="drop-zone half-card inset-y-0 -right-2 transition-colors"
                                :class="{ 'drop-zone-active': activeDropZone === index + 1 }"
                                @dragover="handleDragOver($event, index + 1)"
                                @dragleave="handleDragLeave"
                                @drop="handleDrop($event, index + 1)"
                            />
                        </div>

                        <!-- Extra drop zone after the last card -->
                        <div
                            v-if="row.bodies.length < row.headers.length"
                            class=" rowempty drop-zone transition-colors"
                            :class="{ 'drop-zone-active': isEmptyDropZoneActive }"
                            :style="{ width: extraDropZoneWidthStyle }"
                            @dragover="handleEmptyDragOver"
                            @dragleave="handleEmptyDragLeave"
                            @drop="handleEmptyDrop($event, row.bodies.length)"
                        >
                            <span>Drop cards here or add a new card via "+"</span>
                        </div>
                    </template>

                    <!-- Empty Row & Drop Zone -->
                    <div
                        v-else
                        class="rowempty drop-zone transition-colors"
                        :class="{ 'drop-zone-active': isEmptyDropZoneActive }"
                        @dragover="handleEmptyDragOver"
                        @dragleave="handleEmptyDragLeave"
                        @drop="handleEmptyDrop($event, row.bodies.length)"
                    >
                        <span>Drop cards here or add a new card via "+"</span>
                    </div>
                </div> <!-- End of Draggable Cards -->

                <!-- Footer cards -->
                <div
                    v-if="row.footers.length > 0"
                    :class="`flex gap-${CARD_GAP}`"
                >
                    <div
                        v-for="(footer) in row.footers"
                        :key="footer.id"
                        class="relative shrink-0"
                    >
                        <ColumnFooter
                            :footer-data="footer"
                        />
                    </div>
                </div>
            </div> <!-- End of Row -->
        </div> <!-- End of Row Scroll Container -->
    </Panel>
</template>

<style scoped>
@reference "../index.css";
.drop-zone-active {
    @apply bg-primary-200/85 z-50;
}
.half-card {
    width: calc(var(--card-width) / 2);
    @apply absolute;
}
.row {
    @apply flex flex-col space-y-0 px-2 py-1 w-full min-w-fit;
    @apply transition-colors relative;
}
.rowbody {
    @apply flex w-full min-h-32;
}
.rowempty {
    @apply flex w-full justify-center items-center text-center;
    @apply text-xl text-surface-400;
    @apply border-2 border-dashed border-surface-500;
    @apply my-2;
}
</style>
