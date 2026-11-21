import { LEAD_SOURCES, LEAD_STATUSES, LeadFormValues } from '@/types/lead';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

export type FieldErrors = Partial<Record<keyof LeadFormValues, string>>;

export function validateLeadForm(values: LeadFormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Lead name is required.';
  } else if (values.name.trim().length > 120) {
    errors.name = 'Name must be under 120 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (values.phone.trim() && !PHONE_REGEX.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number (7–20 digits).';
  }

  if (values.company.trim().length > 120) {
    errors.company = 'Company name must be under 120 characters.';
  }

  if (!LEAD_SOURCES.includes(values.source)) {
    errors.source = 'Please choose a valid source.';
  }

  if (!LEAD_STATUSES.includes(values.status)) {
    errors.status = 'Please choose a valid status.';
  }

  return errors;
}

export function validateAuthForm(
  values: { name?: string; email: string; password: string },
  mode: 'login' | 'register'
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (mode === 'register') {
    if (!values.name?.trim() || values.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }
  }

  if (!values.email.trim() || !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (mode === 'register' && values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  return errors;
}
