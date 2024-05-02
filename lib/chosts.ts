import { z } from "../deps.ts";
import { yaml } from "../deps.ts";
import { produce } from "../deps.ts";

const hostsSettingSchema = z.object({
  type: z.literal("hosts"),
  name: z.string(),
  description: z.string().optional(),
  hosts: z.array(
    z.object({
      ip: z.string(),
      hostnames: z.array(z.string()),
      description: z.string().optional(),
    }),
  ),
});

type HostsSetting = z.infer<typeof hostsSettingSchema>;

const remoteSettingSchema = z.object({
  type: z.literal("remote"),
  name: z.string(),
  description: z.string().optional(),
  url: z.string(),
  trusted: z.boolean().optional(),
  updateInterval: z.string().optional(),
});

type RemoteSetting = z.infer<typeof remoteSettingSchema>;

const combinedSettingSchema = z.object({
  type: z.literal("combined"),
  name: z.string(),
  description: z.string().optional(),
  sources: z.array(z.string()),
});

type CombinedSetting = z.infer<typeof combinedSettingSchema>;

const chostsSettingSchema = z.union([
  hostsSettingSchema,
  remoteSettingSchema,
  combinedSettingSchema,
]);

type ChostsSetting = z.infer<typeof chostsSettingSchema>;

const chostsSchema = z.object({
  version: z.literal(1),
  settings: z.array(chostsSettingSchema),
});

type Chosts = z.infer<typeof chostsSchema>;

type ChostsConfig = {
  configDir: string;
};

const DEFAULT_CHOSTS_CONFIG: ChostsConfig = {
  configDir: `${Deno.env.get("HOME")}/.config/chosts`,
} as const;

const getChosts = (
  chostsConfig: ChostsConfig = DEFAULT_CHOSTS_CONFIG,
): Chosts => {
  const configPath = `${chostsConfig.configDir}/config.yaml`;

  if (!Deno.stat(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    Deno.exit(1);
  }

  const configText = Deno.readTextFileSync(configPath);

  return chostsSchema.parse(yaml.parse(configText));
};

const deleteChostsConfig = (chostsConfig: ChostsConfig) => {
  const configPath = `${chostsConfig.configDir}/config.yaml`;

  if (!Deno.stat(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    Deno.exit(1);
  }

  Deno.removeSync(configPath);
};

const deleteChosts = (chosts: Chosts, name: string) => {
  return produce(chosts, (draft) => {
    draft.settings = chosts.settings.filter((config) => config.name !== name);
  });
};

const addChosts = (
  chosts: Chosts,
  config: HostsSetting | RemoteSetting | CombinedSetting,
) => {
  return produce(chosts, (draft) => {
    draft.settings.push(config);
  });
};

const updateChosts = (
  chosts: Chosts,
  name: string,
  config: HostsSetting | RemoteSetting | CombinedSetting,
) => {
  return produce(chosts, (draft) => {
    const index = draft.settings.findIndex((config) => config.name === name);
    draft.settings[index] = config;
  });
};

const hostsSettingToHosts = (settings: HostsSetting): string => {
  const description = settings.description
    ? `${
      settings.description
        .split("\n")
        .map((line) => `# ${line}`)
        .join("\n")
    }`
    : "";
  const hosts = settings.hosts
    .map((host) => {
      const longestLengthes = longestLength(settings.hosts);
      const description = host.description ? `# ${host.description}` : "";

      return host.hostnames
        .map((hostname) => {
          const paddedIp = host.ip.padEnd(longestLengthes.ip, " ");
          const paddedHostname = hostname.padEnd(longestLengthes.hostname, " ");

          return `${paddedIp} ${paddedHostname} ${description}`;
        })
        .join("\n");
    })
    .join("\n");

  return `##\n${description}\n##\n${hosts}`;
};

const longestLength = (
  hosts: Array<{
    ip: string;
    hostnames: string[];
  }>,
): { ip: number; hostname: number } => {
  const ip = Math.max(...hosts.map((host) => host.ip.length));
  const hostname = Math.max(
    ...hosts.flatMap((host) =>
      host.hostnames.map((hostname) => hostname.length)
    ),
  );

  return { ip, hostname };
};

const remoteSettingToHosts = (settings: RemoteSetting): string => {
  const description = settings.description ? `# ${settings.description}` : "";
  const trusted = settings.trusted ? "# trusted" : "";
  const updateInterval = settings.updateInterval
    ? `# updateInterval: ${settings.updateInterval}`
    : "";

  return `${description}\n# ${settings.url} ${trusted} ${updateInterval}`;
};

const combinedSettingToHosts = (settings: CombinedSetting): string => {
  const description = settings.description ? `# ${settings.description}` : "";
  const sources = settings.sources.map((source) => `# ${source}`).join("\n");

  return `${description}\n${sources}`;
};

const chostsSettingToHosts = (settings: ChostsSetting): string => {
  switch (settings.type) {
    case "hosts":
      return hostsSettingToHosts(settings);
    case "remote":
      return remoteSettingToHosts(settings);
    case "combined":
      return combinedSettingToHosts(settings);
  }
};

export type {
  Chosts,
  ChostsConfig,
  CombinedSetting,
  HostsSetting,
  RemoteSetting,
};
export {
  addChosts,
  chostsSettingToHosts,
  DEFAULT_CHOSTS_CONFIG,
  deleteChosts,
  deleteChostsConfig,
  getChosts,
  updateChosts,
};