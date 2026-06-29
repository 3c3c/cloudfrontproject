/**
 * 加密工具函数
 * 用于 RSA 密码加密和公钥管理
 */

import JSEncrypt from 'jsencrypt';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 公钥缓存
let publicKeyCache: string | null = null;
let publicKeyExpireTime: number = 0;

// 公钥缓存时间（30分钟）
const PUBLIC_KEY_CACHE_DURATION = 30 * 60 * 1000;

/**
 * 从后端获取公钥
 */
export async function getPublicKey(): Promise<string> {
  const now = Date.now();

  // 检查缓存是否有效
  if (publicKeyCache && publicKeyExpireTime > now) {
    return publicKeyCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/public-key`);

    if (!response.ok) {
      throw new Error('获取公钥失败');
    }

    const result = await response.json();
    console.log('获取公钥响应:', result);

    // 后端返回的是统一响应格式，需要提取 data 字段
    if (result.code !== 200 || !result.data) {
      throw new Error('公钥响应格式错误');
    }

    const publicKey = result.data;
    console.log('获取公钥成功，长度:', publicKey.length);

    // 更新缓存
    publicKeyCache = publicKey;
    publicKeyExpireTime = now + PUBLIC_KEY_CACHE_DURATION;

    return publicKey;
  } catch (error) {
    console.error('获取公钥失败:', error);
    throw new Error('无法获取加密公钥，请检查网络连接');
  }
}

/**
 * 使用 RSA 公钥加密密码
 * @param password 明文密码
 * @param publicKey RSA 公钥（可选，如果不提供则自动获取）
 * @returns 加密后的密文
 */
export async function encryptPassword(password: string, publicKey?: string): Promise<string> {
  if (!password) {
    throw new Error('密码不能为空');
  }

  try {
    // 如果没有提供公钥，则获取公钥
    const key = publicKey || await getPublicKey();

    console.log('开始加密密码，公钥长度:', key.length);
    console.log('公钥前50个字符:', key.substring(0, 50));

    // 创建加密器
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(key);

    // 加密密码
    const encrypted = encryptor.encrypt(password);

    if (!encrypted) {
      console.error('加密失败，返回值为:', encrypted);
      throw new Error('密码加密失败，请检查公钥格式');
    }

    console.log('加密成功，密文长度:', encrypted.length);
    return encrypted;
  } catch (error) {
    console.error('密码加密失败:', error);
    throw new Error('密码加密失败，请重试');
  }
}

/**
 * 清除公钥缓存
 * 在登出时调用，确保下次登录时获取最新公钥
 */
export function clearPublicKeyCache(): void {
  publicKeyCache = null;
  publicKeyExpireTime = 0;
}

/**
 * 初始化加密模块
 * 在应用启动时预加载公钥，避免登录时等待
 */
export async function initCrypto(): Promise<void> {
  try {
    await getPublicKey();
    console.log('加密模块初始化成功');
  } catch (error) {
    console.warn('加密模块初始化失败，将在需要时重试:', error);
  }
}

/**
 * 检查加密模块是否可用
 */
export function isCryptoAvailable(): boolean {
  const now = Date.now();
  return publicKeyCache !== null && publicKeyExpireTime > now;
}
