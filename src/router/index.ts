import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '@/services/authService';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import EventsView from '@/views/EventsView.vue';
import PersonsView from '@/views/PersonsView.vue';
import CalendarView from '@/views/CalendarView.vue';
import AddPerson from '@/components/AddPerson.vue';
import EditPerson from '@/components/EditPerson.vue';
import AddEvent from '@/components/AddEvent.vue';
import EditEvent from '@/components/EditEvent.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView,
      meta: { requiresAuth: true },
    },
    {
      path: '/persons',
      name: 'persons',
      component: PersonsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/person/add',
      name: 'person-add',
      component: AddPerson,
      meta: { requiresAuth: true },
    },
    {
      path: '/person/edit/:id',
      name: 'person-edit',
      component: EditPerson,
      meta: { requiresAuth: true },
    },
    {
      path: '/event/add',
      name: 'event-add',
      component: AddEvent,
      meta: { requiresAuth: true },
    },
    {
      path: '/event/edit/:id',
      name: 'event-edit',
      component: EditEvent,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
