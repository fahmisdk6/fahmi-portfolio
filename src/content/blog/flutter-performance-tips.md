---
title: Flutter Performance Tips
description: Practical tips for optimizing Flutter app performance from real-world production experience.
date: 2024-04-10
tags: [Flutter, Performance, Mobile]
---

After working on apps with millions of users, here are performance tips that actually make a difference.

## 1. Use const Constructors

Mark widgets as `const` wherever possible. This tells Flutter the widget won't change, allowing it to skip unnecessary rebuilds.

## 2. Avoid Rebuilding Large Trees

Use targeted state management. Instead of rebuilding an entire page, rebuild only the widgets that depend on changed state.

## 3. Lazy Loading

For lists with many items, use `ListView.builder` instead of `ListView`. This creates items on-demand rather than all at once.

## 4. Image Optimization

Cache images properly and use appropriate resolutions. Oversized images are one of the most common performance issues.
