# Store update component

## Purpose and facilities
Tells people when a newer version of the application they are using has been published, so they are not left on an old one. An application listed on the ourapps.app store gets an invitation link, such as `https://ourapps.app/l/0123456789abcdef01234567`. From that link this component works out the store address that describes the newest release, asks the store for it, and compares the version the store reports with the version installed on the device. When the store has a newer one, the application gets the version number and the address to install it from, and decides itself how to tell the person (a banner, a button, a message at start).

It works on the web, on Apple devices and on Android. It never installs anything, keeps no data and needs no account: if the store cannot be reached or answers with something unexpected, the answer is simply "no update".

Facilities: `updates` (Tells people when a newer version of the application they use has been published on the ourapps.app store).

## User inputs
The installer collects two settings:

- `enabled`: whether the application looks for updates at all, true or false (default true). False switches the check off everywhere.
- `inviteAddress`: the application's ourapps.app invitation link, an http or https address (optional, no default), `https://<store>/l/<identifier>` with nothing after the identifier. Without it, or with any other form of address, there is no update check. Anything after a `?` or `#` in the link is ignored.

The application also passes, in code, the version installed on the device and the function that makes web requests. No keys or private links are needed.

## Artefacts and dependencies
`component.json` maps every `implementation/` source into `components/store-update/`: `server/store.ts` (the store address from the invitation link and the settings), `web/update.ts` (the request and the comparison), `apple/Sources/Version.swift` and the Android `ae.update` sources. No runtime dependencies. `tools.lock.json` pins the check tools (Node 26.5, Python 3.12, Swift 6.4, Kotlin 2.2, Java 26.0).

## Provided interfaces
`interfaces/updates.json` defines `updates` (`ae/updates`) version 1.0.0 as an OpenRPC 1.3.2 document: `updateUrlFor`, `updateAddress`, `isNewer`, `fetchUpdate` and `currentVersion`, each tagged with the languages that provide it, with parameters and results as JSON Schema 2020-12.

How versions compare: the numbers are compared one by one, so `0.6.10` is newer than `0.6.9`; a missing number counts as 0 (`1.2` equals `1.2.0`); anything after a hyphen is ignored (`1.2.0-beta` equals `1.2.0`); a part that is not a number counts as 0. An installed version starting `0.0.0` (a development build) never reports an update.

## Required interfaces
None from other components. The application supplies the installed version, the request function (it decides on time limits and retries; this component adds none), and what to show when an update exists.

## Integration
On the server, `updateAddress(settings)` turns the two settings into the store address, or null when updates are off or the link is missing or malformed; a server route can relay the store's answer to clients. On the web:

```ts
import { fetchUpdate, isNewer } from "./components/store-update/web/index";
const latest = address ? await fetchUpdate(address, fetch) : null;
if (latest && isNewer(latest.version, installedVersion)) showUpdate(latest.version, latest.url);
```

On Apple, `currentVersion` reads the installed version from the application bundle and `isNewer(_:than:)` compares; on Android, import `ae.update.isNewer`. `examples/consumer.ts` combines the address, the request and the comparison.

## Visual definition and connected examples
`visual/definition.json` maps its `updates` output to the provided interface. `visual/examples/connected.json` connects it to an illustrative application consumer. Both image formats and the text description are in `visual/output/`.

## Infrastructure
No service and no account. The only network use is the request to the store, made through the application's own request function, to the address the invitation link gives.

## Verification
`node --test tests/web.test.ts` (required) checks the version comparison against a table of cases, the store address from invitation links, that an unreachable store, an error status or a malformed answer give no update, that the settings give the right address or none, and a small consumer that fetches and compares. `node --test tests/regression.test.ts` (required) checks that only exact invitation links are accepted: extra path parts, encoded slashes, user names and passwords, and malformed addresses all give no address. `python3 tests/native.py apple` compiles the Swift comparison and checks it against the same table; `python3 tests/native.py android` compiles the Kotlin comparison and checks a few of the same cases.

## Scenarios and presentation
A family uses version 1.4.2 of a game installed from ourapps.app. The developer publishes 1.5.0. Next time the game starts, it asks the store, sees 1.5.0, and shows "A new version is ready" with a link to install it. On a train with no signal the request fails and nothing is shown. A developer running a local build (version `0.0.0-dev`) is never told to update.

## Updates and removal
Updates replace the component's files; it stores nothing. Removing it removes the update check; nothing on the device or the store is deleted.
