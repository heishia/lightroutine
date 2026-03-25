if (typeof globalThis.WeakRef === 'undefined') {
  globalThis.WeakRef = class WeakRef {
    constructor(target) { this._target = target; }
    deref() { return this._target; }
  };
}

if (typeof globalThis.FinalizationRegistry === 'undefined') {
  globalThis.FinalizationRegistry = class FinalizationRegistry {
    constructor() {}
    register() {}
    unregister() {}
  };
}

import 'expo-router/entry';
