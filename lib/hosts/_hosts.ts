import { stripAnsiCode } from "#deps";
import { chalk } from "#deps";
import { Hosts, HostsLine } from "./types.ts";

const readCurrentHosts = (path: string = "/etc/hosts"): string => {
  const hosts = Deno.readTextFileSync(path);

  return hosts;
};

const writeHosts = (hosts: string, path: string = "/etc/hosts"): void => {
  Deno.writeTextFileSync(path, stripAnsiCode(hosts));
};

const hostsToString = (hosts: Hosts): string => {
  if (typeof hosts === "string") {
    return hosts;
  }

  const comment = hosts.comment
    ?.split("\n")
    .map((line) => `# ${line}`)
    .join("\n");
  const header = comment ? chalk.gray(`##\n${comment}\n##`) : "";

  const longest = longestLength(hosts.lines);
  const lines = hosts.lines
    .map((line) => {
      switch (line.type) {
        case "entry": {
          const ip = chalk.green(line.ip.padEnd(longest.ip));
          const hostnames = chalk.magenta(
            line.hostnames.join(" ").padEnd(longest.hostnames)
          );
          const comment = line.comment ? chalk.gray(`# ${line.comment}`) : "";

          return `${ip} ${hostnames} ${comment}`;
        }
        case "comment":
          return chalk.gray(`# ${line.comment}`);
        case "raw":
          return line.raw;
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
        case "raw":
          return acc;
      }
    },
    { ip: 0, hostnames: 0 }
  );
};

export { hostsToString, readCurrentHosts, writeHosts };
