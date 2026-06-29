declare module 'jsencrypt' {
  export default class JSEncrypt {
    constructor();
    setPublicKey(publicKey: string): void;
    encrypt(message: string): string | false;
    decrypt(ciphertext: string): string | false;
  }

  export = JSEncrypt;
}
