import { createRouter, createWebHistory } from 'vue-router';
import store from '../store'; // Vuex store to manage auth state

import MemoManager from '@/components/MemoManager.vue';
import CategoryTypeManager from '@/components/CategoryTypeManager.vue';
import SignUpForm from '@/components/SignUpForm.vue';
import SignInForm from '@/components/SignInForm.vue';
import Forbidden from '@/components/Forbidden.vue';
import NotFound from '@/components/NotFound.vue';
import AdminPage from '@/components/AdminPage.vue';
import ProfilePage from '@/components/ProfilePage.vue';
import ConnectionManager from '@/components/ConnectionManager.vue';
import ValidateEmail from '@/components/ValidateEmail.vue';
import ResetPassword from '@/components/ResetPassword.vue';

const routes = [
    { path: '/', name: 'Home', component: MemoManager, meta: { requiresAuth: true } },
    { path: '/connections', name: 'Connections', component: ConnectionManager, meta: { requiresAuth: true } },
    { path: '/signin', name: 'SignIn', component: SignInForm },
    { path: '/signup', name: 'SignUp', component: SignUpForm },
    { path: '/categories-types', name: 'CategoriesTypes', component: CategoryTypeManager, meta: { requiresAuth: true, requiresSuperuser: true } },
    { path: '/administration', name: 'AdminPage', component: AdminPage, meta: { requiresAuth: true, requiresSuperuser: true } },
    { path: '/profile', name: 'ProfilePage', component: ProfilePage, meta: { requiresAuth: true } },
    { path: '/forbidden', name: 'Forbidden', component: Forbidden },
    { path: '/validate-email', name: 'ValidateEmail', component: ValidateEmail },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    await store.dispatch('validateSession');

    const isAuthenticated = store.getters.isAuthenticated;  // from Vuex store
    if (isAuthenticated) {
        if (to.name === 'SignIn' || to.name === 'SignUp') {
            return next('/');
        }
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        return next('/signin')
    }

    const isSuperuser = store.getters.isSuperuser;
    if (to.meta.requiresSuperuser && !isSuperuser) {
        store.dispatch('triggerSnackbar', { message: 'Access denied.', type: 'error' });
        return next('/forbidden');
    }

    next();
});

export default router;
