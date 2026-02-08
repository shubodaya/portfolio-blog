# How to Write a Blog Post

This site supports two ways to publish posts. The recommended option is the private admin login (Netlify + Decap CMS).

## Option A (Recommended): Private /admin Login (Netlify)

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
5. Click Publish.

This creates a Markdown file in src/content/posts and redeploys the site.

## Option B: Manual (GitHub)

Create a new file in src/content/posts with this format:

---
title: "My New Post"
date: 2026-02-05T10:00:00+00:00
summary: "Short summary here."
categories:
  - Projects
tags:
  - networking
  - automation
pinned: false
---

Write your post content here.

Commit and push to deploy.
