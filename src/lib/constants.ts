export const AUTH_PHONE_SUFFIX = '@phone.dianping.local';

export const toAuthEmail = (phone: string) => `${phone}${AUTH_PHONE_SUFFIX}`;

export const isPhoneAuth = (email: string) => email.endsWith(AUTH_PHONE_SUFFIX);

export const fromAuthEmail = (email: string) => {
  if (isPhoneAuth(email)) {
    return email.replace(AUTH_PHONE_SUFFIX, '');
  }
  return email;
};
