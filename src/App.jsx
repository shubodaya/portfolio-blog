import { useEffect, useState } from 'react';
import { marked } from 'marked';
import yaml from 'js-yaml';

marked.setOptions({
  headerIds: false,
  mangle: false
});

const rawPosts = import.meta.glob('./content/posts/*.md', { as: 'raw', eager: true });
const rawAbout = import.meta.glob('./content/about.md', { as: 'raw', eager: true });

const parsePost = (raw, filePath) => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const frontMatter = match ? match[1] : '';
  const body = match ? match[2] : raw;
  const data = frontMatter ? yaml.load(frontMatter) : {};
  const slug = filePath
    .split('/')
    .pop()
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}-/, '');

  return {
    slug,
    title: data?.title || 'Untitled',
    date: data?.date ? new Date(data.date) : new Date(),
    summary: data?.summary || body.trim().slice(0, 140) + '...',
    categories: data?.categories || [],
    tags: data?.tags || [],
    pinned: Boolean(data?.pinned),
    body
  };
};

const parsePage = (raw) => {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const frontMatter = match ? match[1] : '';
  const body = match ? match[2] : raw;
  const data = frontMatter ? yaml.load(frontMatter) : {};

  return {
    title: data?.title ?? '',
    subtitle: data?.subtitle ?? '',
    body
  };
};

const posts = Object.entries(rawPosts)
  .map(([path, raw]) => parsePost(raw, path))
  .sort((a, b) => b.date - a.date)
  .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

const aboutEntry = Object.values(rawAbout)[0];
const aboutPage = aboutEntry ? parsePage(aboutEntry) : { title: 'About', subtitle: '', body: '' };

const allCategories = Array.from(new Set(posts.flatMap((post) => post.categories))).filter(Boolean);
const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).filter(Boolean);

const categoryCounts = allCategories.map((category) => ({
  name: category,
  count: posts.filter((post) => post.categories.includes(category)).length
}));

const tagCounts = posts.reduce((acc, post) => {
  post.tags.forEach((tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
  });
  return acc;
}, {});

const tagList = allTags.map((tag) => ({
  name: tag,
  count: tagCounts[tag] || 0
}));

const defaultTrendingTags = [
  'networking',
  'cybersecurity',
  'system-administration',
  'cloud-computing',
  'microsoft-365',
  'active-directory',
  'automation',
  'technical-support'
];

const computedTrendingTags = Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 7)
  .map(([tag]) => tag);

const trendingTags = computedTrendingTags.length > 0 ? computedTrendingTags : defaultTrendingTags;

const archives = Array.from(
  posts.reduce((acc, post) => {
    const year = post.date.getFullYear();
    const list = acc.get(year) || [];
    list.push(post);
    acc.set(year, list);
    return acc;
  }, new Map())
).sort((a, b) => b[0] - a[0]);

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(date);

const estimateRead = (text) => {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored = window.localStorage.getItem('theme');
    if (stored) {
      return stored;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname || '/';
  const normalizedPath = path.endsWith('/') ? path : `${path}/`;
  const route =
    normalizedPath === '/'
      ? 'home'
      : normalizedPath.startsWith('/categories')
        ? 'categories'
        : normalizedPath.startsWith('/tags')
          ? 'tags'
          : normalizedPath.startsWith('/archives')
            ? 'archives'
            : normalizedPath.startsWith('/about')
              ? 'about'
              : normalizedPath.startsWith('/post/')
                ? 'post'
                : 'home';
  const pathSlug = route === 'post' ? normalizedPath.split('/').filter(Boolean).pop() : null;
  const activeSlug = params.get('post') || pathSlug;
  const activePost = posts.find((post) => post.slug === activeSlug) || null;
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(() => params.get('tag') || '');
  const [avatarError, setAvatarError] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const visiblePosts = normalizedQuery
    ? posts.filter((post) =>
        [post.title, post.summary, post.tags.join(' '), post.categories.join(' ')].some((field) =>
          field.toLowerCase().includes(normalizedQuery)
        )
      )
    : posts;
  const isSearching = normalizedQuery.length > 0;
  const tagCatalog = tagList.length > 0
    ? tagList
    : defaultTrendingTags.map((name) => ({ name, count: 0 }));
  const activeTagPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : [];
  const activeNav = route === 'post' ? 'home' : route;
  const breadcrumb = (() => {
    if (route === 'home') {
      return 'Home';
    }
    if (route === 'post' && activePost) {
      return `Home > ${activePost.title}`;
    }
    const labelMap = {
      categories: 'Categories',
      tags: 'Tags',
      archives: 'Archives',
      about: 'About'
    };
    return `Home > ${labelMap[route] || 'Home'}`;
  })();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="profile">
          <div className="avatar">
            {!avatarError ? (
              <img
                src="/avatar.png"
                alt="Shubodaya Kumar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span aria-hidden="true">SK</span>
            )}
          </div>
          <h1>Shubodaya Kumar</h1>
          <p className="role">Network Security Engineer</p>
        </div>

        <nav className="menu">
          <a className={activeNav === 'home' ? 'active' : ''} href="/">
            <i className="fas fa-house"></i>
            Home
          </a>
          <a className={activeNav === 'categories' ? 'active' : ''} href="/categories/">
            <i className="fas fa-stream"></i>
            Categories
          </a>
          <a className={activeNav === 'tags' ? 'active' : ''} href="/tags/">
            <i className="fas fa-tags"></i>
            Tags
          </a>
          <a className={activeNav === 'archives' ? 'active' : ''} href="/archives/">
            <i className="fas fa-archive"></i>
            Archives
          </a>
          <a className={activeNav === 'about' ? 'active' : ''} href="/about/">
            <i className="fas fa-user"></i>
            About
          </a>
        </nav>

        <div className="sidebar-social">
          <a href="https://github.com/shubodaya" target="_blank" rel="noreferrer" aria-label="GitHub">
            <i className="fab fa-github"></i>
          </a>
          <a href="https://www.linkedin.com/in/shubodaya" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://www.youtube.com/@KumarsNetLab" target="_blank" rel="noreferrer" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="https://shubodaya.github.io/portfolio-net/" target="_blank" rel="noreferrer" aria-label="Portfolio">
            <i className="fas fa-globe"></i>
          </a>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="topbar">
          <div className="crumb">{breadcrumb}</div>
          <div className="topbar-actions">
            <div className="search">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search"
                aria-label="Search posts"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button
              className="search-cancel"
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              Cancel
            </button>
          </div>
        </div>

        {isSearching && (
          <>
            <div className="page-head">
              <h2>Search results</h2>
              <p className="page-sub">
                {visiblePosts.length} result{visiblePosts.length === 1 ? '' : 's'} for "{query}"
              </p>
            </div>
            {visiblePosts.length === 0 && (
              <p className="muted">No posts matched your search.</p>
            )}
            {visiblePosts.length > 0 && (
              <section className="post-list">
                {visiblePosts.map((post) => (
                  <article key={post.slug} className={`post-card${post.pinned ? ' pinned' : ''}`}>
                    {post.pinned && (
                      <div className="pinned-label">
                        <i className="fas fa-thumbtack"></i>
                        Pinned
                      </div>
                    )}
                    <h3>
                      <a href={`/post/${post.slug}/`}>{post.title}</a>
                    </h3>
                    <p>{post.summary}</p>
                    <div className="post-meta">
                      <span>{formatDate(post.date)}</span>
                      <span>{estimateRead(post.body)}</span>
                      {post.categories[0] && <span>{post.categories[0]}</span>}
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {!isSearching && route === 'home' && (
          <>
            <section className="post-list">
              {posts.map((post) => (
                <article key={post.slug} className={`post-card${post.pinned ? ' pinned' : ''}`}>
                  {post.pinned && (
                    <div className="pinned-label">
                      <i className="fas fa-thumbtack"></i>
                      Pinned
                    </div>
                  )}
                  <h3>
                    <a href={`/post/${post.slug}/`}>{post.title}</a>
                  </h3>
                  <p>{post.summary}</p>
                  <div className="post-meta">
                    <span>{formatDate(post.date)}</span>
                    <span>{estimateRead(post.body)}</span>
                    {post.categories[0] && <span>{post.categories[0]}</span>}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        {!isSearching && route === 'categories' && (
          <>
            <div className="page-head">
              <h2>Categories</h2>
              <p className="page-sub">Browse posts by topic</p>
            </div>
            <section className="category-grid">
              {categoryCounts.map((category) => (
                <div key={category.name} className="category-card">
                  <span>{category.name}</span>
                  <span className="category-count">{category.count}</span>
                </div>
              ))}
            </section>
          </>
        )}

        {!isSearching && route === 'tags' && (
          <>
            <div className="page-head">
              <h2>Tags</h2>
              <p className="page-sub">Explore popular keywords</p>
            </div>
            <section className="tag-list">
              {tagCatalog.map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  className={`tag-pill${selectedTag === tag.name ? ' active' : ''}`}
                  onClick={() => setSelectedTag(selectedTag === tag.name ? '' : tag.name)}
                >
                  <span>{tag.name}</span>
                  <span className="tag-count">{tag.count}</span>
                </button>
              ))}
            </section>
            <section className="tag-results">
              {!selectedTag && <p className="muted">Select a tag to view related posts.</p>}
              {selectedTag && (
                <>
                  <h3>Posts tagged "{selectedTag}"</h3>
                  {activeTagPosts.length === 0 && (
                    <p className="muted">No posts yet for this tag.</p>
                  )}
                  {activeTagPosts.length > 0 && (
                    <div className="post-list">
                      {activeTagPosts.map((post) => (
                        <article key={post.slug} className={`post-card${post.pinned ? ' pinned' : ''}`}>
                          {post.pinned && (
                            <div className="pinned-label">
                              <i className="fas fa-thumbtack"></i>
                              Pinned
                            </div>
                          )}
                          <h3>
                            <a href={`/post/${post.slug}/`}>{post.title}</a>
                          </h3>
                          <p>{post.summary}</p>
                          <div className="post-meta">
                            <span>{formatDate(post.date)}</span>
                            <span>{estimateRead(post.body)}</span>
                            {post.categories[0] && <span>{post.categories[0]}</span>}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {!isSearching && route === 'archives' && (
          <>
            <div className="page-head">
              <h2>Archives</h2>
              <p className="page-sub">Posts by year</p>
            </div>
            <section className="archive-timeline">
              {archives.map(([year, list]) => (
                <div key={year} className="archive-year-group">
                  <div className="archive-year">{year}</div>
                  <div className="archive-items">
                    {list.map((post) => (
                      <div key={post.slug} className="archive-item">
                        <span className="archive-date">{formatDate(post.date)}</span>
                        <a href={`/post/${post.slug}/`}>{post.title}</a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

        {!isSearching && route === 'about' && (
          <>
            {(aboutPage.title || aboutPage.subtitle) && (
              <div className="page-head">
                {aboutPage.title && <h2>{aboutPage.title}</h2>}
                {aboutPage.subtitle && <p className="page-sub">{aboutPage.subtitle}</p>}
              </div>
            )}
            <section className="about-content">
              <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: marked.parse(aboutPage.body) }}
              />
            </section>
          </>
        )}

        {!isSearching && route === 'post' && activePost && (
          <article className="post-view">
            <a className="back-link" href="/">Back to Home</a>
            <h1>{activePost.title}</h1>
            <div className="post-meta">
              <span>{formatDate(activePost.date)}</span>
              <span>{estimateRead(activePost.body)}</span>
              {activePost.categories[0] && <span>{activePost.categories[0]}</span>}
            </div>
            <div className="post-tags">
              {activePost.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <div
              className="post-body"
              dangerouslySetInnerHTML={{ __html: marked.parse(activePost.body) }}
            />
          </article>
        )}

        <footer className="site-footer">
          <p>Copyright 2026 Shubodaya Kumar. Some rights reserved.</p>
          <p>It always seems impossible until it is done. - Nelson Mandela</p>
        </footer>
      </main>

      <aside className="panel">
        <div className="panel-section">
          <h4>Recently Updated</h4>
          <ul>
            {posts.slice(0, 4).map((post) => (
              <li key={post.slug}>
                <a href={`/post/${post.slug}/`}>{post.title}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-section">
          <h4>Trending Tags</h4>
          <div className="tag-cloud">
            {trendingTags.map((item) => (
              <a key={item} href="/tags/">{item}</a>
            ))}
          </div>
        </div>

      </aside>
    </div>
  );
}
