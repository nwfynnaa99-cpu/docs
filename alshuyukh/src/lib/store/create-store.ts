"use client";

import { useSyncExternalStore } from "react";

/** Minimal external store (~30 lines) — avoids a state-library dependency. */
export function createStore<T>(initial: T, opts?: { persistKey?: string }) {
  let state = initial;
  const listeners = new Set<() => void>();
  let hydrated = false;

  const hydrate = () => {
    if (hydrated || !opts?.persistKey || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(opts.persistKey);
      if (raw) state = { ...state, ...JSON.parse(raw) };
    } catch {
      /* private mode or corrupted value: start fresh */
    }
  };

  const get = () => {
    hydrate();
    return state;
  };
  const set = (next: T | ((s: T) => T)) => {
    hydrate();
    state = typeof next === "function" ? (next as (s: T) => T)(state) : next;
    if (opts?.persistKey) {
      try {
        window.localStorage.setItem(opts.persistKey, JSON.stringify(state));
      } catch {
        /* storage full or blocked */
      }
    }
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  function useStore(): T;
  function useStore<S>(selector: (s: T) => S): S;
  function useStore<S>(selector?: (s: T) => S) {
    return useSyncExternalStore(
      subscribe,
      () => (selector ? selector(get()) : get()),
      () => (selector ? selector(initial) : initial),
    );
  }
  return { get, set, subscribe, useStore };
}
