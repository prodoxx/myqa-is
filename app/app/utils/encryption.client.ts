export async function decryptContent(
  encryptedContent: string,
  key: string
): Promise<string> {
  const [ivHex, contentHex] = encryptedContent.split(':');
  const iv = Uint8Array.from(Buffer.from(ivHex, 'hex'));
  const content = Uint8Array.from(Buffer.from(contentHex, 'hex'));
  const keyBuffer = Uint8Array.from(Buffer.from(key, 'hex'));

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  // Decrypt the content
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    content
  );

  // Convert the decrypted content to a string
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(decryptedBuffer);
}
