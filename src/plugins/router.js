import { createRouter, createWebHistory } from 'vue-router';
import MemoManager from '../components/MemoManager.vue'; // votre composant existant pour les mémos
import CategoryTypeManager from '../components/CategoryTypeManager.vue'; // le nouveau composant

const routes = [
    { path: '/', name: 'Home', component: MemoManager },
    { path: '/categories-types', name: 'CategoriesTypes', component: CategoryTypeManager },
    // Ajoutez d'autres routes si nécessaire
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
