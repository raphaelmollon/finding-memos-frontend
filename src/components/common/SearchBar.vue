<template>
    <v-row>
        <v-col cols="12" offset-xl="3" xl="6" offset-lg="2" lg="8" offset-md="1" md="10" class="my-0 pb-0">
        <v-text-field
            :model-value="modelValue"
            @update:model-value="value => $emit('update:modelValue', value)"
            placeholder="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            :hint="hintValue"
            :persistent-hint="hintValue ? true : false"
            clearable
        ></v-text-field>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'SearchBar',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        hintValue: {
            type: String,
            default:''
        }
    },
    emits: ['update:modelValue']
}
</script>