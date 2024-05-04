const CHOSTS_CACHE_DIR = ".cache/chosts";

const saveCache = (path: string, content: string) => {
  const existsCacheDir = Deno.statSync(CHOSTS_CACHE_DIR).isDirectory;

  if (!existsCacheDir) {
    Deno.mkdirSync(CHOSTS_CACHE_DIR, { recursive: true });
  }

  Deno.writeTextFileSync(`.cache/${path}`, content);
};

const readCache = (path: string): string => {
  return Deno.readTextFileSync(`${CHOSTS_CACHE_DIR}/${path}`);
};

const existsCache = (path: string): boolean => {
  try {
    Deno.statSync(`${CHOSTS_CACHE_DIR}/${path}`);
    return true;
  } catch (_error) {
    return false;
  }
};

export { saveCache, readCache, existsCache };
