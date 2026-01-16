import { User } from '@prisma/client';

export function isVipActive(vipExpiresAt: Date | null): boolean {
  if (!vipExpiresAt) {
    return false;
  }
  return vipExpiresAt.getTime() > Date.now();
}

export function addVipMonths(currentExpiry: Date | null, months: number): Date {
  const base = currentExpiry && currentExpiry.getTime() > Date.now()
    ? new Date(currentExpiry)
    : new Date();
  const result = new Date(base);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function toPublicUser(user: User) {
  const { userPassword: _password, ...rest } = user;
  return {
    ...rest,
    isVip: isVipActive(user.vipExpiresAt),
  };
}
