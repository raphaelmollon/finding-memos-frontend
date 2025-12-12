<template>
  <v-container fluid>
    Procedures
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProcedureManager',
  components: {
  },
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    ...mapGetters(['getServerURL']),
  },
  methods: {
    ...mapActions(['triggerSnackbar']),
  },
  async mounted() {
    this.loading = false;
  },
  beforeUnmount() {
  },
  watch: {
  },
};
</script>

<style scoped lang="scss">
  .fade-transition {
    transition: opacity 0.5s ease;
  }

  .fade-enter-active, .fade-leave-active {
    opacity: 1;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
