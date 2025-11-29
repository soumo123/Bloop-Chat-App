// import CryptoJS from 'crypto-js'
import crypto from 'crypto'

class DataEncryption {
  constructor(key) {
    this.key = crypto.createHash('sha256').update(key).digest()
  }

  encrypt(plaintext) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv)
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64')
    ciphertext += cipher.final('base64')
    return Buffer.concat([iv, Buffer.from(ciphertext, 'base64')]).toString(
      'base64'
    )
  }

  decrypt(encryptedData) {
    const data = Buffer.from(encryptedData, 'base64')
    const iv = data.slice(0, 16)
    const ciphertext = data.slice(16)
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv)
    let plaintext = decipher.update(ciphertext, null, 'utf8')
    plaintext += decipher.final('utf8')
    return plaintext
  }
}

export default DataEncryption;