import type { Application } from "express";

/** Metadata của mỗi plugin */
export interface PluginMeta {
  id: string; // 'cms-blog'
  name: string;
  version: string; // semver: '1.0.0'
  description: string;
  author?: string;
  requires?: string[]; // IDs của plugin phụ thuộc
}

/** Context được kernel inject vào plugin khi init */
export interface PluginContext {
  app: Application; // Express instance
  events: IEventBus;
  services: IServiceRegistry;
  hooks: IHookSystem;
  config: Record<string, unknown>;
  logger: ILogger;
}

/** Interface mọi plugin phải implement */
export interface IPlugin {
  meta: PluginMeta;
  install: (ctx: PluginContext) => Promise<void>;
  activate?: (ctx: PluginContext) => Promise<void>;
  deactivate?: (ctx: PluginContext) => Promise<void>;
  uninstall?: (ctx: PluginContext) => Promise<void>;
}
/** Event Bus interface */
export interface IEventBus {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void): () => void;
  once<T>(event: string, handler: (payload: T) => void): void;
  off(event: string, handler: Function): void;
}

/** Service Registry interface */
export interface IServiceRegistry {
  register<T>(token: string, service: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
}

export interface IHookSystem {
  addFilter<T>(name: string, fn: (value: T) => T, priority?: number): void;
  applyFilter<T>(name: string, value: T): T;
  addAction(
    name: string,
    fn: (...args: any[]) => void,
    priority?: number,
  ): void;
  doAction(name: string, ...args: any[]): void;
}

export interface ILogger {
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
  debug(...args: any[]): void;
}
