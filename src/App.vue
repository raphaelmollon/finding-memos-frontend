<template>
  <v-app>
    <!-- Unique snackbar for the whole app -->
    <SnackBar v-model="snackbarShow"
      :type="snackbar.type"
      :message="snackbar.message"
    />


    <!-- Main toolbar -->
    <v-app-bar app image="vcard_background.webp" density="compact">
      <template v-slot:prepend>
        <v-avatar class="mx-2" image="favicon_128.png" max-height="40" max-width="40" contain style="cursor: pointer" @click="$router.push('/')"></v-avatar>
      </template>
      <template v-slot:append>
        <v-btn icon @click="drawer = !drawer" v-if="isAuthenticated && isMobile">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">
        <!-- <v-img class="mx-2" src="favicon_128.png" max-height="40" max-width="40" contain></v-img> -->
        {{ documentTitle }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items v-if="!loading">
        <template v-for="item in menu" :key="item.name">
          <v-btn v-if="(isAuthenticated && item.needAuth
            && (isSuperuser || !item.needSuperuser) 
            && (!isMobile || item.routeName == $route.name))
            || (!isAuthenticated && !item.needAuth)"
            :to="item.routeName ? { name: item.routeName } : null"
            :key="item.name"
            :id="'toolbar-'+item.name.replace(/\s+/g,'-').toLowerCase()"
            active-color="blue"
            :color="item.color ? item.color : ''"
            @click="item.func ? $options.methods[item.func].call(this) : null">
            <v-tooltip activator="parent" location="bottom">
              {{ item.name }}
            </v-tooltip>
              <v-icon>{{ item.icon }}</v-icon>
            <span class="ml-2" v-if="$route.name === item.routeName">{{ item.name }}</span>
          </v-btn>
        </template>
      </v-toolbar-items>
    </v-app-bar>

    <!-- Navigation drawer -->
    <v-navigation-drawer app temporary v-model="drawer" v-if="isAuthenticated && isMobile"
      color="dark-grey" location="right">
      <v-list :lines="false" density="compact" nav>
        <template v-for="(item, index) in menu" :key="item.name">
          <v-list-item variant="text" :base-color="item.color ? item.color : ''" color="blue"
            :id="'drawer-'+item.name.replace(/\s+/g,'-').toLowerCase()"
            :to="item.routeName ? { name: item.routeName } : null"
            v-if="(isAuthenticated && item.needAuth && (isSuperuser || !item.needSuperuser))
              || (!isAuthenticated && !item.needAuth)" 
            @click="item.func ? $options.methods[item.func].call(this) : null"> <!--  -->
            <template #prepend><v-icon>{{ item.icon }}</v-icon></template>
            {{ item.name }}
          </v-list-item>
          <!-- divider after item when next exists and belongs to a different group -->
          <v-list-item type="divider"
            v-if="index < menu.length - 1 && menu[index].group !== menu[index + 1].group"
            :key="'divider-'+index"
          ></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- Display current page determined by the router -->
    <v-main v-if="loading" class="d-flex align-center justify-center" style="min-height: 300px;">
      <v-progress-circular indeterminate size="64" color="light-blue"></v-progress-circular>
    </v-main>
    <v-main v-else>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>


<script>
import { mapGetters, mapActions } from 'vuex'
import SnackBar from './components/common/SnackBar.vue';

export default {
  name: 'App',

  components: {
    SnackBar,
  },

  data: () => ({
    documentTitle: "Finding Memos",
    loading: true,
    drawer: false,
    isMobile: false,
    mobileThreshold: 1100,
    menu: [
      {
        name:"Memos",
        icon:"mdi-note-multiple-outline",
        routeName: "Memos",
        needAuth: true,
        func: null,
        group: "main",
      },
      {
        name:"Connections",
        icon:"mdi-database-outline",
        routeName: "Connections",
        needAuth: true,
        func: null,
        group: "main",
      },
      {
        name:"Recovery Procedures",
        icon:"mdi-file-cog-outline",
        routeName: "Procedures",
        needAuth: true,
        func: null,
        group: "main",
      },
      {
        name:"String Tools",
        icon:"mdi-code-braces",
        routeName: "StringTools",
        needAuth: true,
        func: null,
        group: "main",
      },
      {
        name:"Categories / Types",
        icon:"mdi-shape-outline",
        routeName: "CategoriesTypes",
        needAuth: true,
        needSuperuser: true,
        func: null,
        color: "orange",
        group: "admin",
      },
      {
        name:"Administration",
        icon:"mdi-shield-account-outline",
        routeName: "AdminPage",
        needAuth: true,
        needSuperuser: true,
        func: null,
        color: "orange",
        group: "admin",
      },
      {
        name:"Profile",
        icon:"mdi-account",
        routeName: "ProfilePage",
        needAuth: true,
        func: null,
        group: "account",
      },
      {
        name:"Sign in",
        icon:"mdi-login",
        routeName: "SignIn",
        needAuth: false,
        func: null,
        color: "green",
        group: "account",
      },
      {
        name:"Sign up",
        icon:"mdi-account-plus",
        routeName: "SignUp",
        needAuth: false,
        func: null,
        color: "light-green",
        group: "account",
      },
      {
        name:"Sign out",
        icon:"mdi-lock-outline",
        routeName: null,
        needAuth: true,
        func: "signOut",
        color: "red",
        group: "account",
      },
    ],
  }),

  computed: {
    ...mapGetters(['isAuthenticated', 'isSuperuser', 'getUser', 'getServerURL', 'getSnackbar']),
    snackbar() {
      return this.getSnackbar;
    },
    snackbarShow: {
      get() { return this.getSnackbar.show; },
      set(v) { if (!v) this.triggerSnackbar(); }
    },
  },

  methods: {
    ...mapActions(['triggerSnackbar']),
    async signOut() {
      const response = await fetch(this.getServerURL+'/auth/sign-out', {
        method: 'POST',
        credentials: 'include'  // include session cookie
      });

      if (response.ok) {
        this.$router.push('/signin');
        this.triggerSnackbar({message: 'Good bye!'})
      }
    },
    onResize() {
      const mobile = window.innerWidth < this.mobileThreshold;
      if (mobile !== this.isMobile) {
        this.isMobile = mobile;
        if (!mobile) {
          this.drawer = false;
        }
      }
    }
  },

  mounted() {
    document.title = this.documentTitle;
    this.isMobile = window.innerWidth < this.mobileThreshold;
    window.addEventListener('resize', this.onResize);

    setTimeout(() => {
      this.loading = false;
    }, 2000);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  },
}
</script>
