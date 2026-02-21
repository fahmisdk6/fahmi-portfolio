---
title: Roadblocks to Flutter SPM Migration
description: Challenges and solutions encountered during Flutter Swift Package Manager migration.
date: 2025-12-07
tags: [Flutter]
---

## Background

As of Flutter 3.24, Flutter officially supports [Swift Package Manager (SPM)](https://developer.apple.com/documentation/swift_packages) for managing iOS and macOS native dependencies. This marks a shift away from [CocoaPods](https://cocoapods.org/), which was previously the default dependency manager for Flutter's Apple platform support.

The urgency to migrate is heightened by the upcoming change to the CocoaPods trunk service: starting in December 2026, the trunk will become read-only, meaning no new podspecs can be published to the CocoaPods server. This impending limitation further incentivizes teams to adopt SPM as the long-term solution.

However, during a recent migration attempt, we encountered several roadblocks that suggest SPM integration in Flutter is not yet production-ready in all use cases.

## Migration Attempt and Roadblocks

In late May 2025, we attempted to enable SPM and migrate several native dependencies on a Flutter project running SDK version 3.27.4. Despite initial progress, we ran into multiple blockers that complicate a smooth transition to SPM:

### 1. SPM Enablement Is Machine-Specific

Enabling SPM in a Flutter project is currently a per-machine configuration. The setting is not stored in the project's source files and therefore cannot be committed to version control. This requires each developer to manually enable SPM on their local environment. If a developer forgets to do so, the project configuration may silently revert, leading to inconsistencies and potential build failures across the team.

### 2. Incomplete Integration with Xcode and Fastlane

While Flutter provides basic support for SPM, it does not yet integrate cleanly with the broader iOS toolchain, including Xcode and Fastlane. This leads to build failures in certain scenarios. For example, SPM may not correctly update the generated package's supported platforms during an Xcode build. This issue has been documented in Flutter's GitHub repository:

[GitHub Issue #162196 – SwiftPM Xcode Build Platform Bug](https://github.com/flutter/flutter/issues/162196#issuecomment-2613399195)

### 3. Device Build Errors

Attempts to build the app on physical iOS devices may result in cryptic errors such as:
`DVTDeviceOperation: Encountered a build number that is incompatible with DVTBuildVersion`

This appears to be a known issue related to package resolution and Xcode's build system. A related discussion is available on Stack Overflow:

[Stack Overflow: DVTDeviceOperation Build Number Incompatible](https://stackoverflow.com/questions/78850571/dvtdeviceoperation-encountered-a-build-number-that-is-incompatible-with-dvtbuil)

## Conclusion

While Swift Package Manager is clearly the future of dependency management for Apple platforms — and Flutter's support is moving in that direction — our findings indicate that the integration is not yet robust enough for seamless adoption in real-world Flutter projects.

In particular, the lack of project-level configuration for enabling SPM, incomplete compatibility with build tools like Xcode and Fastlane, and device build instability are significant blockers. Until these issues are resolved in the Flutter toolchain, we recommend delaying full migration and continuing to monitor upstream Flutter updates.

Teams planning the migration should stay informed by tracking relevant issues on GitHub and preparing a fallback strategy in case of build or CI failures.
