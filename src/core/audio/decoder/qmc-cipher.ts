// QMC 流密码（移植自 unlock-music）

export interface QmcStreamCipher {
  decrypt(buf: Uint8Array, offset: number): void;
}

// 静态密码盒（无密钥 trailer 的旧 QMC 文件）
export class QmcStaticCipher implements QmcStreamCipher {
  private static readonly staticCipherBox: Uint8Array = new Uint8Array([
    0x77, 0x48, 0x32, 0x73, 0xde, 0xf2, 0xc0, 0xc8,
    0x95, 0xec, 0x30, 0xb2, 0x51, 0xc3, 0xe1, 0xa0,
    0x9e, 0xe6, 0x9d, 0xcf, 0xfa, 0x7f, 0x14, 0xd1,
    0xce, 0xb8, 0xdc, 0xc3, 0x4a, 0x67, 0x93, 0xd6,
    0x28, 0xc2, 0x91, 0x70, 0xca, 0x8d, 0xa2, 0xa4,
    0xf0, 0x08, 0x61, 0x90, 0x7e, 0x6f, 0xa2, 0xe0,
    0xeb, 0xae, 0x3e, 0xb6, 0x67, 0xc7, 0x92, 0xf4,
    0x91, 0xb5, 0xf6, 0x6c, 0x5e, 0x84, 0x40, 0xf7,
    0xf3, 0x1b, 0x02, 0x7f, 0xd5, 0xab, 0x41, 0x89,
    0x28, 0xf4, 0x25, 0xcc, 0x52, 0x11, 0xad, 0x43,
    0x68, 0xa6, 0x41, 0x8b, 0x84, 0xb5, 0xff, 0x2c,
    0x92, 0x4a, 0x26, 0xd8, 0x47, 0x6a, 0x7c, 0x95,
    0x61, 0xcc, 0xe6, 0xcb, 0xbb, 0x3f, 0x47, 0x58,
    0x89, 0x75, 0xc3, 0x75, 0xa1, 0xd9, 0xaf, 0xcc,
    0x08, 0x73, 0x17, 0xdc, 0xaa, 0x9a, 0xa2, 0x16,
    0x41, 0xd8, 0xa2, 0x06, 0xc6, 0x8b, 0xfc, 0x66,
    0x34, 0x9f, 0xcf, 0x18, 0x23, 0xa0, 0x0a, 0x74,
    0xe7, 0x2b, 0x27, 0x70, 0x92, 0xe9, 0xaf, 0x37,
    0xe6, 0x8c, 0xa7, 0xbc, 0x62, 0x65, 0x9c, 0xc2,
    0x08, 0xc9, 0x88, 0xb3, 0xf3, 0x43, 0xac, 0x74,
    0x2c, 0x0f, 0xd4, 0xaf, 0xa1, 0xc3, 0x01, 0x64,
    0x95, 0x4e, 0x48, 0x9f, 0xf4, 0x35, 0x78, 0x95,
    0x7a, 0x39, 0xd6, 0x6a, 0xa0, 0x6d, 0x40, 0xe8,
    0x4f, 0xa8, 0xef, 0x11, 0x1d, 0xf3, 0x1b, 0x3f,
    0x3f, 0x07, 0xdd, 0x6f, 0x5b, 0x19, 0x30, 0x19,
    0xfb, 0xef, 0x0e, 0x37, 0xf0, 0x0e, 0xcd, 0x16,
    0x49, 0xfe, 0x53, 0x47, 0x13, 0x1a, 0xbd, 0xa4,
    0xf1, 0x40, 0x19, 0x60, 0x0e, 0xed, 0x68, 0x09,
    0x06, 0x5f, 0x4d, 0xcf, 0x3d, 0x1a, 0xfe, 0x20,
    0x77, 0xe4, 0xd9, 0xda, 0xf9, 0xa4, 0x2b, 0x76,
    0x1c, 0x71, 0xdb, 0x00, 0xbc, 0xfd, 0x0c, 0x6c,
    0xa5, 0x47, 0xf7, 0xf6, 0x00, 0x79, 0x4a, 0x11,
  ]);

  private getMask(offset: number): number {
    if (offset > 0x7fff) offset %= 0x7fff;
    return QmcStaticCipher.staticCipherBox[(offset * offset + 27) & 0xff]!;
  }

  decrypt(buf: Uint8Array, offset: number): void {
    for (let i = 0; i < buf.length; i++) {
      buf[i] = buf[i]! ^ this.getMask(offset + i);
    }
  }
}

// 映射密码（文件内嵌密钥，派生密钥 ≤300 字节）
export class QmcMapCipher implements QmcStreamCipher {
  private readonly key: Uint8Array;
  private readonly n: number;

  constructor(key: Uint8Array) {
    if (key.length === 0) throw new Error('QMC 映射密钥为空');
    this.key = key;
    this.n = key.length;
  }

  private static rotate(value: number, bits: number): number {
    const rotate = (bits + 4) % 8;
    const left = value << rotate;
    const right = value >> rotate;
    return (left | right) & 0xff;
  }

  decrypt(buf: Uint8Array, offset: number): void {
    for (let i = 0; i < buf.length; i++) {
      buf[i] = buf[i]! ^ this.getMask(offset + i);
    }
  }

  private getMask(offset: number): number {
    if (offset > 0x7fff) offset %= 0x7fff;
    const idx = (offset * offset + 71214) % this.n;
    return QmcMapCipher.rotate(this.key[idx]!, idx & 0x7);
  }
}

// 分段 RC4（派生密钥 >300 字节）
export class QmcRC4Cipher implements QmcStreamCipher {
  private static readonly FIRST_SEGMENT_SIZE = 0x80;
  private static readonly SEGMENT_SIZE = 5120;

  private readonly S: Uint8Array;
  private readonly N: number;
  private readonly key: Uint8Array;
  private readonly hash: number;

  constructor(key: Uint8Array) {
    if (key.length === 0) throw new Error('QMC RC4 密钥为空');
    this.key = key;
    this.N = key.length;

    this.S = new Uint8Array(this.N);
    for (let i = 0; i < this.N; ++i) this.S[i] = i & 0xff;
    let j = 0;
    for (let i = 0; i < this.N; ++i) {
      j = (this.S[i]! + j + this.key[i % this.N]!) % this.N;
      const t = this.S[i]!;
      this.S[i] = this.S[j]!;
      this.S[j] = t;
    }

    this.hash = 1;
    for (let i = 0; i < this.N; i++) {
      const value = this.key[i]!;
      if (!value) continue;
      const nextHash = (this.hash * value) >>> 0;
      if (nextHash === 0 || nextHash <= this.hash) break;
      this.hash = nextHash;
    }
  }

  decrypt(buf: Uint8Array, offset: number): void {
    let toProcess = buf.length;
    let processed = 0;
    const postProcess = (len: number): boolean => {
      toProcess -= len;
      processed += len;
      offset += len;
      return toProcess === 0;
    };

    // 初始段
    if (offset < QmcRC4Cipher.FIRST_SEGMENT_SIZE) {
      const lenSegment = Math.min(buf.length, QmcRC4Cipher.FIRST_SEGMENT_SIZE - offset);
      this.encFirstSegment(buf.subarray(0, lenSegment), offset);
      if (postProcess(lenSegment)) return;
    }

    // 对齐段
    if (offset % QmcRC4Cipher.SEGMENT_SIZE !== 0) {
      const lenSegment = Math.min(QmcRC4Cipher.SEGMENT_SIZE - (offset % QmcRC4Cipher.SEGMENT_SIZE), toProcess);
      this.encASegment(buf.subarray(processed, processed + lenSegment), offset);
      if (postProcess(lenSegment)) return;
    }

    // 批量段
    while (toProcess > QmcRC4Cipher.SEGMENT_SIZE) {
      this.encASegment(buf.subarray(processed, processed + QmcRC4Cipher.SEGMENT_SIZE), offset);
      postProcess(QmcRC4Cipher.SEGMENT_SIZE);
    }

    // 末尾不足一段
    if (toProcess > 0) {
      this.encASegment(buf.subarray(processed), offset);
    }
  }

  private encFirstSegment(buf: Uint8Array, offset: number): void {
    for (let i = 0; i < buf.length; i++) {
      buf[i] = buf[i]! ^ this.key[this.getSegmentKey(offset + i)]!;
    }
  }

  private encASegment(buf: Uint8Array, offset: number): void {
    const S = this.S.slice(0);
    const skipLen = (offset % QmcRC4Cipher.SEGMENT_SIZE) + this.getSegmentKey(Math.floor(offset / QmcRC4Cipher.SEGMENT_SIZE));

    let j = 0;
    let k = 0;
    for (let i = -skipLen; i < buf.length; i++) {
      j = (j + 1) % this.N;
      k = (S[j]! + k) % this.N;
      const t = S[k]!;
      S[k] = S[j]!;
      S[j] = t;
      if (i >= 0) {
        buf[i] = buf[i]! ^ S[(S[j]! + S[k]!) % this.N]!;
      }
    }
  }

  private getSegmentKey(id: number): number {
    const seed = this.key[id % this.N]!;
    const idx = Math.floor((this.hash / ((id + 1) * seed)) * 100.0);
    return idx % this.N;
  }
}
