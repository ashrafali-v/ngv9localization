import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

  encryptAES256(textToBeEncrypted: string) {    
  var salt = CryptoJS.lib.WordArray.random(16);

  // Using a random guid to create encryption key using PBKDF2 algorithm.
  var key = CryptoJS.PBKDF2('e9a794ee-f629-4be0-abf9-d5d490e6f126', salt, {
      keySize: 8,
      iterations: 100
    });

  // Creating a random encryption IV similar to salt.
  var iv = CryptoJS.lib.WordArray.random(16);  

  // AES encrption using key and IV.
  var encrypted = CryptoJS.AES.encrypt(textToBeEncrypted, key, { 
    iv: iv, 
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC        
  });

  // Combining everything together as a base64 string.
  var base64EncryptedText = CryptoJS.enc.Base64.stringify(salt.concat(iv).concat(encrypted.ciphertext)); 
  var encodedCipherText = encodeURIComponent(base64EncryptedText);
  return encodedCipherText;
  }
}
