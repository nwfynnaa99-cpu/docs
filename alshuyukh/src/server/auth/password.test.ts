import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, passwordProblem, verifyPassword } from "./password.ts";
import { can } from "./roles.ts";

test("scrypt hash round-trip and rejection", async () => {
  const h = await hashPassword("Shuyukh-2026!");
  assert.match(h, /^scrypt\$32768\$8\$1\$/);
  assert.equal(await verifyPassword("Shuyukh-2026!", h), true);
  assert.equal(await verifyPassword("shuyukh-2026!", h), false);
  assert.equal(await verifyPassword("x", "garbage"), false);
  assert.notEqual(await hashPassword("same"), await hashPassword("same")); // salted
});

test("password policy", () => {
  assert.ok(passwordProblem("short1!"));
  assert.ok(passwordProblem("aaaaaaaaaaaa"));
  assert.equal(passwordProblem("longenough123"), null);
});

test("role capabilities", () => {
  assert.equal(can("owner", "users"), true);
  assert.equal(can("editor", "users"), false);
  assert.equal(can("editor", "orders.manage"), false);
  assert.equal(can("orders", "catalog"), false);
  assert.equal(can("orders", "orders.manage"), true);
});
