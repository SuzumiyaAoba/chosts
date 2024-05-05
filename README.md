# chosts(1)

_chosts(1)_ is a command to manage hosts file for macOS.

## Install

```console
deno install --allow-all --allow-write=/etc/hosts --allow-run --global https://deno.land/x/chosts@0.0.2/chosts.ts --force --import-map=https://deno.land/x/chosts@0.0.2/deno.jsonc
```

## Configuration

`~/.config/chosts/config.yaml`

```
version: 1
chosts:
  default:
    type: hosts
    description: |-
      Host Database

      localhost is used to configure the loopback interface
      when the system is booting.  Do not change this entry.
    entries:
      - ip: 127.0.0.1
        hostnames:
          - localhost
        description: IPv4 loopback
      - ip: 255.255.255.255.255
        hostnames:
          - broadcasthost
        description: Broadcast address for the local network segment
      - ip: ::1
        hostnames:
          - localhost
        description: IPv6 loopback
  sample:
    type: hosts
    description: Sample Host Database
    entries:
      - ip: 127.0.0.1
        hostnames:
          - sample.local
        description: Sample Host
  all:
    type: combined
    description: All Hosts
    settings:
      - default
      - sample
```

### Types

#### `hosts`

#### `remote`

#### `combined`

## Commands

### chosts list

List names of chosts.
