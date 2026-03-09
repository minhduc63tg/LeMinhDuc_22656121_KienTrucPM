import { EventEmitter } from "events";
import type { IEventBus } from "./types";

export class EventBus implements IEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(200);
  }

  emit<T>(event: string, payload: T): void {
    this.emitter.emit(event, payload);
  }

  /** Trả về hàm unsubscribe để dọn dẹp */
  on<T>(event: string, handler: (payload: T) => void): () => void {
    this.emitter.on(event, handler);
    return () => this.emitter.off(event, handler);
  }

  once<T>(event: string, handler: (payload: T) => void): void {
    this.emitter.once(event, handler);
  }

  off(event: string, handler: Function): void {
    this.emitter.off(event, handler as any);
  }
}
