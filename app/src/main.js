/**
 * Démarrage et câblage. Aucune logique de jeu ici : on assemble les modules.
 */
import { TECH } from './config.js';
import { seedFrom } from './core/rng.js';
import { loadAll, browserFetcher } from './content/loader.js';
import { validateAll } from './content/validate.js';
import { EventBus } from './app/EventBus.js';
import { Scheduler } from './app/Scheduler.js';
import { StateMachine } from './app/StateMachine.js';
import { STATES } from './app/states.js';
import { Stage } from './ui/Stage.js';
import { createStrings } from './ui/strings.js';
import { createTitleScreen } from './ui/screens/title.js';
import { createRotateScreen } from './ui/screens/rotate.js';
import { showCrash, installCrashHandlers } from './ui/screens/crash.js';
import { InputHandler } from './input/InputHandler.js';
import { DEFAULT_BINDINGS } from './input/bindings.js';
import * as platform from './platform/platform.js';
import { DebugPanel } from './debug/DebugPanel.js';

const DATA_URL = new URL('../data/', import.meta.url);

async function boot() {
  const doc = document;
  const root = doc.documentElement;
  const bus = new EventBus();
  const scheduler = new Scheduler();
  const sm = new StateMachine(STATES, { bus, logMax: TECH.DEBUG_LOG_MAX });

  // Le DOM expose l'état courant (styles et tests navigateur), sans variable globale.
  const reflectState = () => {
    root.dataset.state = sm.sub ?? sm.main;
    root.dataset.overlay = sm.overlay ?? '';
  };
  bus.on('STATE_CHANGED', reflectState);
  reflectState();

  const stage = new Stage(doc.getElementById('stage'), TECH);
  stage.start();

  const defs = validateAll(await loadAll(browserFetcher(DATA_URL)));
  const t = createStrings(defs.strings);
  doc.title = t('game.title');

  const debugEnabled = new URLSearchParams(location.search).get(TECH.DEBUG_QUERY_PARAM) === '1';
  const input = new InputHandler(window, bus, { bindings: DEFAULT_BINDINGS, debug: debugEnabled, tech: TECH });
  input.start();

  // Graine de session : tirée de l'heure. Elle deviendra la graine de la partie au J4.
  const session = { seed: seedFrom(Date.now()) };
  const ctx = { t, bus, scheduler, tech: TECH };

  // Rotation : écran superposé et pause (GD §14.5).
  const rotate = createRotateScreen();
  rotate.mount(doc.getElementById('rotate'), ctx);
  const checkOrientation = () => {
    const needed = platform.needsRotation();
    if (needed) {
      sm.push('ROTATE_DEVICE');
      scheduler.pause();
    } else {
      sm.pop('ROTATE_DEVICE');
      if (!doc.hidden) scheduler.resume();
    }
    rotate.update(needed);
  };
  platform.onOrientationChange(checkOrientation);
  platform.onPause(() => scheduler.pause());
  platform.onResume(() => {
    if (!sm.has('ROTATE_DEVICE')) scheduler.resume();
  });

  // Écrans : un seul monté à la fois dans la scène.
  const screenRoot = doc.getElementById('screens');
  const screens = { TITLE: createTitleScreen() };
  let current = null;
  const show = (name) => {
    current?.unmount();
    current = screens[name] ?? null;
    current?.mount(screenRoot, ctx);
  };

  // WARNING et PRESS_KEY arrivent au J6 : BOOT mène directement au titre provisoire.
  sm.go('TITLE');
  show('TITLE');
  checkOrientation();

  if (debugEnabled) {
    root.dataset.debug = '1';
    const panel = new DebugPanel(doc.getElementById('debug-root'), {
      t,
      tech: TECH,
      sm,
      getSeed: () => session.seed,
      setSeed: (n) => { session.seed = n; },
      getState: () => ({
        version: TECH.APP_VERSION,
        state: sm.snapshot(),
        profile: stage.layout.profile,
        viewport: stage.layout.viewport,
        stage: stage.layout.stage,
        scale: Number(stage.layout.scale.toFixed(3)),
        handheld: platform.isHandheld(),
        portrait: platform.isPortrait(),
        input: input.source,
        scheduler: { paused: scheduler.paused, pending: scheduler.size },
        data: Object.fromEntries(Object.entries(defs).map(([k, v]) => [k, Object.keys(v).length])),
        seed: session.seed,
      }),
    });
    bus.on('INPUT_ACTION', ({ action }) => {
      if (action === 'DEBUG') panel.toggle();
    });
  }

  // Les polices doivent être prêtes avant les captures ; on n'attend pas indéfiniment.
  await Promise.race([doc.fonts.ready, new Promise((resolve) => setTimeout(resolve, TECH.FONTS_TIMEOUT_MS))]);
  root.dataset.ready = '1';
}

installCrashHandlers();
boot().catch((err) => showCrash(err));
