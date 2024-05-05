const CHOSTS_CACHE_DIR = `${Deno.env.get("HOME")}/.cache/chosts`;

const saveCache = (path: string, content: string) => {
  const existsCacheDir = Deno.statSync(CHOSTS_CACHE_DIR).isDirectory;

  if (!existsCacheDir) {
    Deno.mkdirSync(CHOSTS_CACHE_DIR, { recursive: true });
  }

  Deno.writeTextFileSync(`${CHOSTS_CACHE_DIR}/${path}`, content);
};

const readCache = (path: string): string => {
  return Deno.readTextFileSync(`${CHOSTS_CACHE_DIR}/${path}`);
};

const deleteCache = (path: string): void => {
  Deno.removeSync(`${CHOSTS_CACHE_DIR}/${path}`);
};

const existsCache = (path: string): boolean => {
  try {
    Deno.statSync(`${CHOSTS_CACHE_DIR}/${path}`);
    return true;
  } catch (_error) {
    return false;
  }
};

export { existsCache, readCache, saveCache, deleteCache };
