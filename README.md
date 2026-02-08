# Shubodaya Kumar | Portfolio Blog

Live site: https://shubodaya-blog.netlify.app/

## What This Is
This is my personal portfolio blog. I use it to publish write-ups on networking, cybersecurity, automation, and lab work, plus updates about what I am building and learning.

## How I Publish
I use a private admin portal to write posts and update the About page.

Admin URL: https://shubodaya-blog.netlify.app/admin

Steps:
1. Log in to the admin portal.
2. Create a new post.
3. Add multiple tags, optional images/videos, and publish.
4. Update the About page when needed.

If the admin portal is not available, I can also add posts manually by creating Markdown files under `src/content/posts`.

## Features
1. Clean, dark-mode blog layout inspired by a developer portfolio style.
2. Tags, categories, archives, and search.
3. Media uploads (images and videos) for posts.
4. About page that I can edit from the admin portal.

## Tech Stack
1. React + Vite
2. Decap CMS (Netlify CMS)
3. Netlify hosting
4. Markdown content in `src/content`

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deployment
Netlify builds the site automatically on every push to the `main` branch and publishes the `dist` folder.
