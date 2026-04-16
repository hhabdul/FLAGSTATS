const store = new Map();

function createStorageShim() {
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      const normalized = String(key);
      return store.has(normalized) ? store.get(normalized) : null;
    },
    key(index) {
      const keys = [...store.keys()];
      return keys[index] ?? null;
    },
    removeItem(key) {
      store.delete(String(key));
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    }
  };
}

try {
  const current = globalThis.localStorage;
  const needsShim =
    !current ||
    typeof current.getItem !== "function" ||
    typeof current.setItem !== "function" ||
    typeof current.removeItem !== "function" ||
    typeof current.clear !== "function" ||
    typeof current.key !== "function";

  if (needsShim) {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: createStorageShim()
    });
  }
} catch (error) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    enumerable: true,
    writable: true,
    value: createStorageShim()
  });
}
