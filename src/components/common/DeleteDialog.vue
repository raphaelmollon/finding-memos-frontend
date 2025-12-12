<template>
    <v-dialog :model-value="modelValue" 
        @update:model-value="value => $emit('update:modelValue', value)"
        width="auto">
        <v-card class="ma-2">
            <v-card-title class="headline">Confirm Deletion</v-card-title>
            <v-card-text>
            Are you sure you want to delete {{ thingLabel }} <strong>{{ thing }}</strong>?
            This action cannot be undone.
            </v-card-text>
            <v-card-actions>
                <v-btn color="green darken-1" text @click="$emit('update:modelValue', false)">Cancel</v-btn>
                <v-btn color="red darken-1" text @click="$emit('confirm-delete')">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'DeleteDialog',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        thingLabel: {
            type: String,
            default: 'thing'
        },
        thing: {
            type: String,
            default: ''
        },
    },
    emits: [
        'update:modelValue',
        'confirm-delete'
    ],
}
</script>