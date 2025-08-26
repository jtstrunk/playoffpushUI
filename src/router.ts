import { createRouter, createRoute, redirect } from '@tanstack/react-router';
import { route as rootRoute } from './routes/__root';
import { route as indexRoute } from './routes/index';
import { route as loginRoute } from './routes/login';
import { route as draftRoute } from './routes/draft';
import { route as leagueRoute } from './routes/league';

type RouterContext = {
  loggedInUser: string | null;
};

const routeTree = rootRoute.addChildren([
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: indexRoute.component,
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/league',
    component: leagueRoute.component,
    beforeLoad: ({ context, location }) => {
      if (!context.loggedInUser) {
        throw redirect({
          to: '/login',
          search: {
            from: location.pathname,
          },
          throw: true,
        });
      }
    },
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: loginRoute.component,
    validateSearch: (search: Record<string, unknown>) => ({
      from: typeof search.from === 'string' ? search.from : undefined,
    }),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/draft',
    component: draftRoute.component,
    beforeLoad: ({ context, location }) => {
      if (!context.loggedInUser) {
        throw redirect({
          to: '/login',
          search: {
            from: location.pathname,
          },
          throw: true,
        });
      }
    },
  }),
]);


export const router = createRouter({
  routeTree,
  context: {
    loggedInUser: null, // will override dynamically in your app
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
