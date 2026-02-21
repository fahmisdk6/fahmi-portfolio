---
title: "AI Usecase: My Experience Building Portfolio Website Using Cursor"
description: How I leveraged AI-powered development tools to build my portfolio website efficiently.
date: 2025-06-03
tags: [AI]
---

Building a portfolio website is a common task for developers, but it can be time-consuming. Recently, I decided to leverage Cursor AI to build my portfolio website, and the experience was both fascinating and educational. Here's my journey through different phases of development.

## Phase 1: The Big Picture

The journey started with a simple prompt:
> "Generate a professional website to showcase experience, portfolio, and blog."

Cursor quickly generated a complete website structure with:
- Modern, responsive design
- Navigation system
- Section layouts
- Basic styling

This initial phase was incredibly fast and efficient. The AI understood the core requirements and provided a solid foundation to build upon.

## Phase 2: Design Refinement

With the basic structure in place, I moved to refining the design:
- Specified the design style
- Iterated through different color schemes
- Adjusted layouts and spacing
- Generated suitable images and vectors

What impressed me was Cursor's ability to:
- Understand design preferences
- Generate appropriate visual elements
- Maintain consistency across iterations
- Adapt to feedback quickly

## Phase 3: Feature Implementation

This phase focused on specific features and took more time than the initial setup:

### Blog System
- Implemented MDX rendering
- Added YouTube player integration
- Set up blog post metadata
- Created a clean reading experience

### Contact Form
- Integrated Formspree
- Added form validation
- Implemented success/error states

### SEO & Metadata
- Added proper meta tags
- Implemented Open Graph protocol
- Set up Twitter cards
- Optimized for search engines

## Phase 4: The Debugging Challenge

This phase was particularly interesting and taught me a lot about debugging with AI assistance. I encountered a metadata generation issue where blog posts weren't showing proper previews when shared on social media. The debugging process became a fascinating back-and-forth between me and Cursor.

### The Initial Problem
I first noticed the issue when trying to share a blog post on LinkedIn. The social media platform didn't show any preview at all - it was completely blank. This was strange because:
- The blog post rendered perfectly in the browser
- Other pages (home, portfolio, experience) showed correct previews
- The metadata was properly defined in the blog post frontmatter

### The Investigation
1. First, I checked the Vercel deployment logs and found that the blog post pages were returning 500 errors when accessed by social media crawlers.

2. I asked Cursor to investigate the issue. Its first hypothesis was that the navigation bar component was causing the problem.

3. However, I pointed out that:
   - Only blog posts were affected
   - Other pages with the same navigation bar worked fine
   - The issue was specific to social media previews

### The Breakthrough
After providing this context, Cursor quickly identified a new hypothesis: the YouTube player component in the blog posts. This made more sense because:
- Blog posts were the only pages with embedded YouTube players
- The player component was client-side rendered
- Social media crawlers might have issues with client-side components

### The Solution
The issue was that the YouTube player component was trying to render during server-side rendering, which was causing the metadata generation to fail. The solution was to ensure the YouTube player only renders on the client side:

```typescript
// Example of the fix
'use client';

import { useEffect, useState } from 'react';

export function YouTubePlayer({ videoId }: { videoId: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Don't render anything during SSR
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
```

This fix:
1. Uses the `'use client'` directive to mark the component as client-side only
2. Implements a mounting check to prevent rendering during SSR
3. Only renders the YouTube player after the component is mounted on the client
4. Allows the metadata generation to complete successfully during SSR

The key was understanding that the YouTube player was interfering with the server-side rendering process, and by making it client-side only, we allowed the metadata generation to work properly.

### Key Learnings from the Debugging Process
1. **Context is Crucial**
   - Providing specific error details helped Cursor understand the problem
   - Explaining what worked and what didn't narrowed down the possibilities
   - Sharing the full context led to better hypotheses

2. **Iterative Problem Solving**
   - First hypothesis (navigation bar) was logical but incorrect
   - Second hypothesis (YouTube player) was more specific and correct
   - Each iteration brought us closer to the solution

3. **AI as a Debugging Partner**
   - Cursor was great at generating hypotheses
   - It needed human guidance to evaluate them
   - The combination of AI and human debugging was effective

4. **Systematic Approach**
   - Check logs first
   - Identify patterns
   - Test hypotheses
   - Implement and verify solutions

This debugging experience demonstrated that while AI can be incredibly helpful in identifying and solving problems, it still requires human guidance and context to be most effective. The back-and-forth process, while sometimes frustrating, ultimately led to a better understanding of the problem and a more robust solution.

## Phase 5: Polishing & Optimization

The final phase focused on refinement:

### Mobile Optimization
- Adjusted layouts for smaller screens
- Improved touch interactions
- Enhanced readability

### Performance
- Added analytics
- Implemented speed insights

### Content
- Updated experience section
- Refined portfolio items
- Added blog content
- Improved copywriting

## Key Learnings

1. **AI as a Development Partner**
   - Excellent for initial setup and structure
   - Great at understanding design requirements
   - Needs clear guidance for specific features
   - Requires human oversight for debugging

2. **Efficiency vs. Precision**
   - Big tasks are handled quickly
   - Small, specific tasks need more iteration
   - Debugging requires human intervention
   - Final polish needs human touch

3. **Best Practices**
   - Start with clear, high-level requirements
   - Break down complex features
   - Provide specific feedback
   - Use AI for what it's good at

## Conclusion

Building a portfolio website with Cursor AI was a valuable experience that demonstrated both the strengths and limitations of AI-assisted development. While it significantly accelerated the initial development and design phases, it required careful guidance and human intervention for specific features and debugging.

The key to success was understanding when to let the AI take the lead and when to step in with specific guidance. This balance between AI assistance and human expertise resulted in a professional, well-optimized portfolio website that effectively showcases my work and experience.
