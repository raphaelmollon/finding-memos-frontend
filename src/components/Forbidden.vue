<template>
  <v-container class="text-center fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="8">
        <h1 class="text-h1 pb-5"><v-img src="403.png" width="320px" class="mx-auto"></v-img></h1>
        <h1 class="text-h3 pb-5">You cannot pass!</h1>
        <p class="text-body-1 pb-5">
          Maybe there's something, maybe there is not.. Anyway, you can't enter with those sneakers of yours.
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
  name: "ForbiddenPage",
};
</script>
