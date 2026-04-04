const host = String(globalThis.location?.hostname || "").trim().toLowerCase();
const isLocalDevelopmentHost = host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";

const sharedModules = [
  "./frontend/effects/halo-background.js",
  "./frontend/i18n/ui-i18n.js",
  "./frontend/challenge/data.js",
  "./frontend/challenge/runtime.js",
  "./frontend/challenge/zuordnen.js",
  "./frontend/challenge/falscher-treffer.js",
  "./frontend/challenge/reihenfolge-sprint.js",
  "./frontend/challenge/fallende-karten.js",
  "./frontend/challenge/quick-code.js"
];

const localPresenterModules = [
  "./frontend/presenter/data.js",
  "./frontend/presenter/studio-store.js",
  "./frontend/presenter/studio-recorder.js",
  "./frontend/presenter/studio-ui.js",
  "./frontend/presenter/runtime.js"
];
const appRuntimeVersion = "feedback-cachebust-20260404-2307";

for (const modulePath of sharedModules) {
  await import(modulePath);
}

if (isLocalDevelopmentHost) {
  for (const modulePath of localPresenterModules) {
    await import(modulePath);
  }
}

await import(`./frontend/app/main.js?v=${appRuntimeVersion}`);
await import(`./frontend/comment-mode/runtime.js?v=${appRuntimeVersion}`);
