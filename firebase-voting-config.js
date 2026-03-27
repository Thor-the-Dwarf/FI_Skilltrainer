(() => {
  const defaults = {
    enabled: false,
    allowLocalOverride: true,
    mode: "preview",
    sdkVersion: "12.7.0",
    app: {
      apiKey: "",
      authDomain: "",
      projectId: "",
      appId: "",
      storageBucket: "",
      messagingSenderId: "",
      measurementId: ""
    },
    firestore: {
      feedbackCollection: "doomscroll_feedback",
      voteCollection: "votes",
      commentCollection: "comments",
      commentLimit: 12
    }
  };

  const current = window.__FI_SKILLTRAINER_FIREBASE__ && typeof window.__FI_SKILLTRAINER_FIREBASE__ === "object"
    ? window.__FI_SKILLTRAINER_FIREBASE__
    : {};

  window.__FI_SKILLTRAINER_FIREBASE__ = {
    enabled: typeof current.enabled === "boolean" ? current.enabled : defaults.enabled,
    allowLocalOverride: typeof current.allowLocalOverride === "boolean" ? current.allowLocalOverride : defaults.allowLocalOverride,
    mode: typeof current.mode === "string" ? current.mode : defaults.mode,
    sdkVersion: typeof current.sdkVersion === "string" ? current.sdkVersion : defaults.sdkVersion,
    app: {
      ...defaults.app,
      ...(current.app && typeof current.app === "object" ? current.app : {})
    },
    firestore: {
      ...defaults.firestore,
      ...(current.firestore && typeof current.firestore === "object" ? current.firestore : {})
    }
  };
})();
