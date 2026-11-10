interface WorkletDescriptor {
  name: string;
  url: string;
  node: AudioWorkletNode | null;
}

class WorkletRegistry {
  private worklets = new Map<string, WorkletDescriptor>();
  private useFallback = false;

  async register(name: string, url: string, ctx: AudioContext): Promise<boolean> {
    try {
      await ctx.audioWorklet.addModule(url);
      this.worklets.set(name, { name, url, node: null });
      return true;
    } catch {
      this.useFallback = true;
      console.warn(`AudioWorklet "${name}" not available, using fallback`);
      return false;
    }
  }

  async createNode(name: string, ctx: AudioContext): Promise<AudioWorkletNode | null> {
    const desc = this.worklets.get(name);
    if (!desc) return null;
    try {
      const node = new AudioWorkletNode(ctx, name);
      desc.node = node;
      return node;
    } catch {
      return null;
    }
  }

  isFallback(): boolean {
    return this.useFallback;
  }
}

export const workletRegistry = new WorkletRegistry();
