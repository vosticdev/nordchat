// Simple encryption utilities using Web Crypto API
// In a production app, you'd want more sophisticated encryption

export const generateKeyPair = (): { publicKey: string; privateKey: string } => {
  // For demo purposes, we'll use a simple key generation
  // In production, use proper cryptographic key generation
  const publicKey = btoa(Math.random().toString(36) + Date.now().toString(36));
  const privateKey = btoa(Math.random().toString(36) + Date.now().toString(36));
  
  return { publicKey, privateKey };
};

export const encryptMessage = (message: string, privateKey: string): string => {
  try {
    // Simple encryption for demo purposes
    // In production, use proper encryption algorithms
    const encoded = btoa(message);
    const encrypted = encoded.split('').reverse().join('');
    return btoa(encrypted + privateKey.slice(0, 10));
  } catch (error) {
    console.error('Encryption failed:', error);
    return message; // Fallback to plain text
  }
};

export const decryptMessage = (encryptedMessage: string, privateKey: string): string => {
  try {
    // Simple decryption for demo purposes
    // In production, use proper decryption algorithms
    const decoded = atob(encryptedMessage);
    const withoutKey = decoded.slice(0, -10);
    const reversed = withoutKey.split('').reverse().join('');
    return atob(reversed);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedMessage; // Return encrypted message if decryption fails
  }
};

// More secure encryption using Web Crypto API (for production)
export const generateSecureKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptMessageSecure = async (
  message: string, 
  publicKey: CryptoKey
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    data
  );
  
  const uint8Array = new Uint8Array(encrypted);
  return btoa(Array.from(uint8Array, byte => String.fromCharCode(byte)).join(''));
};

export const decryptMessageSecure = async (
  encryptedMessage: string, 
  privateKey: CryptoKey
): Promise<string> => {
  const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    privateKey,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
