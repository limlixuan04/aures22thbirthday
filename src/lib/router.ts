import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'level'; level: number }
  | { name: 'bonus' }
  | { name: 'trophy' };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (path === 'map') return { name: 'map' };
  if (path === 'bonus') return { name: 'bonus' };
  if (path === 'trophy') return { name: 'trophy' };
  const m = path.match(/^level\/(\d+)$/);
  if (m) return { name: 'level', level: Number(m[1]) };
  return { name: 'home' };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'map':
      return '#/map';
    case 'bonus':
      return '#/bonus';
    case 'trophy':
      return '#/trophy';
    case 'level':
      return `#/level/${route.level}`;
  }
}

export function navigate(route: Route): void {
  const hash = routeToHash(route);
  if (window.location.hash !== hash) window.location.hash = hash;
  window.scrollTo({ top: 0 });
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
