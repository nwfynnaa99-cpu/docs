/** Role → capabilities. Kept tiny and explicit; checked on every server action and page. */
export type Role = "owner" | "editor" | "orders";

export type Capability = "catalog" | "content" | "orders.view" | "orders.manage" | "customers" | "users" | "audit";

const GRANTS: Record<Role, Capability[]> = {
  owner: ["catalog", "content", "orders.view", "orders.manage", "customers", "users", "audit"],
  editor: ["catalog", "content", "orders.view"],
  orders: ["orders.view", "orders.manage", "customers"],
};

export const can = (role: Role, cap: Capability) => GRANTS[role].includes(cap);

export const ROLE_LABELS: Record<Role, string> = { owner: "مالك", editor: "محرر المحتوى", orders: "الطلبات وخدمة العملاء" };
