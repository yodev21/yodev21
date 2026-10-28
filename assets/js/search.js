(() => {
  const dialog = document.querySelector('[data-search-dialog]');
  const openButton = document.querySelector('[data-search-open]');
  const closeButton = document.querySelector('[data-search-close]');
  const input = document.querySelector('[data-search-input]');
  const status = document.querySelector('[data-search-status]');
  const results = document.querySelector('[data-search-results]');

  if (!dialog || !openButton || !input || !status || !results) return;

  const isEnglish = document.documentElement.lang.startsWith('en');
  let sectionsPromise;
  let debounceTimer;

  const normalize = (value) => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const findTermIndex = (text, term) => {
    if (/^[a-z0-9][a-z0-9+.#]*$/.test(term) && term.length <= 2) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = text.match(new RegExp(`(^|[^a-z0-9])(${escaped})(?=$|[^a-z0-9])`));
      return match ? match.index + match[1].length : -1;
    }
    return text.indexOf(term);
  };

  const collectSections = (documentNode, page) => {
    const main = documentNode.querySelector('#main-content');
    if (!main) return [];

    const sections = [];
    let current = { title: page.title, url: page.url, text: '' };

    for (const node of main.querySelectorAll('h1, h2, h3, p, li, td, th, summary, .article-card__title')) {
      if (/^H[1-3]$/.test(node.tagName)) {
        if (current.text.trim()) sections.push(current);
        current = {
          title: node.textContent.trim() || page.title,
          url: node.id ? `${page.url}#${encodeURIComponent(node.id)}` : page.url,
          text: ''
        };
      } else {
        current.text += ` ${node.textContent}`;
      }
    }

    if (current.text.trim()) sections.push(current);
    return sections.map((section) => ({
      ...section,
      pageTitle: page.title,
      text: section.text.replace(/\s+/g, ' ').trim()
    }));
  };

  const loadSections = () => {
    if (sectionsPromise) return sectionsPromise;

    sectionsPromise = fetch(dialog.dataset.searchIndex)
      .then((response) => {
        if (!response.ok) throw new Error('Search index could not be loaded');
        return response.json();
      })
      .then((pages) => pages.filter((page) => page.lang === document.documentElement.lang))
      .then((pages) => Promise.all(pages.map(async (page) => {
        const response = await fetch(page.url);
        if (!response.ok) return [];
        const html = await response.text();
        return collectSections(new DOMParser().parseFromString(html, 'text/html'), page);
      })))
      .then((groups) => groups.flat());

    return sectionsPromise;
  };

  const appendHighlightedText = (container, text, term) => {
    const normalizedText = normalize(text);
    const index = findTermIndex(normalizedText, term);
    if (index < 0) {
      container.textContent = text;
      return;
    }

    const start = Math.max(0, index - 42);
    const end = Math.min(text.length, index + term.length + 78);
    const excerpt = text.slice(start, end);
    const matchAt = findTermIndex(normalize(excerpt), term);
    if (matchAt < 0) {
      container.textContent = excerpt;
      return;
    }
    if (start > 0) container.append('…');
    container.append(excerpt.slice(0, matchAt));
    const mark = document.createElement('mark');
    mark.textContent = excerpt.slice(matchAt, matchAt + term.length);
    container.append(mark, excerpt.slice(matchAt + term.length));
    if (end < text.length) container.append('…');
  };

  const renderResults = (sections, query) => {
    const terms = normalize(query).split(' ').filter(Boolean);
    results.replaceChildren();
    results.scrollTop = 0;

    if (!terms.length) {
      status.textContent = isEnglish
        ? 'Enter a keyword to search profiles, work, and technologies.'
        : 'プロフィール、実績、使用技術から検索できます。';
      return;
    }

    const matches = sections
      .map((section) => {
        const title = normalize(section.title);
        const text = normalize(section.text);
        if (!terms.every((term) => findTermIndex(title, term) >= 0 || findTermIndex(text, term) >= 0)) return null;
        const score = terms.reduce((total, term) => total + (findTermIndex(title, term) >= 0 ? 4 : 0) + (findTermIndex(text, term) >= 0 ? 1 : 0), 0);
        return { ...section, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    status.textContent = isEnglish
      ? `${matches.length} result${matches.length === 1 ? '' : 's'}`
      : `${matches.length}件見つかりました`;

    for (const match of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const title = document.createElement('strong');
      const pageTitle = document.createElement('span');
      const excerpt = document.createElement('p');

      link.href = match.url;
      title.textContent = match.title;
      appendHighlightedText(excerpt, match.text, terms[0]);
      link.append(title);
      if (match.pageTitle !== match.title) {
        pageTitle.textContent = match.pageTitle;
        link.append(pageTitle);
      }
      link.append(excerpt);
      item.append(link);
      results.append(item);
    }
  };

  const runSearch = () => {
    status.textContent = isEnglish ? 'Searching…' : '検索しています…';
    loadSections()
      .then((sections) => renderResults(sections, input.value))
      .catch(() => {
        status.textContent = isEnglish
          ? 'Search could not be loaded. Please try again.'
          : '検索を読み込めませんでした。もう一度お試しください。';
      });
  };

  const openSearch = () => {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    loadSections();
    window.setTimeout(() => input.focus(), 0);
  };

  openButton.addEventListener('click', openSearch);
  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  input.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runSearch, 120);
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 'k') {
      event.preventDefault();
      dialog.open ? dialog.close() : openSearch();
    }
  });
})();
