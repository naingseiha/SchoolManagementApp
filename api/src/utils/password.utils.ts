import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Check if a user is using a default password (phone number)
 */
export function isDefaultPassword(hashedPassword: string, phoneNumber: string): Promise<boolean> {
  if (!phoneNumber) return Promise.resolve(false);
  return bcrypt.compare(phoneNumber, hashedPassword);
}

/**
 * Calculate password expiration date
 * @param days - Number of days until expiration (default: 7)
 */
export function calculatePasswordExpiry(days: number = 7): Date {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}

/**
 * Get alert level based on expiration date
 * @returns 'none' | 'info' | 'warning' | 'danger' | 'expired'
 */
export function getAlertLevel(expiresAt: Date | null): 'none' | 'info' | 'warning' | 'danger' | 'expired' {
  if (!expiresAt) return 'none';
  
  const now = new Date();
  const timeRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24);
  
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 1) return 'danger';
  if (daysRemaining <= 3) return 'warning';
  // Show info level for all remaining time (including 7 days)
  return 'info';
}

/**
 * Calculate time remaining until expiration
 */
export function getTimeRemaining(expiresAt: Date | null): {
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
} {
  if (!expiresAt) {
    return { daysRemaining: 0, hoursRemaining: 0, isExpired: false };
  }
  
  const now = new Date();
  const timeRemaining = expiresAt.getTime() - now.getTime();
  
  if (timeRemaining < 0) {
    return { daysRemaining: 0, hoursRemaining: 0, isExpired: true };
  }
  
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { daysRemaining, hoursRemaining, isExpired: false };
}

/**
 * Validate password strength
 * Must be at least 8 characters and not just a phone number
 */
export function validatePasswordStrength(password: string, phoneNumber?: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (phoneNumber && password === phoneNumber) {
    errors.push('Password cannot be your phone number');
  }
  
  // Check if password is all numbers (likely a phone number)
  if (/^\d+$/.test(password) && password.length >= 9) {
    errors.push('Password should not be only numbers');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a temporary password
 * Format: 3 random words + 3 digits
 */
export function generateTemporaryPassword(): string {
  const words = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon',
    'garden', 'harbor', 'island', 'jungle', 'kiwi', 'lemon',
    'mango', 'nectar', 'ocean', 'panda', 'quartz', 'river',
    'sunset', 'thunder', 'umbrella', 'valley', 'winter', 'yellow'
  ];
  
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const word3 = words[Math.floor(Math.random() * words.length)];
  const numbers = Math.floor(100 + Math.random() * 900);
  
  return `${word1}${word2}${word3}${numbers}`;
}

/**
 * Generate a secure reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate reset token expiry (1 hour)
 */
export function calculateResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

/**
 * Check if user can extend password expiration
 */
export function canExtendExpiration(passwordChangedAt: Date | null, passwordExpiresAt: Date | null): boolean {
  // Can extend if:
  // 1. Has never changed password (using default)
  // 2. Expiration is set
  // 3. Not expired yet
  if (!passwordExpiresAt) return false;
  
  const now = new Date();
  return passwordExpiresAt.getTime() > now.getTime();
}

/**
 * Hash password for storage comparison
 */
export async function hashPasswordForHistory(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Check if password was used before
 */
export async function isPasswordInHistory(
  password: string,
  lastPasswordHashes: string[]
): Promise<boolean> {
  if (!lastPasswordHashes || lastPasswordHashes.length === 0) {
    return false;
  }
  
  for (const hash of lastPasswordHashes) {
    const isMatch = await bcrypt.compare(password, hash);
    if (isMatch) return true;
  }
  
  return false;
}
