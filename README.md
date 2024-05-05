# chosts(1)

_chosts(1)_ is a command to manage hosts file for macOS.

## Install

```console
deno install --allow-all --allow-write=/etc/hosts --allow-run --global https://deno.land/x/chosts@0.0.2/chosts.ts --force --import-map=https://deno.land/x/chosts@0.0.2/deno.jsonc
```

## Usage

### Configuration

#### Example

<table>
<tr><td>

**~/.config/chosts/chosts.yaml**

</td></tr>
<tr><td>

```yaml
version: 1
hosts: /etc/hosts
chosts: ./chosts
```

</td></tr>

<tr><td>

**~/.config/chosts/chosts/default.yaml** (default hosts file on macOS)

</tr></td>

<tr><td>

```yaml
type: hosts
description: |-
  Host Database

  localhost is used to configure the loopback interface
  when the system is booting.  Do not change this entry.
entries:
  - ip: 127.0.0.1
    hostname: localhost
    description: IPv4 loopback
  - ip: 255.255.255.255.255
    hostname: broadcasthost
    description: Broadcast address for the local network segment
  - ip: ::1
    hostname: localhost
    description: IPv6 loopback
```

</tr></td>

<tr><td>

**~/.config/chosts/chosts/sample.yaml**

</tr></td>

<tr><td>

```yaml
type: hosts
description: Sample Host Database
entries:
  - ip: 127.0.0.1
    hostname: sample.local
    description: Sample Host
```

</tr></td>

<tr><td>

**~/.config/chosts/chosts/all.yaml**

</tr></td>

<tr><td>

```yaml
type: combined
description: All Hosts
settings:
  - default
  - sample
```

</tr></td>

</table>

#### Types

##### `hosts`

##### `combined`

### Commands

#### $ chosts list

List names of chosts.
