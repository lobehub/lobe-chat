import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 24_000;
const DURATION = 0.8;
const PEAK = 0.72;
const FADE_OUT = 0.012;

/** Rosewood marimba bar: the second partial is tuned to the 4th harmonic, not a whole ratio. */
const WOOD: Partial[] = [
  { amp: 1, decay: 9, ratio: 1 },
  { amp: 0.28, decay: 21.6, ratio: 3.99 },
];

/** Glass bell partials are deliberately inharmonic — whole ratios read as a synth, not a bell. */
const GLASS: Partial[] = [
  { amp: 1, decay: 3.2, ratio: 1 },
  { amp: 0.3, decay: 5.12, ratio: 2.01 },
  { amp: 0.12, decay: 8, ratio: 3.02 },
];

const NOTES = [
  { freq: 698.5, gain: 1, seed: 7, start: 0 },
  { freq: 1046.5, gain: 0.88, seed: 11, start: 0.09 },
];

interface Partial {
  amp: number;
  decay: number;
  ratio: number;
}

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d_2b_79_f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (((t ^ (t >>> 14)) >>> 0) / 4_294_967_296) * 2 - 1;
};

const addVoice = (
  buffer: Float64Array,
  {
    attack = 0.004,
    freq,
    gain,
    partials,
    start,
    tail,
  }: {
    attack?: number;
    freq: number;
    gain: number;
    partials: Partial[];
    start: number;
    tail: number;
  },
) => {
  const offset = Math.round(SAMPLE_RATE * start);
  const length = Math.min(buffer.length - offset, Math.round(SAMPLE_RATE * tail));
  for (let i = 0; i < length; i += 1) {
    const t = i / SAMPLE_RATE;
    let sample = 0;
    for (const { amp, decay, ratio } of partials) {
      sample += amp * Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * ratio * t);
    }
    buffer[offset + i] += gain * Math.min(1, t / attack) * sample;
  }
};

const addMallet = (buffer: Float64Array, start: number, gain: number, seed: number) => {
  const random = mulberry32(seed);
  const offset = Math.round(SAMPLE_RATE * start);
  const coefficient = 1800 / SAMPLE_RATE;
  let lowpass = 0;
  for (let i = 0; i < Math.round(SAMPLE_RATE * 0.02); i += 1) {
    lowpass += coefficient * (random() - lowpass);
    buffer[offset + i] += gain * lowpass * Math.exp((-260 * i) / SAMPLE_RATE);
  }
};

const render = () => {
  const buffer = new Float64Array(Math.round(SAMPLE_RATE * DURATION));

  for (const { freq, gain, seed, start } of NOTES) {
    addVoice(buffer, { freq, gain, partials: WOOD, start, tail: 0.7 });
    addMallet(buffer, start, 0.14 * gain, seed);
    addVoice(buffer, {
      attack: 0.02,
      freq: freq * 2,
      gain: 0.14 * gain,
      partials: GLASS,
      start: start + 0.02,
      tail: 0.95,
    });
  }

  let peak = 0;
  for (const value of buffer) peak = Math.max(peak, Math.abs(value));

  // The glass tail is still audible at the cut; the fade only kills the step, a longer
  // taper would swallow the bloom that gives the chime its depth.
  const fadeLength = Math.round(SAMPLE_RATE * FADE_OUT);
  const fadeStart = buffer.length - fadeLength;
  const samples = new Int16Array(buffer.length);
  for (const [i, element] of buffer.entries()) {
    let value = (element / peak) * PEAK;
    if (i > fadeStart) value *= (buffer.length - i) / fadeLength;
    samples[i] = Math.round(Math.max(-1, Math.min(1, value)) * 32_767);
  }
  return samples;
};

// UNNotificationSound resolves names only from ~/Library/Sounds, and only AIFF — a WAV
// there silently falls back to the system alert sound.
const toAiff = (samples: Int16Array) => {
  const data = Buffer.alloc(samples.length * 2);
  for (const [i, sample] of samples.entries()) data.writeInt16BE(sample, i * 2);

  const rate = Buffer.alloc(10);
  const exponent = Math.floor(Math.log2(SAMPLE_RATE));
  rate.writeUInt16BE(16_383 + exponent, 0);
  rate.writeBigUInt64BE(BigInt(Math.round((SAMPLE_RATE / 2 ** exponent) * 2 ** 31)) << 32n, 2);

  const comm = Buffer.alloc(26);
  comm.write('COMM', 0);
  comm.writeUInt32BE(18, 4);
  comm.writeUInt16BE(1, 8);
  comm.writeUInt32BE(samples.length, 10);
  comm.writeUInt16BE(16, 14);
  rate.copy(comm, 16);

  const ssnd = Buffer.alloc(16);
  ssnd.write('SSND', 0);
  ssnd.writeUInt32BE(data.length + 8, 4);

  const form = Buffer.alloc(12);
  form.write('FORM', 0);
  form.writeUInt32BE(4 + comm.length + ssnd.length + data.length, 4);
  form.write('AIFF', 8);
  return Buffer.concat([form, comm, ssnd, data]);
};

const toWav = (samples: Int16Array) => {
  const data = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
};

const samples = render();
const outputs: [string, Buffer][] = [
  ['public/sounds/chat-complete.wav', toWav(samples)],
  ['apps/desktop/resources/sounds/lobehub-complete.aiff', toAiff(samples)],
];

for (const [file, content] of outputs) {
  const output = path.resolve(process.cwd(), file);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, content);
  console.log(`Wrote ${output} (${DURATION}s, ${SAMPLE_RATE}Hz mono)`);
}
