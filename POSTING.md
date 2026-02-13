# How to Write a Blog Post

This site supports two ways to publish posts.
If hosted on GitHub Pages, use Option A (GitHub/manual).
Option B (`/admin`) works only when hosted on Netlify with Identity + Git Gateway.

## Option A (Recommended for GitHub Pages): Manual (GitHub)

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

## Option B: Private /admin Login (Netlify Only)

One-time setup on Netlify:
1. Deploy this repo on Netlify.
2. Enable Identity.
3. Enable Git Gateway.
4. Invite your email.

Write a post:
1. Open https://YOUR-SITE.netlify.app/admin
2. Log in.
3. Click Posts -> New Post.
4. Fill Title, Date, Summary, Categories, Tags, Body.
   For Categories, use branch format with `>` like:
   `Experience > Networking > Firewalls`
5. Use the Tags field to add multiple tags (click "Add Tag" for each).
6. Use Images and Videos to upload media for the post.
7. Click Publish.
Tip: In the Body editor, use the media button to insert uploads directly into the article.

If the Tags field still shows a single input, you can also type tags separated by commas:
networking, automation, security

This creates a Markdown file in `src/content/posts` and redeploys the site.

## Category Branching Guide

- Use `Parent > Child > Leaf` to build hierarchy.
- Example: `Experience > Network Security > SonicWall`
- On the site, this lets you:
  - see where a category belongs,
  - filter by a whole branch on the Categories page,
  - find posts by category path in search.
