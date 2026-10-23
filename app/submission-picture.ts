export const PICTURE_LIMIT = 4 * 1024 * 1024;

export const PICTURE_TYPE_MESSAGE = "Use a jpeg, png, or webp picture.";
export const PICTURE_SIZE_MESSAGE = "The picture must be 4MB or smaller.";
export const PICTURE_STORE_MESSAGE = "The picture could not be stored.";
export const PICTURE_SHOW_MESSAGE = "The picture could not be shown.";

const OBJECT_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/;

export function isSubmissionImagePath(value: string) {
  return OBJECT_PATH.test(value);
}

function sniff(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function expected(type: string): "jpg" | "png" | "webp" | null {
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

export function checkedPicture(file: { type: string; size: number; bytes: Uint8Array }):
  | { ok: true; ext: "jpg" | "png" | "webp"; mime: "image/jpeg" | "image/png" | "image/webp" }
  | { ok: false; message: string } {
  const kind = expected(file.type);
  if (!kind || sniff(file.bytes) !== kind) {
    return { ok: false, message: PICTURE_TYPE_MESSAGE };
  }
  if (file.size > PICTURE_LIMIT || file.bytes.byteLength > PICTURE_LIMIT) {
    return { ok: false, message: PICTURE_SIZE_MESSAGE };
  }
  const mime = kind === "jpg" ? "image/jpeg" : kind === "png" ? "image/png" : "image/webp";
  return { ok: true, ext: kind, mime };
}
