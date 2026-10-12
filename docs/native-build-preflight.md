# Native build preflight (iOS/React Native)

Generic example guidance for `-native` projects. Nothing here is installed, run or deployed by the standard: replace placeholders, keep the project's own scripts/overrides/business rules, and do not edit customer repos from this document. iOS builds were not run when this was written (Linux author); mark iOS results **Not verified** until run on macOS.

Files: `templates/native-package-scripts.json`, `templates/Podfile.native-example`.

## 1. UTF-8 locale before CocoaPods

CocoaPods needs a UTF-8 terminal locale; a non-UTF-8 locale gives `Encoding::CompatibilityError`. `setup:ios` sets `LANG`/`LC_ALL` for that one `pod install` only (override with `POD_LANG`). The Ruby/CocoaPods versions in use are project facts; record them, do not assume.

Run `pod install` from a native arm64 shell on Apple Silicon; React Native's own CocoaPods scripts warn against running it under Rosetta.

## 2. Shared package / symlink after clean

`shared:link` creates `node_modules/<shared-package>` -> `../<shared-source-dir>` only when nothing exists at that path. An existing real folder or link (even a dangling one) is left untouched and must be inspected by a human. `postinstall` and `setup:ios` call it, so a clean followed by install/setup restores it.

- If the project already has a `postinstall` (patch-package etc.), keep it: set `<existing-postinstall> && npm run shared:link` so a failing hook stops the chain visibly. Do not replace it.
- The link target is relative to `node_modules`; set `<rel-prefix>` to `../` for an unscoped name or `../../` for a scoped one (`@scope/pkg`). Paths are quoted.
- `"<shared-package>": "file:./<dir>"` in dependencies is an alternative, but its behavior (copy vs link) depends on the package manager and version; confirm before adopting.

## 3. Simulator default

`ios:run:uat` always passes `--simulator`, from `IOS_SIMULATOR` or the project placeholder. Without an explicit target the CLI can pick a connected physical device (it also prefers the last used device), which fails to launch. Set the name to a simulator that exists on the team's Xcode (`xcrun simctl list devices available`). For a physical device, use a separate script with `--udid`. `--simulator "Name (17.0)"` pins the OS version.

## 4. Simulator architecture alignment

On Apple Silicon the simulator runs arm64. The old `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64` Pods hack forces x86_64 Pods; if the app target does not exclude arm64 too, the CLI link fails with `found architecture 'x86_64', required architecture 'arm64'` while Xcode may still appear to work.

Default: change nothing, including an existing hard-coded `arm64` override. Remove or empty it only after every dependency is proven to ship an arm64 **simulator** slice. An explicit empty value (Apple's default, no exclusion) is valid once verified; an unverified empty value is not.

1. Show effective settings for Pods and app: `xcodebuild -workspace "<ws>" -scheme "<scheme>" -sdk iphonesimulator -showBuildSettings | grep EXCLUDED_ARCHS`.
2. Prove the simulator slice per dependency. `lipo -archs` alone is **not** proof: device and simulator slices are both `arm64`. Use one of:
   - XCFramework: `<name>.xcframework/Info.plist` has a `AvailableLibraries` entry with `SupportedPlatform = ios`, `SupportedPlatformVariant = simulator` and `arm64` in `SupportedArchitectures`.
   - Plain Mach-O (pod `.a`/framework binary): `xcrun vtool -show-build "<binary>"` (or `otool -l "<binary>" | grep -A4 LC_BUILD_VERSION`) reports `platform IOSSIMULATOR` for the arm64 slice (use `lipo -thin arm64 -output "<tmp>" "<binary>"` first if the file is fat). `platform IOS` is a device slice.
   Name each dependency that lacks it.
3. All dependencies proven: drop the arm64 exclusion in Pods and app (remove the hard-coded value, or set it to `""` explicitly).
4. A dependency lacks it: upgrade/replace it if possible; otherwise exclude arm64 consistently in Pods (`PODS_SIM_EXCLUDED_ARCHS=arm64`) **and** the app target, and build the simulator as x86_64. Record the dependency and reason.

`Podfile.native-example` changes Pods only when `PODS_SIM_EXCLUDED_ARCHS` is defined (empty allowed), applies it after the project's existing post_install settings, leaves other settings and gates alone, and warns when targets disagree. It does not edit the app project.

## Checks and limits

- Static: JSON validity, symlink logic on a disposable temp dir.
- Not verified here: Ruby syntax of the Podfile fragment (no ruby on the author host), `pod install`, Xcode/CLI build, simulator launch, Firebase or any specific dependency's slices.
- Apple sources (TN3117, XCFramework bundle docs) were verified by the root reviewer, not fetched by this author; no Mac/Xcode proof exists.

## References

- React Native CLI `run-ios` options (`--simulator`, `--udid`, `--list-devices`): `react-native-community/cli`, https://github.com/react-native-community/cli/blob/main/packages/cli-platform-apple/src/commands/runCommand/runOptions.ts ; device selection/cache in `createRun.ts` in the same directory.
- React Native CocoaPods Rosetta warning: https://github.com/facebook/react-native/blob/main/packages/react-native/scripts/cocoapods/utils.rb (`warn_if_not_on_arm64`).
- CocoaPods UTF-8 locale warning history: https://github.com/CocoaPods/CocoaPods/blob/master/CHANGELOG.md
- Apple TN3117, Resolving build errors for Apple Silicon: https://developer.apple.com/documentation/technotes/tn3117-resolving-build-errors-for-apple-silicon
- Apple, Creating a multi-platform binary framework bundle (XCFramework): https://developer.apple.com/documentation/xcode/creating-a-multi-platform-binary-framework-bundle
