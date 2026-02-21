---
title: Improving User Experience by Preloading Images in Flutter
description: Techniques for preloading images in Flutter to create smoother user experiences.
date: 2025-04-13
tags: [Flutter]
---

When building apps for millions of users, every millisecond matters, especially when it comes to user experience. One crucial aspect that can greatly affect app performance is how quickly images are loaded. In this article, I'll walk you through a simple trick I used to significantly improve image loading performance in Flutter, resulting in a smoother and more seamless user experience.

## The Problem: Inflate -> Loading -> Render

Some of Flutter's widgets, like ListView and Carousel, use builder patterns, meaning their child widgets are rendered lazily. The advantage is that only the widgets that are about to become visible are inflated. However, when it comes to Image widgets, this means the image loading process only starts once the widget is visible on the screen.

For users, this often translates to seeing a placeholder or loading indicator first and waiting for the actual image to be rendered. This experience can be frustrating, especially in data-heavy apps or during slow network conditions.

Here's a video demonstration of the problem:

<iframe width="100%" height="400" src="https://www.youtube.com/embed/XqVdAOs8WPo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## The Fix: Preload The Images

The solution to this problem is to preload the images before they're actually needed on the screen. This tip works specifically when you're using CachedNetworkImage for your Image widget.

Under the hood, CachedNetworkImage uses DefaultCacheManager to cache images locally, and this caching mechanism gives us a way to preload images into memory before the user even sees them. Here's how you can do it.

### How CachedNetworkImage Works

CachedNetworkImage automatically caches images so they don't need to be downloaded again, but we can force it to preload images right away, ensuring the images are ready when the user scrolls to them.

```dart
@immutable
class CachedNetworkImageProvider extends ImageProvider<CachedNetworkImageProvider> {
  ...
  /// The default cache manager used for image caching.
  static BaseCacheManager defaultCacheManager = DefaultCacheManager();
  ...
}
```

This class gives us access to the DefaultCacheManager, which we can use to download and cache images ahead of time.

### Preloading Images

Let's say you have a list of image URLs that you want to display in your app. Instead of waiting for the Image widget to become visible before loading the images, we can preload them as soon as we have the URLs, improving the user experience.

```dart
void getBannersData() async {
   final bannerData = await useCase.getBannerData(); // get list of URL images
   _preloadImages(imageUrls); // preload images immediately
   // trigger rendering of the screen
}

void _preloadImages(List<String> imageUrls) async {
    final DefaultCacheManager cacheManager = DefaultCacheManager();
    for (String url in imageUrls) {
      cacheManager.downloadFile(url);  // Download the image to cache
    }
}
```

With this simple trick, images will be preloaded into the cache as soon as you have the URLs, meaning they'll render instantly when the user scrolls to them.

<iframe width="100%" height="400" src="https://www.youtube.com/embed/oZ9z-KRTA9I" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Adding Timeout and File Exists Check for Efficiency

While preloading images is effective, you also need to ensure it's done efficiently. Here's an improved version of the preloading function that adds a timeout and checks if the image is already cached.

### Efficient Preloading Function

```dart
static Future<void> preloadImages(
    DefaultCacheManager cacheManager,
    List<String> imageUrls,
) async {
    await Future.forEach(imageUrls, (imageUrl) async {
      // Check if the file is already in the cache
      FileInfo? fileInfo = await cacheManager.getFileFromCache(imageUrl);
      bool fileExists = false;

      if (fileInfo != null) {
        // Verify that the cached file exists
        fileExists = await fileInfo.file.exists();
      }

      // If the file doesn't exist, download it
      if (!fileExists) {
        try {
          await cacheManager.downloadFile(imageUrl);
        } catch (e) {
          // Handle potential errors, e.g., invalid or corrupted URLs
          print('Error preloading image: $imageUrl - $e');
        }
      }
    }).timeout(const Duration(seconds: 10));  // Timeout after 10 seconds per image
}
```

### Explanation of Additions:

- **File Existence Check**: Before downloading an image, we check if it's already cached. This prevents unnecessary network calls and speeds up subsequent load times.
- **Timeout**: We added a 10-second timeout per image to avoid hanging the process for too long in case of slow network conditions or invalid URLs.
- **Error Handling**: The function also includes basic error handling to catch issues with incorrect or corrupted URLs, ensuring the app doesn't crash.

## Takeaways

- Preloading images helps improve the user experience by reducing the time users wait for images to load, especially in lists or carousels.
- Efficient caching ensures that images are only downloaded once, speeding up future renders and reducing network load.
- Adding a timeout and file existence check makes the process more efficient, preventing unnecessary network requests and improving reliability.

By implementing these techniques, you can provide a seamless and fast experience for your users, even when dealing with a large number of images.
