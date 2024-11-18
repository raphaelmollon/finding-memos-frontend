<template>
  <v-app>
    <v-app-bar app image="vcard_background.webp">
      <v-img
        class="mx-2"
        src="favicon_128.png"
        max-height="40"
        max-width="40"
        contain
      ></v-img>
      <v-toolbar-title>
        {{ documentTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn :to="{ name: 'Home' }">Memos</v-btn>
        <v-btn :to="{ name: 'CategoriesTypes' }">Categories/Types</v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>


<script>
export default {
  name: 'App',

  components: {
  },

  data: () => ({
    documentTitle: "Finding Memo",
  }),

  mounted() {
    document.title = this.documentTitle;
  }
}
</script>
