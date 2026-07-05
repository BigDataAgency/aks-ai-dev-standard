export type KdsStatus = 'pending' | 'cooking' | 'ready';
// ลำดับที่อนุญาต: pending -> cooking -> ready (ห้ามข้าม)
const allowed: Record<KdsStatus, KdsStatus[]> = {
  pending: ['cooking', 'ready'], // BUG: 'ready' ไม่ควรอยู่ที่นี่ (ข้าม cooking)
  cooking: ['ready'],
  ready: [],
};
export function canTransition(from: KdsStatus, to: KdsStatus): boolean {
  return allowed[from]?.includes(to) ?? false;
}
