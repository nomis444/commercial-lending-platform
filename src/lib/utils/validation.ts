/**
 * Validation utility functions for customer portal
 */

/**
 * Validate routing number (must be exactly 9 digits)
 */
export function validateRoutingNumber(routing: string): boolean {
  if (!routing) return false
  const cleaned = routing.replace(/\D/g, '')
  return cleaned.length === 9
}

/**
 * Validate account number (must be 4-17 digits)
 */
export function validateAccountNumber(account: string): boolean {
  if (!account) return false
  const cleaned = account.replace(/\D/g, '')
  return cleaned.length >= 4 && cleaned.length <= 17
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Validate ZIP code (5 or 9 digit format)
 */
export function validateZipCode(zip: string): boolean {
  if (!zip) return false
  const cleaned = zip.replace(/\D/g, '')
  return cleaned.length === 5 || cleaned.length === 9
}

/**
 * Validate required field is not empty
 */
export function validateRequired(value: string): boolean {
  return value !== null && value !== undefined && value.trim().length > 0
}
