<template>
  <v-app>
    <v-app-bar
      app
      color="black"
      dark
    >
      <v-toolbar-title class="d-flex align-center">
        <v-img
          alt="Prodemge Logo"
          class="shrink mr-2"
          contain
          src="https://www.prodemge.gov.br/images/logo_prodemge/logo_prodemge.png"
          transition="scale-transition"
          width="200"
          @click="goToHome"
        />
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn text @click="goToHome">HOME</v-btn>
      <v-btn text @click="goToCadastro">CADASTRO DE PESSOAS</v-btn>
      <v-btn text @click="goToConsulta">CONSULTA DE PESSOAS</v-btn>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  methods: {
    goToHome() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      } else {
        window.location.reload();
      }
    },
    goToCadastro() {
      if (this.$route.path !== '/person/new') {
        this.$router.push('/person/new');
      } else {
        window.location.reload();
      }
    },
    goToConsulta() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      } else {
        window.location.reload();
      }
    }
  }
};
</script>

<style>

</style>
