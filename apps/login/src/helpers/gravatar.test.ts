import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { getGravatarUrl, sha256 } from "./gravatar";

describe("sha256 helper", () => {
  it("matches node:crypto sha256 for various test strings", () => {
    const testCases = [
      "",
      "test",
      "hello world",
      "user@example.com",
      "john.doe@example.org",
      "A much longer string to ensure multiple blocks are handled correctly with proper padding and chaining",
    ];

    for (const text of testCases) {
      const expected = createHash("sha256").update(text).digest("hex");
      const actual = sha256(text);
      expect(actual).toBe(expected);
    }
  });
});

describe("getGravatarUrl helper", () => {
  it("returns null for empty or non-email login names", () => {
    expect(getGravatarUrl("")).toBeNull();
    expect(getGravatarUrl(undefined)).toBeNull();
    expect(getGravatarUrl("123456789012345678")).toBeNull();
    expect(getGravatarUrl("dummyuser")).toBeNull();
  });

  it("returns valid direct gravatar URL with sha256 hash for email", () => {
    const email = "user@example.com";
    const expectedHash = createHash("sha256").update(email).digest("hex");
    const url = getGravatarUrl(email, 128);

    expect(url).toBe(`https://www.gravatar.com/avatar/${expectedHash}?d=404&s=128`);
  });

  it("handles whitespace and mixed casing properly", () => {
    const email = "  User.Name@Example.COM  ";
    const clean = "user.name@example.com";
    const expectedHash = createHash("sha256").update(clean).digest("hex");
    const url = getGravatarUrl(email);

    expect(url).toBe(`https://www.gravatar.com/avatar/${expectedHash}?d=404&s=96`);
  });
});
