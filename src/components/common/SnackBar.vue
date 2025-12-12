<template>
    <v-snackbar :model-value="modelValue" 
        @update:model-value="value => $emit('update:modelValue', value)"
        :timeout="type === 'success' ? 3000 : 6000" 
        :color="type" 
        location="top"
        timer="darkgrey"
    >
        <template v-slot:actions>
        <v-btn
            color="white"
            text
            @click="$emit('update:modelValue', false)"
        >
            <v-icon>mdi-close</v-icon>
        </v-btn>
        </template>
        {{ message }}
    </v-snackbar>
</template>

<script>
export default {
    name: 'SnackBar',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: 'success'
        },
        message: {
            type: String,
            default: ''
        }
    },
    emit: ['update:modelValue'],
}
</script>