export function extractIdentity(user: any): string | null {
    if (user.email) return user.email;
    if (user.phone) return user.phone;
    if (user.bvn) return user.bvn;
    return null;
  }  