#!/usr/bin/env node

/**
 * Fetch arXiv Papers - Daily scheduled script
 * Queries arXiv API for latest Biomedical & Health AI papers
 * Parses XML response and generates papers.json
 * 
 * Uses only Node.js built-in modules (no external dependencies)
 * Falls back to demo data if API is unreachable
 * 
 * Keywords: medical AI, healthcare ML, clinical prediction, biomedical
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration - Biomedical & Health AI keywords
const SEARCH_KEYWORDS = [
  'medical',
  'healthcare',
  'clinical',
  'biomedical',
  'diagnosis',
  'patient',
  'disease',
  'health'
];

// Build arXiv API query with keywords
// Search in title and abstract for biomedical AI papers
const KEYWORD_QUERY = SEARCH_KEYWORDS.map(k => `all:${k}`).join('+OR+');
const CATEGORY_QUERY = 'cat:cs.AI+OR+cat:cs.LG+OR+cat:q-bio.QM';
const ARXIV_API_URL = `https://export.arxiv.org/api/query?search_query=(${CATEGORY_QUERY})+AND+(${KEYWORD_QUERY})&start=0&max_results=15&sortBy=submittedDate&sortOrder=descending`;

const PAPERS_FILE = path.join(__dirname, '..', 'data', 'papers.json');
const CACHE_SIZE = 30;
const TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;
const MAX_REDIRECTS = 5;
const USE_DEMO_FALLBACK = process.env.USE_DEMO_FALLBACK === 'true';

/**
 * Demo papers for testing - Biomedical AI topics (used when API is unavailable)
 */
const DEMO_PAPERS = [
  {
    arxivId: "2502.12890",
    title: "Deep Learning for Medical Image Diagnosis: A Comprehensive Survey",
    authors: ["Alice Chen", "Bob Williams", "Carol Davis"],
    summary: "This paper provides a comprehensive review of deep learning methods for medical image analysis, including radiology, pathology, and dermatology applications with clinical validation studies.",
    published: "2025-02-15",
    publishedDate: { iso: "2025-02-15", year: 2025, month: 2, day: 15 },
    arxivUrl: "http://arxiv.org/abs/2502.12890v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12890v1",
    categories: ["cs.AI", "cs.CV", "q-bio.QM"],
    comments: "32 pages, 15 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12865",
    title: "Clinical Prediction Models Using Electronic Health Records and Machine Learning",
    authors: ["Eve Johnson", "Frank Miller"],
    summary: "We develop machine learning models for predicting patient outcomes using electronic health records, achieving high accuracy in early disease detection and risk stratification.",
    published: "2025-02-14",
    publishedDate: { iso: "2025-02-14", year: 2025, month: 2, day: 14 },
    arxivUrl: "http://arxiv.org/abs/2502.12865v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12865v1",
    categories: ["cs.AI", "cs.LG"],
    comments: "20 pages, 8 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12840",
    title: "AI-Powered Drug Discovery: From Molecular Design to Clinical Trials",
    authors: ["Grace Lee", "Henry Chen", "Iris Brown"],
    summary: "We investigate AI techniques for accelerating drug discovery, including molecular generation, binding affinity prediction, and clinical trial optimization.",
    published: "2025-02-13",
    publishedDate: { iso: "2025-02-13", year: 2025, month: 2, day: 13 },
    arxivUrl: "http://arxiv.org/abs/2502.12840v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12840v1",
    categories: ["cs.AI", "q-bio.BM"],
    comments: "24 pages, 12 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12815",
    title: "Natural Language Processing for Clinical Text: Extracting Insights from Medical Notes",
    authors: ["Jack Anderson"],
    summary: "This work presents NLP methods for extracting structured information from unstructured clinical notes, enabling better patient care and medical research.",
    published: "2025-02-12",
    publishedDate: { iso: "2025-02-12", year: 2025, month: 2, day: 12 },
    arxivUrl: "http://arxiv.org/abs/2502.12815v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12815v1",
    categories: ["cs.CL", "cs.AI"],
    comments: "18 pages",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12790",
    title: "Federated Learning for Healthcare: Privacy-Preserving Medical AI",
    authors: ["Karen Liu", "Leo Davis", "Mia Taylor"],
    summary: "We present federated learning approaches for training medical AI models across multiple hospitals while preserving patient privacy and data security.",
    published: "2025-02-11",
    publishedDate: { iso: "2025-02-11", year: 2025, month: 2, day: 11 },
    arxivUrl: "http://arxiv.org/abs/2502.12790v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12790v1",
    categories: ["cs.AI", "cs.CR", "cs.LG"],
    comments: "28 pages, 20 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12765",
    title: "Explainable AI in Medical Diagnosis: Building Trust in Clinical Decision Support",
    authors: ["Nina White", "Oscar Green"],
    summary: "A comprehensive study of interpretable machine learning methods for medical diagnosis, focusing on clinician trust and regulatory compliance.",
    published: "2025-02-10",
    publishedDate: { iso: "2025-02-10", year: 2025, month: 2, day: 10 },
    arxivUrl: "http://arxiv.org/abs/2502.12765v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12765v1",
    categories: ["cs.AI", "cs.LG"],
    comments: "35 pages, 18 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12740",
    title: "AI for Radiology: Automated Detection of Lung Diseases from CT Scans",
    authors: ["Paul Martin", "Quinn Roberts"],
    summary: "Deep learning methods for detecting lung diseases including COVID-19, pneumonia, and lung cancer from CT scans with radiologist-level accuracy.",
    published: "2025-02-09",
    publishedDate: { iso: "2025-02-09", year: 2025, month: 2, day: 9 },
    arxivUrl: "http://arxiv.org/abs/2502.12740v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12740v1",
    categories: ["cs.CV", "cs.AI"],
    comments: "42 pages",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12715",
    title: "Wearable Health Monitoring: Machine Learning for Continuous Patient Assessment",
    authors: ["Rachel Thompson", "Sam Wilson"],
    summary: "Novel algorithms for analyzing wearable sensor data to detect health anomalies and predict adverse events in real-time.",
    published: "2025-02-08",
    publishedDate: { iso: "2025-02-08", year: 2025, month: 2, day: 8 },
    arxivUrl: "http://arxiv.org/abs/2502.12715v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12715v1",
    categories: ["cs.AI", "cs.LG"],
    comments: "26 pages, 14 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12690",
    title: "Genomics and Deep Learning: Predicting Disease Risk from DNA Sequences",
    authors: ["Tom Hayes", "Uma Kumar"],
    summary: "A comprehensive guide to deep learning methods for genomic analysis, including variant calling, gene expression prediction, and disease risk assessment.",
    published: "2025-02-07",
    publishedDate: { iso: "2025-02-07", year: 2025, month: 2, day: 7 },
    arxivUrl: "http://arxiv.org/abs/2502.12690v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12690v1",
    categories: ["cs.AI", "q-bio.GN"],
    comments: "48 pages, 25 figures",
    arxivVersion: "v1"
  },
  {
    arxivId: "2502.12665",
    title: "Mental Health AI: Detecting Depression and Anxiety from Digital Biomarkers",
    authors: ["Vera Martinez", "Walt Anderson"],
    summary: "Methods for detecting mental health conditions from smartphone usage patterns, social media activity, and voice analysis using machine learning.",
    published: "2025-02-06",
    publishedDate: { iso: "2025-02-06", year: 2025, month: 2, day: 6 },
    arxivUrl: "http://arxiv.org/abs/2502.12665v1",
    pdfUrl: "http://arxiv.org/pdf/2502.12665v1",
    categories: ["cs.AI", "cs.HC"],
    comments: "30 pages, 16 figures",
    arxivVersion: "v1"
  }
];

/**
 * Simple XML parser (no external dependencies)
 */
class SimpleXMLParser {
  static parseEntries(xmlText) {
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xmlText)) !== null) {
      const entryText = match[1];
      const entry = {
        id: this.extractValue(entryText, 'id'),
        title: this.extractValue(entryText, 'title'),
        summary: this.extractValue(entryText, 'summary'),
        published: this.extractValue(entryText, 'published'),
        authors: this.extractAuthors(entryText),
        links: this.extractLinks(entryText),
        categories: this.extractCategories(entryText),
        comments: this.extractValue(entryText, 'arxiv:comment')
      };

      if (entry.id && entry.title && entry.authors.length > 0) {
        entries.push(entry);
      }
    }

    return entries;
  }

  static extractValue(text, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  static extractAuthors(text) {
    const authors = [];
    const authorRegex = /<author>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/author>/g;
    let match;
    while ((match = authorRegex.exec(text)) !== null) {
      authors.push(match[1].trim());
    }
    return authors;
  }

  static extractLinks(text) {
    const links = [];
    const linkRegex = /<link\s+([^>]*)>/g;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const attrs = match[1];
      const href = this.extractAttribute(attrs, 'href');
      const type = this.extractAttribute(attrs, 'type');
      if (href) links.push({ href, type });
    }
    return links;
  }

  static extractCategories(text) {
    const categories = [];
    const catRegex = /<category\s+([^>]*)>/g;
    let match;
    while ((match = catRegex.exec(text)) !== null) {
      const term = this.extractAttribute(match[1], 'term');
      if (term) categories.push(term);
    }
    return categories.length > 0 ? categories : ['cs.AI'];
  }

  static extractAttribute(attrText, name) {
    const regex = new RegExp(`${name}="([^"]*)"`, 'i');
    const match = attrText.match(regex);
    return match ? match[1] : '';
  }
}

/**
 * Fetch papers from arXiv API with retry logic
 */
async function fetchPapers(apiUrl = ARXIV_API_URL, retryCount = 0, redirectCount = 0, allowInsecureTLS = false) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`API request timeout after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    const transport = apiUrl.startsWith('https://') ? https : http;

    const requestOptions = {
      timeout: TIMEOUT_MS,
      headers: { 'User-Agent': 'BST236-arXiv-Feed/1.0' }
    };

    if (apiUrl.startsWith('https://') && allowInsecureTLS) {
      requestOptions.rejectUnauthorized = false;
    }

    transport.get(apiUrl, requestOptions, (res) => {
      clearTimeout(timeoutId);

      // Handle redirects
      if (res.statusCode >= 301 && res.statusCode <= 308 && res.headers.location) {
        console.log(`  [Redirect] ${res.statusCode}`);
        if (redirectCount >= MAX_REDIRECTS) {
          reject(new Error(`Too many redirects (${MAX_REDIRECTS})`));
          return;
        }
        const redirectUrl = new URL(res.headers.location, apiUrl).toString();
        fetchPapers(redirectUrl, retryCount, redirectCount + 1, allowInsecureTLS).then(resolve).catch(reject);
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 429 && retryCount < MAX_RETRIES) {
          console.log(`[Rate Limited] Waiting 60s...`);
          setTimeout(() => fetchPapers(apiUrl, retryCount + 1, 0, allowInsecureTLS).then(resolve).catch(reject), 60000);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);

      const isCertError = /certificate|CERT|self signed/i.test(err.message || '') || /CERT/i.test(err.code || '');
      if (isCertError && apiUrl.startsWith('https://') && !allowInsecureTLS) {
        console.warn('[Warning] TLS certificate validation failed. Retrying with insecure TLS for this public API call only...');
        fetchPapers(apiUrl, retryCount, redirectCount, true).then(resolve).catch(reject);
        return;
      }

      if (retryCount < MAX_RETRIES) {
        console.log(`[Network Error] Retrying in 5s...`);
        setTimeout(() => fetchPapers(apiUrl, retryCount + 1, 0, allowInsecureTLS).then(resolve).catch(reject), 5000);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Parse XML response from arXiv API
 */
async function parseXMLResponse(xmlData) {
  try {
    const entries = SimpleXMLParser.parseEntries(xmlData);
    const papers = entries.map((entry) => {
      try {
        const idMatch = entry.id.match(/\/(\d+\.\d+)/);
        const arxivId = idMatch ? idMatch[1] : null;
        if (!arxivId) return null;
        if (!entry.authors || entry.authors.length === 0) return null;

        const title = entry.title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        if (title.length < 5) return null;

        const summary = entry.summary.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500);
        const publishedDate = entry.published.split('T')[0];
        if (!publishedDate.match(/^\d{4}-\d{2}-\d{2}/)) return null;

        let pdfUrl = null;
        for (const link of entry.links) {
          if (link.type === 'application/pdf') {
            pdfUrl = link.href;
            break;
          }
        }
        if (!pdfUrl) pdfUrl = `http://arxiv.org/pdf/${arxivId}v1`;

        const arxivUrl = `http://arxiv.org/abs/${arxivId}v1`;

        return {
          arxivId,
          title,
          authors: entry.authors,
          summary,
          published: publishedDate,
          publishedDate: {
            iso: publishedDate,
            year: parseInt(publishedDate.split('-')[0]),
            month: parseInt(publishedDate.split('-')[1]),
            day: parseInt(publishedDate.split('-')[2])
          },
          arxivUrl,
          pdfUrl,
          categories: entry.categories,
          comments: entry.comments || '',
          arxivVersion: 'v1'
        };
      } catch (err) {
        return null;
      }
    });

    return papers.filter((p) => p !== null);
  } catch (error) {
    throw new Error(`XML Parse Error: ${error.message}`);
  }
}

/**
 * Load existing papers cache
 */
function loadExistingPapers() {
  try {
    if (fs.existsSync(PAPERS_FILE)) {
      const content = fs.readFileSync(PAPERS_FILE, 'utf8');
      const data = JSON.parse(content);
      return data.papers || [];
    }
  } catch (err) {
    // Silently ignore errors
  }
  return [];
}

/**
 * Merge new papers with existing cache
 */
function mergeWithCache(newPapers, existingPapers) {
  const existingIds = new Set(existingPapers.map((p) => p.arxivId));
  const filteredNew = newPapers.filter((p) => !existingIds.has(p.arxivId));
  const combined = [...filteredNew, ...existingPapers];
  combined.sort((a, b) => new Date(b.published) - new Date(a.published));
  return combined.slice(0, CACHE_SIZE);
}

/**
 * Save papers to JSON file
 */
async function savePapers(papers, newCount) {
  const outputData = {
    metadata: {
      version: '1.0',
      keywords: SEARCH_KEYWORDS,
      category: 'Biomedical AI',
      category_name: 'Biomedical & Health AI Research'
    },
    lastUpdated: new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    totalPapers: papers.length,
    newPapers: newCount,
    papers
  };

  const dir = path.dirname(PAPERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(PAPERS_FILE, JSON.stringify(outputData, null, 2));
  console.log(`✓ Saved ${papers.length} papers to ${PAPERS_FILE}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting arXiv Paper Fetch...');
  console.log(`📡 API: ${ARXIV_API_URL}`);

  try {
    let newPapers = [];
    
    try {
      console.log('[1/4] Fetching from arXiv API...');
      const xmlData = await fetchPapers(ARXIV_API_URL);
      console.log(`✓ Received ${xmlData.length} bytes`);
      
      console.log('[2/4] Parsing XML response...');
      newPapers = await parseXMLResponse(xmlData);
      console.log(`✓ Parsed ${newPapers.length} papers`);
    } catch (apiError) {
      console.warn(`[Warning] API fetch failed: ${apiError.message}`);
      if (USE_DEMO_FALLBACK) {
        console.log('[*] Using demo data fallback (USE_DEMO_FALLBACK=true)...');
        newPapers = DEMO_PAPERS;
      }
    }

    console.log('[3/4] Merging with cache...');
    const existingPapers = loadExistingPapers();
    console.log(`   Existing cache: ${existingPapers.length} papers`);

    if (newPapers.length === 0) {
      if (existingPapers.length === 0) {
        throw new Error('No fresh papers fetched and no cache available.');
      }
      console.warn('[Warning] No fresh papers fetched; keeping existing cache unchanged.');
      newPapers = existingPapers;
    }

    const mergedPapers = mergeWithCache(newPapers, existingPapers);
    const newCount = mergedPapers.filter(
      (p) => !existingPapers.some((ep) => ep.arxivId === p.arxivId)
    ).length;
    console.log(`✓ Merged: ${mergedPapers.length} total (${newCount} new)`);

    console.log('[4/4] Saving papers.json...');
    await savePapers(mergedPapers, newCount);

    console.log('✅ Complete!');
    console.log(`   Total papers: ${mergedPapers.length}`);
    console.log(`   New papers: ${newCount}`);
    console.log(`   Last updated: ${new Date().toISOString()}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
