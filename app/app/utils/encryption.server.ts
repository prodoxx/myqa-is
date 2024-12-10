import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from 'crypto';

export function generateSymmetricKey(): string {
  return randomBytes(32).toString('hex');
}

export function hashContent(content: string): Buffer {
  return createHash('sha256').update(content).digest();
}

export function encryptContent(content: string, key: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptContent(encryptedContent: string, key: string): string {
  const [ivHex, content] = encryptedContent.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
