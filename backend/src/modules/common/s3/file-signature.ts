const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  'image/png': (b) =>
    b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  'image/webp': (b) =>
    b.subarray(0, 4).toString() === 'RIFF' &&
    b.subarray(8, 12).toString() === 'WEBP',
  'application/pdf': (b) => b.subarray(0, 5).toString() === '%PDF-',
};

/** True unless the mimetype is known and the content's magic bytes disagree. */
export function matchesSignature(mimetype: string, content: Buffer): boolean {
  return SIGNATURES[mimetype]?.(content) ?? true; // ponytail: unknown types are trusted, add a signature to enforce
}
