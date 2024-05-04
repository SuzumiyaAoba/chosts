import { $ } from "dax";
import { getDarwinVersion } from "/lib/os.ts";

const clearDnsCache = async () => {
  const DarwinVersion = getDarwinVersion();

  switch (DarwinVersion.major) {
    case 9: // 10.5 (Snow Leopard)
      await $`sudo lookupd -flushcache`;
      break;
    case 10: // 10.6 (Snow Leopard)
      await $`sudo dscacheutil -flushcache`;
      break;
    case 11: // 10.7 (Lion)
    case 12: // 10.8 (Mountain Lion)
    case 13: // 10.9 (Mavericks)
      await $`sudo killall -HUP mDNSResponder`;
      break;
    case 14: // 10.10 (Yosemite)
      await $`sudo discoveryutil mdnsflushcache`;
      break;
    case 15: // 10.11 (El Capitan)
    case 16: // 10.12 (Sierra)
    case 17: // 10.13 (High Sierra)
    case 18: // 10.14 (Mojave)
    case 19: // 10.15 (Catalina)
    case 20: // 11.0 (Big Sur)
    case 21: // 12.0 (Monterey)
    case 22: // 13.0 (Ventura)
    case 23: // 14.0 (Sonoma)
      await $`sudo killall -HUP mDNSResponder`;
      break;
    default:
      console.error("Unsupported macOS version");
  }
};

export { clearDnsCache };
