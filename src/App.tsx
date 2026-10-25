import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRoute, routeToHash } from './lib/router';
import { useProgress } from './lib/progress';
import { DEV_TOOLS } from './lib/devmode';
import { decorative } from './content/content';
import { TopBar } from './components/TopBar';
import { FloatingBackground } from './art/Decor';
import { PasswordGate } from './screens/PasswordGate';
import { Welcome } from './screens/Welcome';
import { MapScreen } from './screens/MapScreen';
import { LevelScreen } from './screens/LevelScreen';
import { BonusWordle } from './screens/BonusWordle';
import Trophy from './screens/Trophy';
import { TipOff } from './screens/TipOff';

// Only loaded in dev mode; excluded from the deployed site.
const DevPanel = DEV_TOOLS ? lazy(() => import('./components/DevPanel')) : null;

export default function App() {
  const route = useRoute();
  const { unlocked } = useProgress();

  let screen: JSX.Element;
  let key: string;
  if (!unlocked) {
    screen = <PasswordGate />;
    key = 'gate';
  } else {
    key = routeToHash(route);
    switch (route.name) {
      case 'map':
        screen = <MapScreen />;
        break;
      case 'level':
        screen = <LevelScreen key={route.level} level={route.level} />;
        break;
      case 'bonus':
        screen = <BonusWordle />;
        break;
      case 'trophy':
        screen = <Trophy />;
        break;
      case 'tipoff':
        screen = <TipOff />;
        break;
      default:
        screen = <Welcome />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <FloatingBackground />
      <TopBar currentLevel={unlocked && route.name === 'level' ? route.level : undefined} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {screen}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="pb-6 pt-2 text-center font-hand text-xl text-berry-400">{decorative.footer}</footer>
      {DevPanel && (
        <Suspense fallback={null}>
          <DevPanel />
        </Suspense>
      )}
    </div>
  );
}
