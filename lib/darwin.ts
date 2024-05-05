const isMacOs = (): boolean => {
  return Deno.build.os === "darwin";
};

type DarwinVersion = {
  major: number;
  minor: number;
  patch: number;
};

const parseDarwinVersion = (version: string): DarwinVersion => {
  const [major, minor, patch] = version.split(".").map(Number);
  return { major, minor, patch };
};

const getDarwinVersion = (): DarwinVersion => {
  return parseDarwinVersion(Deno.osRelease());
};

export type { DarwinVersion };
export { getDarwinVersion, isMacOs };
