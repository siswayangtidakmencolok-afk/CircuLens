// Helper untuk redirect user ke dashboard sesuai role-nya

export type UserRole = 'farmer' | 'village_head' | 'distributor' | 'pengepul'

export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: 'Petani',
  village_head: 'Kepala Desa',
  distributor: 'Distributor',
  pengepul: 'Pengepul',
}

export const ROLE_HOME: Record<UserRole, string> = {
  farmer: 'farmer-home',
  village_head: 'admin-overview',
  distributor: 'distributor-home',
  pengepul: 'collector-home',
}

export function getDefaultPageForRole(role: UserRole): string {
  return ROLE_HOME[role] ?? 'farmer-home'
}

export function isValidRole(role: string | undefined | null): role is UserRole {
  return role === 'farmer' || role === 'village_head' || role === 'distributor' || role === 'pengepul'
}