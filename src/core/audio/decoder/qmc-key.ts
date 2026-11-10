// QMC 密钥派生（移植自 unlock-music，QQ 音乐密钥体系）
import { TeaCipher } from './tea';

const SALT_LEN = 2;
const ZERO_LEN = 7;

// 静态混合密钥（用于 EncV2 密钥的两轮 TEA 解密）
const MIX_KEY1 = new Uint8Array([0x33, 0x38, 0x36, 0x5a, 0x4a, 0x59, 0x21, 0x40, 0x23, 0x2a, 0x24, 0x25, 0x5e, 0x26, 0x29, 0x28]);
const MIX_KEY2 = new Uint8Array([0x2a, 0x2a, 0x23, 0x21, 0x28, 0x23, 0x24, 0x25, 0x26, 0x5e, 0x61, 0x31, 0x63, 0x5a, 0x2c, 0x54]);

export function qmcDeriveKey(raw: Uint8Array): Uint8Array {
  let rawDec = base64ToBytes(new TextDecoder().decode(raw));
  const n = rawDec.length;
  if (n < 16) throw new Error('QMC 密钥长度过短');

  rawDec = decryptV2Key(rawDec);

  const simpleKey = simpleMakeKey(106, 8);
  const teaKey = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    teaKey[i << 1] = simpleKey[i]!;
    teaKey[(i << 1) + 1] = rawDec[i]!;
  }
  const sub = decryptTencentTea(rawDec.subarray(8), teaKey);
  const out = new Uint8Array(8 + sub.length);
  out.set(rawDec.subarray(0, 8), 0);
  out.set(sub, 8);
  return out;
}

// tan 函数生成的盐值密钥（与官方客户端一致）
export function simpleMakeKey(salt: number, length: number): number[] {
  const keyBuf: number[] = [];
  for (let i = 0; i < length; i++) {
    const tmp = Math.tan(salt + i * 0.1);
    keyBuf[i] = 0xff & (Math.abs(tmp) * 100.0);
  }
  return keyBuf;
}

function decryptV2Key(key: Uint8Array): Uint8Array {
  if (key.length < 18 || new TextDecoder().decode(key.slice(0, 18)) !== 'QQMusic EncV2,Key:') {
    return key;
  }
  let out = decryptTencentTea(key.slice(18), MIX_KEY1);
  out = decryptTencentTea(out, MIX_KEY2);
  const keyDec = base64ToBytes(new TextDecoder().decode(out));
  if (keyDec.length < 16) throw new Error('QMC EncV2 密钥解码失败');
  return keyDec;
}

// 腾讯 TEA-CBC 变体
// 密文格式: PadLen(1) + Padding(0-7) + Salt(2) + Body + Zero(7)
function decryptTencentTea(inBuf: Uint8Array, key: Uint8Array): Uint8Array {
  if (inBuf.length % 8 !== 0) throw new Error('TEA 输入必须是 8 的倍数');
  if (inBuf.length < 16) throw new Error('TEA 输入过短');

  const blk = new TeaCipher(key, 32);
  const tmpBuf = new Uint8Array(8);
  const tmpView = new DataView(tmpBuf.buffer);

  blk.decrypt(tmpView, new DataView(inBuf.buffer, inBuf.byteOffset, 8));

  const nPadLen = tmpBuf[0]! & 0x7;
  const outLen = inBuf.length - 1 - nPadLen - SALT_LEN - ZERO_LEN;
  if (outLen < 0) throw new Error('TEA 填充长度非法');
  const outBuf = new Uint8Array(outLen);

  let ivPrev = new Uint8Array(8);
  let ivCur = inBuf.slice(0, 8);
  let inBufPos = 8;
  let tmpIdx = 1 + nPadLen;

  const cryptBlock = () => {
    ivPrev = ivCur;
    ivCur = inBuf.slice(inBufPos, inBufPos + 8);
    for (let j = 0; j < 8; j++) tmpBuf[j] = tmpBuf[j]! ^ ivCur[j]!;
    blk.decrypt(tmpView, tmpView);
    inBufPos += 8;
    tmpIdx = 0;
  };

  // 跳过 Salt
  for (let i = 1; i <= SALT_LEN; ) {
    if (tmpIdx < 8) {
      tmpIdx++;
      i++;
    } else {
      cryptBlock();
    }
  }

  // 还原明文
  let outBufPos = 0;
  while (outBufPos < outLen) {
    if (tmpIdx < 8) {
      outBuf[outBufPos] = tmpBuf[tmpIdx]! ^ ivPrev[tmpIdx]!;
      outBufPos++;
      tmpIdx++;
    } else {
      cryptBlock();
    }
  }

  // 校验 Zero
  for (let i = 1; i <= ZERO_LEN; i++) {
    if (tmpBuf[tmpIdx] !== ivPrev[tmpIdx]) throw new Error('TEA zero 校验失败');
    tmpIdx++;
  }
  return outBuf;
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, '');
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
