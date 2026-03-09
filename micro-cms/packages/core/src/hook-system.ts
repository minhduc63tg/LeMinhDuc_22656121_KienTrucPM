import type { IHookSystem } from "./types";

type HookEntry = { fn: Function; priority: number };

export class HookSystem implements IHookSystem {
  private filters = new Map<string, HookEntry[]>();
  private actions = new Map<string, HookEntry[]>();

  private add(
    map: Map<string, HookEntry[]>,
    name: string,
    fn: Function,
    priority = 10,
  ) {
    const hooks = map.get(name) ?? [];
    hooks.push({ fn, priority });
    hooks.sort((a, b) => a.priority - b.priority);
    map.set(name, hooks);
  }

  addFilter<T>(name: string, fn: (v: T) => T, priority = 10): void {
    this.add(this.filters, name, fn, priority);
  }

  applyFilter<T>(name: string, value: T): T {
    const hooks = this.filters.get(name) ?? [];
    return hooks.reduce((v, h) => h.fn(v), value);
  }

  addAction(name: string, fn: (...args: any[]) => void, priority = 10): void {
    this.add(this.actions, name, fn, priority);
  }

  doAction(name: string, ...args: any[]): void {
    const hooks = this.actions.get(name) ?? [];
    hooks.forEach((h) => h.fn(...args));
  }
}
