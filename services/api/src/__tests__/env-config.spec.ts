import { validateEnv } from "@corely/config";

describe("database env configuration", () => {
  const baseEnv = {
    NODE_ENV: "test",
    DATABASE_URL: "postgresql://runtime:secret@localhost:5432/corely?schema=public",
  };

  it("accepts DATABASE_URL without DIRECT_DATABASE_URL", () => {
    const env = validateEnv(baseEnv);

    expect(env.DATABASE_URL).toBe(baseEnv.DATABASE_URL);
    expect(env.DIRECT_DATABASE_URL).toBeUndefined();
  });

  it("accepts DATABASE_URL with DIRECT_DATABASE_URL", () => {
    const env = validateEnv({
      ...baseEnv,
      DIRECT_DATABASE_URL: "postgresql://admin:secret@localhost:5432/corely?schema=public",
    });

    expect(env.DIRECT_DATABASE_URL).toBe(
      "postgresql://admin:secret@localhost:5432/corely?schema=public"
    );
  });

  it("rejects an invalid DIRECT_DATABASE_URL", () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        DIRECT_DATABASE_URL: "not-a-url",
      })
    ).toThrow(/DIRECT_DATABASE_URL/);
  });
});
