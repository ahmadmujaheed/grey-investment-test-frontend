import CryptoJS from "crypto-js";

// 🧠 Automatically detects environment settings based on your build system
const ENCRYPTION_KEY = 
  import.meta.env?.VITE_STORAGE_ENCRYPTION_KEY || // Vite environment syntax
  process.env?.REACT_APP_STORAGE_ENCRYPTION_KEY || // Create React App syntax
  "fallback_local_secret_development_key";         // Local emergency backup key

export const secureStorage = {
  getItem: (name) => {
    try {
      const encryptedData = localStorage.getItem(name);
      if (!encryptedData) return null;

      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      return JSON.parse(decryptedText);
    } catch (error) {
      console.error("Storage decryption failure:", error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      const plainText = JSON.stringify(value);
      const encryptedData = CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
      localStorage.setItem(name, encryptedData);
    } catch (error) {
      console.error("Storage encryption failure:", error);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};