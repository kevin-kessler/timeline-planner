<script setup lang="ts">
import { useBoardStore } from '@client/stores/BoardStore';
import type { BodyData } from '@shared/types';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { ref, watch } from 'vue';


const props = defineProps<{
    visible: boolean;
    rowId: string | null;
    bodyData: BodyData | null;
}>();

defineEmits<{
    'update:visible': [value: boolean];
}>();

const boardStore = useBoardStore();

const title = ref('');
const description = ref('');
const note = ref('');

watch(() => props.bodyData, (editBody) => {
    if (editBody) {
        title.value = editBody.title;
        description.value = editBody.description;
        note.value = editBody.note || '';
    } else {
        title.value = '';
        description.value = '';
        note.value = '';
    }
}, { immediate: true });

const handleCreate = () => {
    if (!props.rowId) return;
    boardStore.createBody(props.rowId, title.value, description.value, note.value);
};

const handleUpdate = () => {
    if (!props.bodyData) return;
    boardStore.updateBody(props.bodyData.id, {
        title: title.value,
        description: description.value,
        note: note.value,
    });
};
</script>

<template>
    <Dialog
        :visible="visible"
        :modal="true"
        :header="bodyData ? 'Edit Body Card' : 'Create Body Card'"
        :position="'top'"
        class="w-full max-w-md"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label
                    for="title"
                    class="text-sm font-medium"
                >Title</label>
                <InputText
                    id="title"
                    v-model="title"
                    autofocus
                    placeholder="FGC Commander"
                    class="border py-1 px-2"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label
                    for="description"
                    class="text-sm font-medium"
                >Description</label>
                <Textarea
                    id="description"
                    v-model="description"
                    rows="5"
                    auto-resize
                    placeholder="Hardening I
New Features"
                    class="border py-1 px-2"
                />
            </div>

            <div class="flex flex-col gap-2">
                <label
                    for="note"
                    class="text-sm font-medium"
                >Note</label>
                <InputText
                    id="note"
                    v-model="note"
                    placeholder="Due 2025-12-31"
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
                    :label="bodyData ? 'Update' : 'Create'"
                    severity="primary"
                    @click="
                        bodyData ? handleUpdate() : handleCreate();
                        $emit('update:visible', false);
                    "
                />
            </div>
        </template>
    </Dialog>
</template>
