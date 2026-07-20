import { useMemo, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { posts } from '../content/loadPosts';
import { sections } from '../data/siteContent';

export function ArchivePage() {
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('everything');
  const [year, setYear] = useState('all');
  const years = useMemo(
    () => [...new Set(posts.map((post) => post.publishedAt.slice(0, 4)))].sort((a, b) => b.localeCompare(a)),
    [],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const matches = posts.filter((post) => {
    const searchable = `${post.title} ${post.excerpt} ${post.section}`.toLowerCase();
    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (section === 'everything' || post.section === section) &&
      (year === 'all' || post.publishedAt.startsWith(year))
    );
  });

  return (
    <div className="page-wrap">
      <section className="page-hero page-hero--no-image">
        <div className="section-intro-card">
          <span className="eyebrow">archive</span>
          <h1>Find something worth reading.</h1>
          <p className="lead">Search every published piece, or narrow the archive by section and year.</p>
        </div>
      </section>

      <section className="content-band" aria-labelledby="archive-results-title">
        <div className="section-heading">
          <span className="eyebrow">search and filter</span>
          <h2 id="archive-results-title">{matches.length} matching post{matches.length === 1 ? '' : 's'}</h2>
        </div>
        <div className="hero__actions" style={{ alignItems: 'end', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <label>
            <span className="eyebrow">Words</span>
            <input aria-label="Search posts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, topic, or phrase" />
          </label>
          <label>
            <span className="eyebrow">Section</span>
            <select aria-label="Filter by section" value={section} onChange={(event) => setSection(event.target.value)}>
              {sections.map((item) => <option key={item.key} value={item.key}>{item.shortName}</option>)}
            </select>
          </label>
          <label>
            <span className="eyebrow">Year</span>
            <select aria-label="Filter by year" value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="all">All years</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="post-grid">
          {matches.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
      </section>
    </div>
  );
}
