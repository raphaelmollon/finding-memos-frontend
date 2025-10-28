import { createStore } from 'vuex';

const store = createStore({
    state: {
        user: null,
        snackbar: false,
        snackbarMessage: '',
        snackbarType: 'success', // 'success', 'error', etc.
        serverURL: process.env.VUE_APP_API_URL,
        environment: process.env.VUE_APP_ENV,
    },
    getters: {
        isAuthenticated: state => !!state.user,
        isSuperuser: state => state.user?.is_superuser,
        getUser: state => state.user,
        getServerURL: state => state.serverURL,
        isDevelopment: (state) => state.environment === 'development',
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        clearUser(state) {
            state.user = null;
        },
        showSnackbar(state, { message, type = 'success' }) {
            state.snackbar = true;
            state.snackbarMessage = message;
            state.snackbarType = type;
        },
        hideSnackbar(state) {
            state.snackbar = false;
            state.snackbarMessage = '';
            state.snackbarType = 'success';
        },
    },
    actions: {
        setUser({ commit }, user) {
            commit('setUser', user);
        },
        clearUser({ commit }) {
            commit('clearUser');
        },
        async validateSession({ commit, getters }) {
            try {
                const response = await fetch(getters.getServerURL + '/auth/session-check', {
                    method: 'GET',
                    credentials: 'include', // Include cookies for session validation
                });

                if (response.ok) {
                    const { user } = await response.json();
                    commit('setUser', user);
                } else if (response.headers.get('X-Session-Timeout') === 'true') {
                    commit('showSnackbar', { message: 'Woops! Where have you been? You need to sign in again.', type: 'error' });
                    commit('clearUser');
                } else {
                    throw new Error('Failed to validate session');
                }
            } catch (error) {
                commit('clearUser');
            }
        },
        triggerSnackbar({ commit }, payload) {
            commit('showSnackbar', payload);
        },

        async fetchAvatars({ getters }) {
            const response = await fetch(getters.getServerURL + '/users/avatars', {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to fetch avatars')
            }

            return await response.json()
        },

        async updateUserProfile({ getters, dispatch, commit }, profileData) {
            const response = await fetch(getters.getServerURL + '/users/me', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
                // throw new Error('Failed to update profile')
            }

            const result = await response.json()

            // Update user in state if necessary
            if (result.user) {
                commit('setUser', result.user)
            }

            dispatch('triggerSnackbar', {
                message: 'Profile updated successfully!',
                type: 'success'
            })

            return result
        }
    }
});

export default store;