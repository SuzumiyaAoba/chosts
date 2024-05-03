import { $, z } from "../deps.ts";
import { getDarwinVersion } from "./os.ts";

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

const readCurrentHosts = (path: string = "/etc/hosts"): string => {
  const hosts = Deno.readTextFileSync(path);

  return hosts;
};

const writeHosts = (hosts: string, path: string = "/etc/hosts"): void => {
  Deno.writeTextFileSync(path, hosts);
};

//
// hosts file schema
//

const hostEntrySchema = z.object({
  type: z.literal("entry"),
  ip: z.string(),
  hostnames: z.array(z.string()),
  comment: z.string().optional(),
});

type HostEntry = z.infer<typeof hostEntrySchema>;

const hostCommentSchema = z.object({
  type: z.literal("comment"),
  comment: z.string(),
});

type HostsComment = z.infer<typeof hostCommentSchema>;

const hostsLineSchema = z.union([hostEntrySchema, hostCommentSchema]);

type HostsLine = z.infer<typeof hostsLineSchema>;

const hostsSchema = z.object({
  comment: z.string().optional(),
  lines: z.array(hostsLineSchema),
});

type Hosts = z.infer<typeof hostsSchema>;

const hostsToString = (hosts: Hosts): string => {
  const comment = hosts.comment
    ?.split("\n")
    .map((line) => `# ${line}`)
    .join("\n");
  const header = comment ? `##\n${comment}\n##` : "";

  const longest = longestLength(hosts.lines);
  const lines = hosts.lines
    .map((line) => {
      switch (line.type) {
        case "entry":
          return `${line.ip.padEnd(longest.ip)} ${line.hostnames
            .join(" ")
            .padEnd(longest.hostnames)} # ${line.comment}`;
        case "comment":
          return `# ${line.comment}`;
      }
    })
    .join("\n");

  return [header, lines].filter((str) => str.length !== 0).join("\n");
};

const longestLength = (
  lines: HostsLine[]
): {
  ip: number;
  hostnames: number;
} => {
  return lines.reduce(
    (acc, line) => {
      switch (line.type) {
        case "entry":
          return {
            ip: Math.max(acc.ip, line.ip.length),
            hostnames: Math.max(acc.hostnames, line.hostnames.join(" ").length),
          };
        case "comment":
          return acc;
      }
    },
    { ip: 0, hostnames: 0 }
  );
};

export type { Hosts, HostEntry, HostsComment, HostsLine };
export { clearDnsCache, readCurrentHosts, writeHosts, hostsToString };
