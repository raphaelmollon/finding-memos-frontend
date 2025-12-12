<template>
    <v-row>
      <v-col cols="12" class="d-flex align-center flex-wrap justify-center" v-if="loading">
        <v-btn v-for="i in loadingCount" :key="i" variant="tonal" tile :loading="true" :size="itemSize" class="mx-1" disabled></v-btn>
      </v-col>
      <v-col cols="12" class="d-flex align-center flex-wrap justify-center" v-else>
        <!-- Reset selection -->
        <v-btn
          @click="$emit('reset-items')"
          :color="selectedItems.length === 0 ? 'primary' : ''"
          :variant="selectedItems.length === 0 ? 'tonal' : 'plain'"
          :active="selectedItems.length === 0"
          tile
          :size="itemSize"
        >
          {{ allLabel }}
        </v-btn>

        <!-- List all selectable categories -->
        <v-btn
          v-for="item in items"
          :key="item[itemKey]"
          @click="$emit('toggle-item', item[itemKey])"
          :color="selectedItems.includes(item[itemKey]) ? 'primary' : ''"
          :variant="selectedItems.includes(item[itemKey]) ? 'tonal' : 'plain'"
          :active="selectedItems.includes(item[itemKey])"
          tile
          :size="itemSize"
        >
          {{ item[itemTitle] }}
        </v-btn>
      </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'FilterAsMenu',
    props: {
      items: {
        type: Array,
        required: true
      },
      selectedItems: {
        type: Array,
        required: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      loadingCount: {
        type: Number,
        default: 5
      },
      itemKey: {
        type: String,
        default: 'id'
      },
      itemTitle: {
        type: String,
        default: 'name'
      },
      allLabel: {
        type: String,
        default: 'All'
      },
      itemSize: {
        type: String,
        default: 'medium'
      },
    },
    emits: [
      'reset-items',
      'toggle-item'
    ]
}
</script>