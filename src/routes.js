import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from "@vkontakte/vk-mini-apps-router";

export const DEFAULT_ROOT = "default_root";
export const DEFAULT_VIEW = "default_view";

export const DEFAULT_VIEW_PANELS = {
  HOME: "home", // Убираем PERSIK
};

export const routes = RoutesConfig.create([
  // Удаляем панель для Persik
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [createPanel(DEFAULT_VIEW_PANELS.HOME, "/", [])]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
