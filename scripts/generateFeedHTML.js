#!/usr/bin/env node

/**
 * Generate arXiv Feed HTML Page
 * Reads papers.json and creates a responsive HTML page
 */

const fs = require('fs');
const path = require('path');

const PAPERS_FILE = path.join(__dirname, '..', 'data', 'papers.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'papers', 'index.html');

/**
 * Load papers from JSON file
 */
function loadPapers() {
  try {
    if (!fs.existsSync(PAPERS_FILE)) {
      throw new Error(`File not found: ${PAPERS_FILE}`);
    }

    const content = fs.readFileSync(PAPERS_FILE, 'utf8');
    const data = JSON.parse(content);

    return {
      papers: data.papers || [],
      metadata: data.metadata || {},
      lastUpdated: data.lastUpdated,
      totalPapers: data.totalPapers || 0,
      newPapers: data.newPapers || 0
    };
  } catch (err) {
    throw new Error(`Failed to load papers: ${err.message}`);
  }
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00Z');
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Create a paper card HTML
 */
function createPaperCard(paper, index) {
  const authors = paper.authors.join(', ');
  const summary = escapeHTML(paper.summary.substring(0, 300) + '...');
  const title = escapeHTML(paper.title);
  const arxivId = paper.arxivId;

  return `
    <article class="paper-card" data-arxiv-id="${arxivId}">
      <div class="paper-header">
        <h3 class="paper-title">
          <a href="${paper.arxivUrl}" target="_blank" rel="noopener noreferrer">
            ${title}
          </a>
        </h3>
      </div>
      
      <div class="paper-meta">
        <span class="paper-date">📅 ${formatDate(paper.published)}</span>
        <span class="paper-version">${paper.arxivVersion}</span>
      </div>

      <div class="paper-authors">
        <strong>Authors:</strong> ${authors}
      </div>

      <p class="paper-summary">${summary}</p>

      <div class="paper-categories">
        ${paper.categories.map((cat) => `<span class="category-tag">${escapeHTML(cat)}</span>`).join('')}
      </div>

      <div class="paper-actions">
        <a href="${paper.arxivUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          📖 View on arXiv
        </a>
        <a href="${paper.pdfUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
          📥 PDF
        </a>
      </div>
    </article>
  `;
}

/**
 * Generate complete HTML page
 */
function generateHTML(data) {
  const paperCards = data.papers.map((paper, idx) => createPaperCard(paper, idx)).join('\n');
  
  const lastUpdatedDate = new Date(data.lastUpdated).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC'
  });

  const emptyState = data.papers.length === 0 ? `
    <div class="empty-state">
      <p>📚 No papers loaded yet.</p>
      <p>Run the fetch script to populate the feed:</p>
      <code>npm run fetch-arxiv</code>
    </div>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>arXiv Feed - Biomedical & Health AI Papers | Coding Blog</title>
  <meta name="description" content="Daily curated feed of latest Biomedical and Health AI research papers from arXiv">
  <link rel="stylesheet" href="../styles/main.css">
  <link rel="stylesheet" href="../styles/responsive.css">
  <style>
    body.papers-page {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      min-height: 100vh;
    }

    .papers-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .papers-header {
      text-align: center;
      margin-bottom: 40px;
      color: #fff;
    }

    .papers-header h1 {
      font-size: 2.5em;
      margin: 20px 0;
      color: #FFB6C1;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .papers-header p {
      font-size: 1.1em;
      color: #ecf0f1;
      margin: 10px 0;
    }

    .feed-meta {
      background: rgba(255, 255, 255, 0.1);
      border-left: 4px solid #FFB6C1;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      color: #ecf0f1;
    }

    .feed-meta p {
      margin: 8px 0;
      font-size: 0.95em;
    }

    .feed-meta code {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #FFD700;
    }

    .papers-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }

    .paper-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 107, 107, 0.2);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .paper-card:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 107, 107, 0.5);
      box-shadow: 0 8px 24px rgba(255, 107, 107, 0.2);
    }

    .paper-header {
      margin-bottom: 15px;
    }

    .paper-title {
      margin: 0 0 10px 0;
      font-size: 1.4em;
      line-height: 1.4;
    }

    .paper-title a {
      color: #FFB6C1;
      text-decoration: none;
      transition: color 0.2s;
    }

    .paper-title a:hover {
      color: #FF69B4;
      text-decoration: underline;
    }

    .paper-meta {
      display: flex;
      gap: 15px;
      margin-bottom: 12px;
      font-size: 0.9em;
      color: #bdc3c7;
    }

    .paper-date {
      font-weight: 500;
    }

    .paper-version {
      background: rgba(255, 107, 107, 0.2);
      padding: 2px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85em;
    }

    .paper-authors {
      margin-bottom: 15px;
      color: #ecf0f1;
      font-size: 0.95em;
      line-height: 1.5;
    }

    .paper-authors strong {
      color: #FFB6C1;
    }

    .paper-summary {
      color: #d5dbdb;
      line-height: 1.6;
      margin-bottom: 15px;
      font-size: 0.95em;
    }

    .paper-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
    }

    .category-tag {
      background: rgba(255, 107, 107, 0.15);
      color: #FFB6C1;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 500;
      border: 1px solid rgba(255, 107, 107, 0.3);
    }

    .paper-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.2s;
      border: none;
      cursor: pointer;
      display: inline-block;
    }

    .btn-primary {
      background: #FF6B6B;
      color: #fff;
    }

    .btn-primary:hover {
      background: #FF5252;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }

    .btn-secondary {
      background: rgba(255, 107, 107, 0.2);
      color: #FFB6C1;
      border: 1px solid #FFB6C1;
    }

    .btn-secondary:hover {
      background: rgba(255, 107, 107, 0.3);
      border-color: #FF6B6B;
      color: #FF6B6B;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #ecf0f1;
    }

    .empty-state p {
      font-size: 1.1em;
      margin: 15px 0;
    }

    .empty-state code {
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 16px;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      color: #FFD700;
      display: inline-block;
      margin-top: 20px;
    }

    .back-link {
      color: #FFB6C1;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
      display: inline-block;
    }

    .back-link:hover {
      text-decoration: underline;
      color: #FF6B6B;
    }

    /* Search Box Styles */
    .search-container {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
      border: 2px solid rgba(255, 107, 107, 0.3);
    }

    .search-container h3 {
      color: #FFB6C1;
      margin: 0 0 15px 0;
      font-size: 1.2em;
    }

    .search-box {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 12px 16px;
      border: 2px solid rgba(255, 107, 107, 0.3);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 1em;
      outline: none;
      transition: all 0.3s ease;
    }

    .search-input::placeholder {
      color: #bdc3c7;
    }

    .search-input:focus {
      border-color: #FF6B6B;
      box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
    }

    .search-btn {
      padding: 12px 24px;
      background: #FF6B6B;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1em;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .search-btn:hover {
      background: #FF5252;
      transform: translateY(-2px);
    }

    .clear-btn {
      padding: 12px 20px;
      background: rgba(255, 107, 107, 0.2);
      color: #FFB6C1;
      border: 1px solid #FFB6C1;
      border-radius: 8px;
      font-size: 1em;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .clear-btn:hover {
      background: rgba(255, 107, 107, 0.3);
      color: #FF6B6B;
    }

    .search-results-info {
      margin-top: 15px;
      padding: 10px 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      color: #ecf0f1;
      font-size: 0.95em;
      display: none;
    }

    .search-results-info.visible {
      display: block;
    }

    .highlight {
      background: rgba(255, 215, 0, 0.4);
      padding: 1px 3px;
      border-radius: 3px;
    }

    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: #ecf0f1;
      display: none;
    }

    .no-results.visible {
      display: block;
    }

    @media (max-width: 768px) {
      .papers-header h1 {
        font-size: 1.8em;
      }

      .papers-container {
        padding: 15px;
      }

      .paper-card {
        padding: 18px;
      }

      .paper-title {
        font-size: 1.1em;
      }

      .paper-meta {
        flex-direction: column;
        gap: 8px;
      }

      .paper-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .paper-card,
      .btn {
        transition: none;
      }

      .paper-card:hover {
        transform: none;
      }
    }
  </style>
</head>
<body class="papers-page">
  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <a href="../index.html">💻 Coding Blog</a>
      </div>
      <ul class="nav-menu">
        <li><a href="../index.html" class="nav-link">Home</a></li>
        <li><a href="../pacman/index.html" class="nav-link">Pac-Man Game</a></li>
        <li><a href="../papers/index.html" class="nav-link active">Papers Feed</a></li>
        <li><a href="../index.html#about" class="nav-link">About</a></li>
      </ul>
    </div>
  </nav>

  <div class="papers-container">
    <a href="../index.html" class="back-link">← Back to Home</a>

    <div class="papers-header">
      <h1>🏥 Biomedical & Health AI Research Papers</h1>
      <p>Daily curated feed from arXiv - Medical AI, Healthcare ML, Clinical Prediction</p>
      <p style="font-size: 0.9em; color: #FFB6C1;">Keywords: medical, healthcare, clinical, biomedical, diagnosis, patient, disease, health</p>
      <p style="font-size: 0.9em; color: #FFB6C1;">Automatically updated every 24 hours ⏰</p>
    </div>

    <div class="feed-meta">
      <p><strong>📊 Total Papers:</strong> ${data.totalPapers}</p>
      <p><strong>🆕 New Today:</strong> ${data.newPapers}</p>
      <p><strong>🕐 Last Updated:</strong> ${lastUpdatedDate} (UTC)</p>
      <p><strong>🔄 Update Frequency:</strong> Daily at 00:00 UTC</p>
    </div>
    <!-- Search Box -->
    <div class="search-container">
      <h3>🔍 Search Papers</h3>
      <div class="search-box">
        <input type="text" id="searchInput" class="search-input" 
               placeholder="Enter keywords (e.g., deep learning, diagnosis, cancer...)" 
               autocomplete="off">
        <button onclick="searchPapers()" class="search-btn">🔎 Search</button>
        <button onclick="clearSearch()" class="clear-btn">✖ Clear</button>
      </div>
      <div id="searchResultsInfo" class="search-results-info"></div>
    </div>

    <div id="noResults" class="no-results">
      <p>😔 No papers found matching your keywords.</p>
      <p>Try different search terms or <button onclick="clearSearch()" class="clear-btn">clear the search</button></p>
    </div>
    ${data.papers.length === 0 ? paperCards === '' ? 
      `<div class="empty-state">
        <p>📚 No papers loaded yet.</p>
        <p>Run the fetch script to populate the feed:</p>
        <code>npm run fetch-arxiv</code>
      </div>` : '' : ''}

    <div class="papers-grid">
      ${paperCards}
    </div>

    ${data.papers.length === 0 ? '' : `
      <div style="text-align: center; color: #ecf0f1; margin: 40px 0;">
        <p>Showing ${data.papers.length} most recent papers from cs.AI category</p>
        <p style="font-size: 0.9em; color: #bdc3c7;">
          💡 <strong>Tip:</strong> Click any paper title to read the abstract on arXiv or download the PDF.
        </p>
      </div>
    `}

    <a href="../" class="back-link" style="margin-top: 40px;">← Back to Home</a>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-container">
      <p>&copy; 2025 Coding Blog. Papers from <a href="https://arxiv.org" style="color: #FFB6C1;">arXiv</a>. 📚</p>
    </div>
  </footer>

  <script src="../js/nav-utils.js"></script>
  <script>
    // Search functionality for arXiv papers
    const searchInput = document.getElementById('searchInput');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    const noResults = document.getElementById('noResults');
    const papersGrid = document.querySelector('.papers-grid');
    const allPaperCards = document.querySelectorAll('.paper-card');
    
    // Store original HTML for each card
    const originalHTML = new Map();
    allPaperCards.forEach(card => {
      originalHTML.set(card, card.innerHTML);
    });

    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchPapers();
      }
    });

    function searchPapers() {
      const query = searchInput.value.trim().toLowerCase();
      
      if (!query) {
        clearSearch();
        return;
      }

      const keywords = query.split(/[\\s,]+/).filter(k => k.length > 0);
      let matchCount = 0;

      allPaperCards.forEach(card => {
        // Restore original HTML first
        card.innerHTML = originalHTML.get(card);
        
        const title = card.querySelector('.paper-title')?.textContent.toLowerCase() || '';
        const summary = card.querySelector('.paper-summary')?.textContent.toLowerCase() || '';
        const authors = card.querySelector('.paper-authors')?.textContent.toLowerCase() || '';
        const categories = card.querySelector('.paper-categories')?.textContent.toLowerCase() || '';
        
        const searchText = title + ' ' + summary + ' ' + authors + ' ' + categories;
        
        // Check if all keywords match
        const matches = keywords.every(keyword => searchText.includes(keyword));
        
        if (matches) {
          card.style.display = 'block';
          matchCount++;
          // Highlight matching keywords
          highlightKeywords(card, keywords);
        } else {
          card.style.display = 'none';
        }
      });

      // Update results info
      if (matchCount > 0) {
        searchResultsInfo.innerHTML = '🎯 Found <strong>' + matchCount + '</strong> paper' + (matchCount > 1 ? 's' : '') + ' matching: <em>' + keywords.join(', ') + '</em>';
        searchResultsInfo.classList.add('visible');
        noResults.classList.remove('visible');
        papersGrid.style.display = 'grid';
      } else {
        searchResultsInfo.classList.remove('visible');
        noResults.classList.add('visible');
        papersGrid.style.display = 'none';
      }
    }

    function highlightKeywords(card, keywords) {
      const titleEl = card.querySelector('.paper-title a');
      const summaryEl = card.querySelector('.paper-summary');
      
      keywords.forEach(keyword => {
        if (titleEl) {
          titleEl.innerHTML = highlightText(titleEl.innerHTML, keyword);
        }
        if (summaryEl) {
          summaryEl.innerHTML = highlightText(summaryEl.innerHTML, keyword);
        }
      });
    }

    function highlightText(text, keyword) {
      // Simple case-insensitive search and replace
      const lowerText = text.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      let result = '';
      let lastIndex = 0;
      let index = lowerText.indexOf(lowerKeyword);
      
      while (index !== -1) {
        result += text.substring(lastIndex, index);
        result += '<span class="highlight">' + text.substring(index, index + keyword.length) + '</span>';
        lastIndex = index + keyword.length;
        index = lowerText.indexOf(lowerKeyword, lastIndex);
      }
      result += text.substring(lastIndex);
      return result;
    }

    function clearSearch() {
      searchInput.value = '';
      searchResultsInfo.classList.remove('visible');
      noResults.classList.remove('visible');
      papersGrid.style.display = 'grid';
      
      // Restore all cards to original state
      allPaperCards.forEach(card => {
        card.innerHTML = originalHTML.get(card);
        card.style.display = 'block';
      });
    }
  </script>
</body>
</html>`;

  return html;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Generating arXiv Feed HTML...');

  try {
    // Load papers
    console.log('[1/3] Loading papers from JSON...');
    const data = loadPapers();
    console.log(`✓ Loaded ${data.papers.length} papers`);

    // Generate HTML
    console.log('[2/3] Generating HTML...');
    const html = generateHTML(data);
    console.log(`✓ Generated HTML (${html.length} bytes)`);

    // Write to file
    console.log('[3/3] Writing to file...');
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
    console.log(`✓ Wrote to ${OUTPUT_FILE}`);

    console.log('✅ Complete!');
    console.log(`   HTML file: ${OUTPUT_FILE}`);
    console.log(`   Papers displayed: ${data.papers.length}`);
    console.log(`   Last updated: ${data.lastUpdated}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
