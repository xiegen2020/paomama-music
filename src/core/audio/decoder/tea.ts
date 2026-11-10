// TEA 加密算法 (Needham-Wheeler 1994)，移植自 golang.org/x/crypto/tea
// 用于 QQ 音乐 QMC 密钥派生（大端序、32 轮）

export class TeaCipher {
  static readonly BlockSize = 8;
  static readonly KeySize = 16;
  static readonly delta = 0x9e3779b9;

  private readonly k0: number;
  private readonly k1: number;
  private readonly k2: number;
  private readonly k3: number;
  private readonly rounds: number;

  constructor(key: Uint8Array, rounds = 64) {
    if (key.length !== 16) throw new Error('TEA 密钥必须是 16 字节');
    if (rounds & 1) throw new Error('TEA 轮数必须是偶数');
    const k = new DataView(key.buffer, key.byteOffset, key.byteLength);
    this.k0 = k.getUint32(0, false);
    this.k1 = k.getUint32(4, false);
    this.k2 = k.getUint32(8, false);
    this.k3 = k.getUint32(12, false);
    this.rounds = rounds;
  }

  encrypt(dst: DataView, src: DataView): void {
    let v0 = src.getUint32(0, false);
    let v1 = src.getUint32(4, false);
    let sum = 0;
    for (let i = 0; i < this.rounds / 2; i++) {
      sum = sum + TeaCipher.delta;
      v0 += ((v1 << 4) + this.k0) ^ (v1 + sum) ^ ((v1 >>> 5) + this.k1);
      v1 += ((v0 << 4) + this.k2) ^ (v0 + sum) ^ ((v0 >>> 5) + this.k3);
    }
    dst.setUint32(0, v0, false);
    dst.setUint32(4, v1, false);
  }

  decrypt(dst: DataView, src: DataView): void {
    let v0 = src.getUint32(0, false);
    let v1 = src.getUint32(4, false);
    let sum = (TeaCipher.delta * this.rounds) / 2;
    for (let i = 0; i < this.rounds / 2; i++) {
      v1 -= ((v0 << 4) + this.k2) ^ (v0 + sum) ^ ((v0 >>> 5) + this.k3);
      v0 -= ((v1 << 4) + this.k0) ^ (v1 + sum) ^ ((v1 >>> 5) + this.k1);
      sum -= TeaCipher.delta;
    }
    dst.setUint32(0, v0, false);
    dst.setUint32(4, v1, false);
  }
}

// 加密单个 8 字节分组，返回 8 字节
export function teaEncryptBlock(key: Uint8Array, block: Uint8Array, rounds = 32): Uint8Array {
  const cipher = new TeaCipher(key, rounds);
  const out = new Uint8Array(8);
  cipher.encrypt(
    new DataView(out.buffer),
    new DataView(block.buffer, block.byteOffset, 8)
  );
  return out;
}

export function teaDecryptBlock(key: Uint8Array, block: Uint8Array, rounds = 32): Uint8Array {
  const cipher = new TeaCipher(key, rounds);
  const out = new Uint8Array(8);
  cipher.decrypt(
    new DataView(out.buffer),
    new DataView(block.buffer, block.byteOffset, 8)
  );
  return out;
}
