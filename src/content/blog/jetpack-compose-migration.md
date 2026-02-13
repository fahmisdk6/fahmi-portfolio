---
title: Migrating from XML to Jetpack Compose
description: Lessons learned from incrementally migrating a large Android app from XML layouts to Jetpack Compose.
date: 2024-01-08
tags: [Android, Jetpack Compose, Kotlin]
---

Migrating a large codebase to Compose doesn't have to be all-or-nothing. Here's how we did it incrementally.

## The Strategy

Start with new screens in Compose. Wrap existing XML views with ComposeView when needed. Migrate screen by screen.

## Interop Tips

- Use `AndroidView` for complex XML views you can't migrate yet
- Share ViewModels between Compose and XML screens
- Keep the theme consistent with a shared design system

## Performance Wins

After migration, we saw reduced boilerplate, faster development cycles, and fewer UI bugs thanks to Compose's declarative model.
