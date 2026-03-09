import type { IServiceRegistry } from "./types";

export class ServiceRegistry implements IServiceRegistry {
  private services = new Map<string, unknown>();

  register<T>(token: string, service: T): void {
    if (this.services.has(token)) {
      throw new Error(`Service "${token}" đã được đăng ký`);
    }
    this.services.set(token, service);
  }

  resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service "${token}" không tồn tại`);
    }
    return service as T;
  }

  has(token: string): boolean {
    return this.services.has(token);
  }
}
