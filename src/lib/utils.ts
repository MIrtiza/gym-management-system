// Utility functions for formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateMembershipDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Country code to phone format mapping
export const COUNTRY_PHONE_FORMATS = {
  US: { code: '+1', maxDigits: 11, localLength: 10, nationalPrefix: '', regex: /^1\d{10}$/, format: (num: string) => `+1 (${num.slice(1, 4)}) ${num.slice(4, 7)}-${num.slice(7)}` },
  UK: { code: '+44', maxDigits: 12, localLength: 10, nationalPrefix: '0', regex: /^44\d{10}$/, format: (num: string) => `+44 ${num.slice(2, 4)} ${num.slice(4, 8)} ${num.slice(8)}` },
  CA: { code: '+1', maxDigits: 11, localLength: 10, nationalPrefix: '', regex: /^1\d{10}$/, format: (num: string) => `+1 (${num.slice(1, 4)}) ${num.slice(4, 7)}-${num.slice(7)}` },
  AU: { code: '+61', maxDigits: 11, localLength: 9, nationalPrefix: '0', regex: /^61\d{9}$/, format: (num: string) => `+61 ${num.slice(2, 4)} ${num.slice(4, 8)} ${num.slice(8)}` },
  IN: { code: '+91', maxDigits: 12, localLength: 10, nationalPrefix: '0', regex: /^91\d{10}$/, format: (num: string) => `+91 ${num.slice(2, 5)} ${num.slice(5, 8)} ${num.slice(8)}` },
  PK: { code: '+92', maxDigits: 12, localLength: 11, nationalPrefix: '0', regex: /^92\d{10}$/, format: (num: string) => `+92 ${num.slice(2, 4)} ${num.slice(4, 8)} ${num.slice(8)}` },
  BD: { code: '+880', maxDigits: 13, localLength: 10, nationalPrefix: '0', regex: /^880\d{10}$/, format: (num: string) => `+880 ${num.slice(3, 5)} ${num.slice(5, 8)} ${num.slice(8)}` },
  DE: { code: '+49', maxDigits: 13, localLength: 11, nationalPrefix: '0', regex: /^49\d{9,11}$/, format: (num: string) => `+49 ${num.slice(2, 4)} ${num.slice(4, 8)} ${num.slice(8)}` },
  FR: { code: '+33', maxDigits: 12, localLength: 9, nationalPrefix: '0', regex: /^33\d{9}$/, format: (num: string) => `+33 ${num.slice(2, 4)} ${num.slice(4, 6)} ${num.slice(6, 8)} ${num.slice(8)}` },
  JP: { code: '+81', maxDigits: 12, localLength: 10, nationalPrefix: '0', regex: /^81\d{9,10}$/, format: (num: string) => `+81 ${num.slice(2, 4)} ${num.slice(4, 7)} ${num.slice(7)}` },
};

/**
 * Format phone number based on country code
 * @param phone - Phone number with country code (digits only)
 * @param countryCode - Country code (e.g., 'US', 'UK', 'IN')
 * @returns Formatted phone number
 */
export const normalizePhoneDigits = (phone: string, countryCode: string): { normalized: string; error?: string } => {
  const digitsOnly = phone.replace(/\D/g, '');
  const format = COUNTRY_PHONE_FORMATS[countryCode as keyof typeof COUNTRY_PHONE_FORMATS];

  if (!format) {
    return { normalized: '', error: 'Invalid country code' };
  }

  if (format.regex.test(digitsOnly)) {
    return { normalized: digitsOnly };
  }

  if (format.nationalPrefix && digitsOnly.startsWith(format.nationalPrefix)) {
    const normalized = `${format.code.replace('+', '')}${digitsOnly.slice(format.nationalPrefix.length)}`;
    if (format.regex.test(normalized)) {
      return { normalized };
    }
  }

  return {
    normalized: '',
    error: `Invalid phone number format for ${countryCode}. Expected ${format.maxDigits} digits including country code.`,
  };
};

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!digitsOnly) return '';
  
  const format = COUNTRY_PHONE_FORMATS[countryCode as keyof typeof COUNTRY_PHONE_FORMATS];
  
  if (!format) return phone;
  
  try {
    return format.format(digitsOnly);
  } catch (error) {
    return phone;
  }
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns Validation result object
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' };
  }
  
  return { valid: true };
};

/**
 * Validate phone number format for a specific country
 * @param phone - Phone number with country code (digits only)
 * @param countryCode - Country code (e.g., 'US', 'UK', 'IN')
 * @returns Validation result object
 */
export const validatePhoneNumber = (phone: string, countryCode: string): { valid: boolean; error?: string } => {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!digitsOnly) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const format = COUNTRY_PHONE_FORMATS[countryCode as keyof typeof COUNTRY_PHONE_FORMATS];
  
  if (!format) {
    return { valid: false, error: 'Invalid country code' };
  }

  const normalized = normalizePhoneDigits(phone, countryCode);
  if (!normalized.normalized) {
    return { valid: false, error: normalized.error };
  }
  
  if (normalized.normalized.length !== format.maxDigits) {
    return { valid: false, error: `Invalid phone number length for ${countryCode}. Expected ${format.maxDigits} digits including country code.` };
  }
  
  return { valid: true };
};

export const isToday = (date: string | Date): boolean => {
  const checkDate = new Date(date);
  const today = new Date();
  return (
    checkDate.getFullYear() === today.getFullYear() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getDate() === today.getDate()
  );
};
