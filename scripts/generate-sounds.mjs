// 合成三份音效 WAV（16-bit PCM, 单声道, 44100Hz），无需任何外部素材。
// 运行：node scripts/generate-sounds.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'sounds');
mkdirSync(OUT_DIR, { recursive: true });

const SR = 44100;

function writeWav(file, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32); // block align
  buf.writeUInt16LE(16, 34); // bits
  buf.write('data', 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT_DIR, file), buf);
  console.log('wrote', file, (n / SR).toFixed(2) + 's');
}

/** 单个音符：正弦 + 二次谐波，带 attack 与指数衰减包络 */
function tone(freq, dur, amp, { attack = 0.004, harmonic = 0.3, decay = 0 } = {}) {
  const n = Math.floor(SR * dur);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    out[i] = (Math.sin(2 * Math.PI * freq * t) + harmonic * Math.sin(2 * Math.PI * freq * 2 * t)) * amp * env;
  }
  return out;
}

/** 按起始时间混合多段，并归一化峰值到 0.8 */
function mix(segments, totalDur) {
  const n = Math.floor(SR * totalDur);
  const out = new Float64Array(n);
  for (const [start, samples] of segments) {
    const off = Math.floor(start * SR);
    for (let i = 0; i < samples.length && off + i < n; i++) out[off + i] += samples[i];
  }
  let peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0) {
    const g = 0.8 / peak;
    for (let i = 0; i < n; i++) out[i] *= g;
  }
  return out;
}

// 1) click —— 清脆落子声（木质短促 "tock"）
{
  const n = Math.floor(SR * 0.09);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] =
      (0.7 * Math.sin(2 * Math.PI * 780 * t) * Math.exp(-t * 50) +
        0.25 * Math.sin(2 * Math.PI * 390 * t) * Math.exp(-t * 80) +
        0.15 * Math.sin(2 * Math.PI * 1560 * t) * Math.exp(-t * 110)) *
      0.7;
  }
  writeWav('click.wav', out);
}

// 2) win —— 欢快上行琶音 C5 - E5 - G5 - C6
{
  const segments = [
    [0.0, tone(523.25, 0.2, 0.5, { harmonic: 0.4, decay: 6 })],
    [0.13, tone(659.25, 0.2, 0.5, { harmonic: 0.4, decay: 6 })],
    [0.26, tone(783.99, 0.2, 0.5, { harmonic: 0.4, decay: 6 })],
    [0.39, tone(1046.5, 0.45, 0.55, { harmonic: 0.5, decay: 3.5 })],
  ];
  writeWav('win.wav', mix(segments, 0.92));
}

// 3) error —— 轻柔下行提示音 C5 -> G4
{
  const segments = [
    [0.0, tone(523.25, 0.12, 0.35, { harmonic: 0.15, decay: 8 })],
    [0.12, tone(392.0, 0.16, 0.35, { harmonic: 0.15, decay: 7 })],
  ];
  writeWav('error.wav', mix(segments, 0.34));
}
