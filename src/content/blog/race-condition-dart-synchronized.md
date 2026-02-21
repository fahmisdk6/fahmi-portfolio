---
title: How I Fixed a Race Condition in Dart Using the Synchronized Package
description: Debugging and fixing a race condition in Dart with the synchronized package.
date: 2025-04-06
tags: [Flutter]
---

Race conditions in Dart aren't always obvious — until your app starts misbehaving in weird, inconsistent ways.

I recently encountered a bug where two async methods were stepping on each other. The solution? A tiny but powerful Dart package: synchronized.

Let's walk through the problem and how I fixed it.

## The Problem: Async != Safe

Here's the setup:

```dart
Future<void> start() async {
  // setup logic
}

Future<void> stop() async {
  // cleanup logic
}
```

Now imagine these get called almost at the same time — maybe from different parts of the app:

```dart
start(); // Not awaited

// on a different part of the app
stop();  // Not awaited either
```

This is fire-and-forget. But the problem is: since both methods contain await inside, they run concurrently. That means stop() could finish before start() even begins.

In some scenarios, this leads to:

- Incomplete setup
- Conflicting state
- Errors in backend or SDKs (like tracing tools)

## The Fix: Use Lock from the synchronized Package

The synchronized package lets you define mutual exclusion — so one block of code can run at a time.

```dart
import 'package:synchronized/synchronized.dart';

final Lock _lock = Lock();

Future<void> start() {
  return _lock.synchronized(() async {
    // guaranteed to not overlap with stop()
    await Future.delayed(Duration(milliseconds: 100));
    print("Started");
  });
}

Future<void> stop() {
  return _lock.synchronized(() async {
    await Future.delayed(Duration(milliseconds: 50));
    print("Stopped");
  });
}
```

Now, even though start() and stop() are not awaited by the caller, they won't run at the same time. The lock ensures that.

## Scoped Locks for More Granular Control

What if you have multiple instances — like sessions, files, or user IDs — and want to isolate each one?

This pattern helps:

```dart
final Map<String, Lock> _locks = {};

Lock _getLock(String key) {
  return _locks.putIfAbsent(key, () => Lock());
}

Future<void> doSomething(String key) {
  return _getLock(key).synchronized(() async {
    // only one task per key can run at a time
    print("Running $key");
    await Future.delayed(Duration(milliseconds: 100));
  });
}
```

So doSomething("A") and doSomething("B") can run in parallel — but two calls to "A" will wait in line.

## Real-World Use Cases

Here's where Lock becomes super useful:

- Managing start/stop lifecycles
- Preventing duplicate API calls
- Controlling access to local storage
- Logging or analytics events
- Database writes per key/session

## Takeaways

- Dart async gives you concurrency, not thread safety
- Use synchronized to prevent race conditions in fire-and-forget calls
- Scoped locks let you maintain performance and correctness
- Easy to add, powerful in practice

If you've faced subtle bugs caused by async functions clashing with each other — try out synchronized.
