<template>
    <v-row class="align-content-center justify-center">
        <v-col cols="auto" class="align-content-center justify-center">
            <v-switch v-model="localDefaultDisplay" 
                :loading="savingPreferences"
                label="Open by default" inset color="success" 
                hide-details="true" class="py-0">
            </v-switch>
        </v-col>
        <v-col cols="auto">
            <v-switch v-model="localFilterUser"
                :loading="savingPreferences"
                label="Show my memos only" inset color="success" 
                hide-details="true" class="py-0">
            </v-switch>
        </v-col>
        <v-col cols="auto">
            <v-switch v-model="localUseParams"
                :loading="savingPreferences"
                label="Activate params (TODO)" inset color="success" 
                hide-details="true" class="py-0">
            </v-switch>
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'PreferencesPanel',
    props: {
        defaultDisplay: {
        type: Boolean,
        default: false
        },
        filterUser: {
        type: Boolean,
        default: false
        },
        useParams: {
        type: Boolean,
        default: false
        },
        savingPreferences: {
        type: Boolean,
        default: false
        }
    },
    emits: [
        'update:defaultDisplay',
        'update:filterUser',
        'update:useParams'
    ],
    data() {
        return {
            localDefaultDisplay: this.defaultDisplay,
            localFilterUser: this.filterUser,
            localUseParams: this.useParams,
        };
    },
    watch: {
        defaultDisplay(newVal) {
            this.localDefaultDisplay = newVal;
        },
        filterUser(newVal) {
            this.localFilterUser = newVal;
        },
        useParams(newVal) {
            this.localUseParams = newVal;
        },
        localDefaultDisplay(newVal) {
            this.$emit('update:defaultDisplay', newVal);
        },
        localFilterUser(newVal) {
            this.$emit('update:filterUser', newVal);
        },
        localUseParams(newVal) {
            this.$emits('update:useParams', newVal);
        }
    }
}
</script>