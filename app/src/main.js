/**
 * Démarrage et câblage. Aucune logique de jeu ici : on assemble les modules.
 */
import { GAME, TECH } from './config.js';
import { seedFrom } from './core/rng.js';
import { buildRules } from './core/rules.js';
import { loadAll, browserFetcher } from './content/loader.js';
import { validateAll } from './content/validate.js';
import { EventBus } from './app/EventBus.js';
import { Scheduler } from './app/Scheduler.js';
import { StateMachine } from './app/StateMachine.js';
import { Store } from './app/Store.js';
import { Session } from './app/Session.js';
import { STATES } from './app/states.js';
import { Stage } from './ui/Stage.js';
import { createStrings } from './ui/strings.js';
import { createTitleScreen } from './ui/screens/title.js';
import { createCombatScreen } from './ui/screens/combat.js';
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

  // Graine du prochain combat rapide : tirée de l'heure, renouvelée à chaque match,
  // sauf si elle a été saisie dans le panneau debug (même graine = même match, pour reproduire un bug).
  const seeds = { next: seedFrom(Date.now()), locked: false };
  const store = new Store();
  const session = new Session({ store, bus, ctx: { defs, rules: buildRules(GAME) } });
  const query = new URLSearchParams(location.search);
  // Délai de réflexion de l'IA (GD §9.13). En mode debug, ?aiDelay=0 l'accélère pour les tests.
  const forcedDelay = debugEnabled ? Number(query.get(TECH.AI_DELAY_QUERY_PARAM) ?? NaN) : NaN;
  const aiDelay = () => (Number.isFinite(forcedDelay) && forcedDelay >= 0
    ? forcedDelay
    : GAME.AI_DELAY_MIN + Math.round(Math.random() * (GAME.AI_DELAY_MAX - GAME.AI_DELAY_MIN)));
  const ctx = { t, bus, scheduler, tech: TECH, sm, session, aiDelay, navigate: null };

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
  const screens = { TITLE: createTitleScreen(), COMBAT: createCombatScreen() };
  let current = null;
  const show = (name) => {
    current?.unmount();
    scheduler.clear();
    current = screens[name];
    current.mount(screenRoot, ctx);
  };
  /** Navigation entre écrans : titre, ou nouveau combat rapide (depuis le titre ou « Rejouer »). */
  ctx.navigate = (name) => {
    if (name === 'COMBAT') {
      if (sm.main !== 'PLAYING') sm.go('PLAYING');
      const seed = seeds.next;
      if (!seeds.locked) seeds.next = seedFrom(Date.now() + seed);
      current?.unmount();
      current = null;
      session.startQuickMatch(seed);
      sm.enter('COMBAT');
    } else {
      session.end();
      sm.go(name);
    }
    show(name);
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
      getSeed: () => seeds.next,
      setSeed: (n) => {
        seeds.next = n;
        seeds.locked = true;
      },
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
        nextSeed: seeds.next,
        game: session.state?.game ?? null,
        match: session.state?.match ?? null,
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
