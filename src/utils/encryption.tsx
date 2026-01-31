// src/utils/encryption.ts
export const encryptMessage = (text: string): string => {
  // Efeito visual de "criptografia" estilo hacker
  const transformations = [
    (char: string) => `[${char.charCodeAt(0).toString(16).toUpperCase()}]`,
    (char: string) => `{${char}}`,
    (char: string) => char === ' ' ? '▓' : char,
    (char: string) => `\`${char}\``,
    (char: string) => char
  ];
  
  return text.split('').map((char, index) => {
    if (char === ' ') return ' ';
    const transform = transformations[index % transformations.length];
    return transform(char);
  }).join('');
};

export const decryptMessage = (text: string): string => {
  return text
    .replace(/\[([A-F0-9]+)\]/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/[{}`]/g, '')
    .replace(/▓/g, ' ');
};

// Efeito de digitação progressiva
export const typeWithEncryption = async (
  text: string, 
  callback: (msg: string) => void,
  speed: number = 50
): Promise<void> => {
  let displayed = '';
  for (let i = 0; i < text.length; i++) {
    displayed += text[i];
    const encrypted = encryptMessage(displayed);
    callback(encrypted);
    await new Promise(resolve => setTimeout(resolve, speed));
  }
};