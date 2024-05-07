import { crypto } from "std/crypto/mod.ts";
import { Hosts, HostsLine } from "@/lib/hosts/types.ts";
import { CombinedChosts, HostEntry, HostsChosts } from "./types.ts";
import { ChostsManager } from "./manager.ts";

//
// Chosts to Hosts
//

const hostsEntryToLine = (entry: HostEntry): HostsLine => {
  return {
    type: "entry",
    ip: entry.ip,
    hostname: entry.hostname,
    aliases: entry.aliases,
    comment: entry.description,
  };
};

const hostsSettingToHosts = (chosts: HostsChosts): Hosts => {
  const header = chosts.description
    ?.split("\n")
    .map((comment) => ({ type: "comment", comment, level: 1 } as const)) ??
    [];
  return {
    lines: [
      ...header,
      ...chosts.entries.map((entry) => hostsEntryToLine(entry)),
    ],
  };
};

const combinedSettingToHosts = (
  chosts: CombinedChosts,
  manager: ChostsManager,
): Hosts[] => {
  const hosts = {
    type: "hosts",
    lines: chosts.description?.split("\n").map(
      (comment) => ({
        type: "comment",
        comment,
        level: 1,
      } as const),
    ) ?? [],
  };

  const combinedChosts = chosts.settings.map((name) => manager.getChosts(name));
  if (combinedChosts.some(({ type }) => type === "combined")) {
    throw new Error(
      "Combined settings cannot contain other combined settings.",
    );
  }

  const combinedHosts = chosts.settings.flatMap((name) =>
    chostsToHosts(name, manager)
  );

  return [hosts, ...combinedHosts];
};

const chostsToHosts = (name: string, manager: ChostsManager): Hosts[] => {
  const chosts = manager.getChosts(name);

  switch (chosts.type) {
    case "hosts":
      return [hostsSettingToHosts(chosts)];
    case "combined":
      return combinedSettingToHosts(chosts, manager);
  }
};

//
// Hash
//

const hashSync = (str: string): string => {
  const hashBuffer = crypto.subtle.digestSync(
    "SHA3-224",
    new TextEncoder().encode(str),
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0"));

  return hashHex.join("");
};

export { chostsToHosts, hashSync };
