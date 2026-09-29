/**
 * Files, as one zip.
 *
 * A shapefile is five files, and a zip is how a GIS office expects them. Written
 * here rather than with a library: the format is a header before each file and a
 * directory at the end, and the compression is the browser's own
 * `CompressionStream`. jszip, which the shapefile writers on npm bring, is about
 * 100 KB for the same result.
 *
 * Deflated where the browser can, stored where it cannot. Both are plain zip,
 * which every reader opens. Names are written as UTF-8 and flagged so, since a
 * file's stem is a menu row's and may be in any script.
 *
 * No zip64, so no file or archive past 4 GB, which is far beyond anything a
 * browser tab builds.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** The CRC-32 a zip records for each file, over its bytes before compression. */
export const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

/**
 * Bytes, deflated with nothing around them, as a zip holds them. Null where the
 * browser has no `deflate-raw`, which Safari before 16.4 lacks.
 */
const deflate = async (bytes) => {
  if (typeof CompressionStream === 'undefined') return null;
  let stream;
  try {
    stream = new CompressionStream('deflate-raw');
  } catch {
    return null;
  }
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
};

/** A date as MS-DOS writes it, which is what a zip records: local time, to two seconds. */
const dosTime = (date) => (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
const dosDate = (date) => (Math.max(date.getFullYear() - 1980, 0) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

/** Bit 11: the name is UTF-8. Without it a reader takes the name as code page 437. */
const UTF8_NAMES = 0x0800;
const STORED = 0;
const DEFLATED = 8;

/**
 * A zip of the files given, in the order given.
 *
 * @param {Array<{name: string, bytes: Uint8Array}>} files
 * @param {Object} [options]
 * @param {Date} [options.now] - The time each file is stamped with.
 * @param {boolean} [options.compress] - `false` stores every file as it is.
 * @returns {Promise<Uint8Array>}
 */
export const zip = async (files, { now = new Date(), compress = true } = {}) => {
  const encoder = new TextEncoder();
  const time = dosTime(now);
  const date = dosDate(now);

  const entries = [];
  for (const { name, bytes } of files) {
    const deflated = compress ? await deflate(bytes) : null;
    // A file deflate cannot shrink is stored, as every zip tool does.
    const packed = deflated && deflated.length < bytes.length ? deflated : bytes;
    entries.push({
      name: encoder.encode(name),
      method: packed === bytes ? STORED : DEFLATED,
      crc: crc32(bytes),
      size: bytes.length,
      packed
    });
  }

  const total = entries.reduce((sum, entry) =>
    sum + 30 + entry.name.length + entry.packed.length + 46 + entry.name.length, 22);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let at = 0;

  const u16 = (value) => { view.setUint16(at, value, true); at += 2; };
  const u32 = (value) => { view.setUint32(at, value, true); at += 4; };
  const put = (bytes) => { out.set(bytes, at); at += bytes.length; };

  /** What the local header and the directory entry both say about a file. */
  const common = (entry) => {
    u16(20);                  // version needed to extract: 2.0, for deflate
    u16(UTF8_NAMES);
    u16(entry.method);
    u16(time);
    u16(date);
    u32(entry.crc);
    u32(entry.packed.length);
    u32(entry.size);
    u16(entry.name.length);
    u16(0);                   // no extra field
  };

  entries.forEach(entry => {
    entry.offset = at;
    u32(0x04034b50);
    common(entry);
    put(entry.name);
    put(entry.packed);
  });

  const directory = at;
  entries.forEach(entry => {
    u32(0x02014b50);
    u16(20);                  // made by: 2.0, MS-DOS attributes
    common(entry);
    u16(0);                   // no comment
    u16(0);                   // disk 0
    u16(0);                   // internal attributes
    u32(0);                   // external attributes
    u32(entry.offset);
    put(entry.name);
  });
  const directorySize = at - directory;

  u32(0x06054b50);
  u16(0);
  u16(0);
  u16(entries.length);
  u16(entries.length);
  u32(directorySize);
  u32(directory);
  u16(0);                     // no comment

  return out;
};
