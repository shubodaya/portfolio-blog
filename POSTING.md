# How to Write a Blog Post

This site is hosted on GitHub Pages.
Publish posts by adding Markdown files in `src/content/posts`.

## Add a New Post

Create a new file in `src/content/posts` with this format:

---
title: "My New Post"
date: 2026-02-05T10:00:00+00:00
summary: "Short summary here."
categories:
  - Projects > Cloud > Azure
  - Projects > Automation
tags:
  - networking
  - automation
images:
  - /uploads/example-image.png
videos:
  - /uploads/example-video.mp4
pinned: false
---

Write your post content here.

Commit and push to deploy.

## Category Branching Guide

- Use `Parent > Child > Leaf` to build hierarchy.
- Example: `Experience > Network Security > SonicWall`
- On the site, this lets you:
  - see where a category belongs,
  - filter by a whole branch on the Categories page,
  - find posts by category path in search.
