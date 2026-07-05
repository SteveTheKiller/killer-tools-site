import { createRouter, createWebHistory } from 'vue-router';
import { config } from './config';
import { layouts } from './layouts/index';
import NotFound from './pages/404.page.vue';
import HomePage from './pages/Home.page.vue';
import { tools } from './tools';
import { routes as demoRoutes } from './ui/demo/demo.routes';

const toolsRoutes = tools.map(({ path, name, component, ...config }) => ({
  path,
  name,
  component,
  meta: { isTool: true, layout: layouts.toolLayout, name, ...config },
}));
const toolsRedirectRoutes = tools
  .filter(({ redirectFrom }) => redirectFrom && redirectFrom.length > 0)
  .flatMap(
    ({ path, redirectFrom }) => redirectFrom?.map(redirectSource => ({ path: redirectSource, redirect: path })) ?? [],
  );

// Failed dynamic imports strand the router on the old page: corrupted browser
// cache in dev (ERR_CACHE_READ_FAILURE on 304s) or stale hashed chunks on the
// live site after a deploy. A full page load at the target URL recovers both.
let lastChunkReload = 0;
function isChunkError(err: unknown): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i
    .test(String((err as Error)?.message ?? err));
}

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/About.vue'),
    },
    ...toolsRoutes,
    ...toolsRedirectRoutes,
    ...(config.app.env === 'development' ? demoRoutes : []),
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

router.onError((error, to) => {
  // Throttle: never loop reloads if the target chunk is genuinely gone
  if (isChunkError(error) && Date.now() - lastChunkReload > 10_000) {
    lastChunkReload = Date.now();
    window.location.assign(to.fullPath);
  }
});

export default router;
