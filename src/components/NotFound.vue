<template>
  <v-container class="text-center fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="8">
        <h1 class="text-h1 pb-5">
          <v-icon color="error">mdi-dice-4</v-icon>
          <v-icon color="error">mdi-emoticon-dead</v-icon>
          <v-icon color="error">mdi-dice-4</v-icon>
        </h1>
        <h1 class="text-h3 pb-5">There's nothing here...</h1>
        <p class="text-body-1 pb-5">
          I don't know what you are looking for, but it's not here.
        </p>
        <v-btn color="primary" @click="$router.push('/')">
          Go Back to Home
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "NotFoundPage",
};
</script>
