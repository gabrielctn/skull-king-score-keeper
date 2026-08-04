import { inflateSync } from "node:zlib";

export interface PngInspection {
  width: number;
  height: number;
  bitDepth: 8;
  colorType: 2 | 6;
  opaque: boolean;
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const MAX_INFLATED_BYTES = 256 * 1024 * 1024;

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function paethPredictor(left: number, up: number, upLeft: number): number {
  const prediction = left + up - upLeft;
  const leftDistance = Math.abs(prediction - left);
  const upDistance = Math.abs(prediction - up);
  const upLeftDistance = Math.abs(prediction - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  return upDistance <= upLeftDistance ? up : upLeft;
}

export function inspectPng(buffer: Buffer): PngInspection {
  if (
    buffer.length < PNG_SIGNATURE.length ||
    !buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)
  ) {
    throw new Error("Invalid PNG signature");
  }

  let offset = PNG_SIGNATURE.length;
  let width: number | null = null;
  let height: number | null = null;
  let bitDepth: number | null = null;
  let colorType: number | null = null;
  let compression: number | null = null;
  let filterMethod: number | null = null;
  let interlace: number | null = null;
  let sawIend = false;
  const idatChunks: Buffer[] = [];

  while (offset < buffer.length) {
    if (offset + 12 > buffer.length) {
      throw new Error("Truncated PNG chunk header");
    }
    const length = buffer.readUInt32BE(offset);
    const typeStart = offset + 4;
    const dataStart = typeStart + 4;
    const dataEnd = dataStart + length;
    const chunkEnd = dataEnd + 4;
    if (chunkEnd > buffer.length) throw new Error("Truncated PNG chunk data");

    const typeBuffer = buffer.subarray(typeStart, dataStart);
    const type = typeBuffer.toString("ascii");
    const data = buffer.subarray(dataStart, dataEnd);
    const expectedCrc = buffer.readUInt32BE(dataEnd);
    const actualCrc = crc32(Buffer.concat([typeBuffer, data]));
    if (actualCrc !== expectedCrc) {
      throw new Error(`Invalid CRC for PNG ${type} chunk`);
    }

    if (type === "IHDR") {
      if (width !== null || offset !== PNG_SIGNATURE.length || length !== 13) {
        throw new Error("Invalid PNG IHDR chunk");
      }
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      compression = data[10];
      filterMethod = data[11];
      interlace = data[12];
    } else if (type === "IDAT") {
      if (width === null) throw new Error("PNG IDAT appears before IHDR");
      idatChunks.push(data);
    } else if (type === "IEND") {
      if (length !== 0) throw new Error("Invalid PNG IEND chunk");
      sawIend = true;
      offset = chunkEnd;
      break;
    }

    offset = chunkEnd;
  }

  if (!sawIend || offset !== buffer.length) {
    throw new Error("PNG must end with one complete IEND chunk");
  }
  if (
    width === null ||
    height === null ||
    bitDepth === null ||
    colorType === null ||
    compression === null ||
    filterMethod === null ||
    interlace === null
  ) {
    throw new Error("PNG is missing IHDR");
  }
  if (width < 1 || height < 1) throw new Error("PNG dimensions must be positive");
  if (bitDepth !== 8) {
    throw new Error(`Unsupported PNG bit depth ${bitDepth}; expected 8`);
  }
  if (colorType !== 2 && colorType !== 6) {
    throw new Error(
      `Unsupported PNG color type ${colorType}; expected RGB (2) or RGBA (6)`
    );
  }
  if (compression !== 0 || filterMethod !== 0) {
    throw new Error("Unsupported PNG compression or filter method");
  }
  if (interlace !== 0) {
    throw new Error("Interlaced PNG exports are unsupported");
  }
  if (idatChunks.length === 0) throw new Error("PNG has no IDAT data");

  const bytesPerPixel = colorType === 2 ? 3 : 4;
  const rowBytes = width * bytesPerPixel;
  const expectedInflatedBytes = (rowBytes + 1) * height;
  if (
    !Number.isSafeInteger(expectedInflatedBytes) ||
    expectedInflatedBytes > MAX_INFLATED_BYTES
  ) {
    throw new Error("PNG dimensions exceed the inspection safety limit");
  }

  let inflated: Buffer;
  try {
    inflated = inflateSync(Buffer.concat(idatChunks), {
      maxOutputLength: expectedInflatedBytes + 1,
    });
  } catch (error) {
    throw new Error(
      `Invalid compressed PNG data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  if (inflated.length !== expectedInflatedBytes) {
    throw new Error(
      `Invalid PNG scanline size: expected ${expectedInflatedBytes}, got ${inflated.length}`
    );
  }

  let previous = Buffer.alloc(rowBytes);
  let opaque = true;
  for (let row = 0; row < height; row++) {
    const scanlineStart = row * (rowBytes + 1);
    const filter = inflated[scanlineStart];
    if (filter > 4) throw new Error(`Unsupported PNG filter ${filter}`);

    const raw = inflated.subarray(scanlineStart + 1, scanlineStart + 1 + rowBytes);
    const reconstructed = Buffer.allocUnsafe(rowBytes);
    for (let column = 0; column < rowBytes; column++) {
      const left = column >= bytesPerPixel ? reconstructed[column - bytesPerPixel] : 0;
      const up = previous[column];
      const upLeft = column >= bytesPerPixel ? previous[column - bytesPerPixel] : 0;
      const predictor =
        filter === 0
          ? 0
          : filter === 1
            ? left
            : filter === 2
              ? up
              : filter === 3
                ? Math.floor((left + up) / 2)
                : paethPredictor(left, up, upLeft);
      reconstructed[column] = (raw[column] + predictor) & 0xff;
    }

    if (colorType === 6 && opaque) {
      for (let alpha = 3; alpha < rowBytes; alpha += 4) {
        if (reconstructed[alpha] !== 255) {
          opaque = false;
          break;
        }
      }
    }
    previous = reconstructed;
  }

  return {
    width,
    height,
    bitDepth: 8,
    colorType,
    opaque,
  };
}
