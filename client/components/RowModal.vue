<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore.ts';
import type { RowData } from '@shared/types.ts';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { ref, watch } from 'vue';


const props = defineProps<{
    visible: boolean;
    rowData: RowData | null;
}>();

defineEmits<{
  'update:visible': [value: boolean];
}>();

const boardStore = useBoardStore();

const rowTitle = ref<string>('');
const numOfColsStr = ref<string>('');
const headerPrefix = ref<string>('');

watch(() => props.rowData, (editRow) => {
    if (editRow) {
        rowTitle.value = editRow.title;
        numOfColsStr.value = editRow.headers.length.toString();
        headerPrefix.value = editRow.headerPrefix;
    } else {
        rowTitle.value = '';
        numOfColsStr.value = '';
        headerPrefix.value = '';
    }
}, { immediate: true });

const handleCreate = () => {
    boardStore.createRow(rowTitle.value, Number(numOfColsStr.value), headerPrefix.value);
};

const handleUpdate = () => {
    if (!props.rowData) return;
    boardStore.updateRow(props.rowData.id, {
        title: rowTitle.value,
        headerPrefix: headerPrefix.value,
        numOfCols: Number(numOfColsStr.value),
    });
};
</script>

<template>
    <Dialog
        :visible="visible"
        :modal="true"
        :header="rowData ? 'Edit Row' : 'Create Row'"
        :position="'top'"
        class="w-full max-w-md"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label
                    for="row-title"
                    class="text-sm font-medium"
                >Title</label>
                <InputText
                    id="row-title"
                    v-model="rowTitle"
                    required
                    autofocus
                    placeholder="2025 Timeline"
                    class="border py-1 px-2"
                />
                <label
                    for="num-of-cols"
                    class="text-sm font-medium"
                >Number of columns</label>
                <InputText
                    id="num-of-cols"
                    v-model.number="numOfColsStr"
                    type="number"
                    min="0"
                    placeholder="12"
                    class="border py-1 px-2"
                />
                <label
                    for="header-prefix"
                    class="text-sm font-medium"
                >Column header prefix</label>
                <InputText
                    id="header-prefix"
                    v-model="headerPrefix"
                    placeholder="2025-"
                    class="border py-1 px-2"
                />
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between w-full">
                <Button
                    label="Cancel"
                    severity="danger"
                    @click="$emit('update:visible', false)"
                />
                <Button
                    :label="rowData ? 'Update' : 'Create'"
                    severity="primary"
                    @click="
                        rowData ? handleUpdate() : handleCreate();
                        $emit('update:visible', false)
                    "
                />
            </div>
        </template>
    </Dialog>
</template>
