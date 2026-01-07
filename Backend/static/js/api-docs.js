// API Documentation JavaScript

const sections = {
    'introduction': '/static/sections/introduction.html',
    'authentication': '/static/sections/authentication.html',
    'users': '/static/sections/users.html',
    'products': '/static/sections/products.html',
    'orders': '/static/sections/orders.html',
    'admin': '/static/sections/admin.html'
};

let currentSection = 'introduction';
let searchIndex = [];
let observer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    const hash = window.location.hash.substring(1);
    const startSection = sections[hash] ? hash : 'introduction';
    const link = document.querySelector(`a[href="#${startSection}"]`);
    loadSection(startSection, link);

    // Setup Components
    setupMobileSidebar();
    setupSearch();

    // Handle hash changes for direct linking
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.substring(1);
        if (sections[newHash]) {
            const link = document.querySelector(`a[href="#${newHash}"]`);
            loadSection(newHash, link);
        }
    });
});

async function loadSection(sectionId, linkElement) {
    if (!sections[sectionId]) return;

    // Update Sidebar Active State
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active', 'text-primary');
        link.classList.add('text-neutral-600');
    });
    
    if (linkElement) {
        linkElement.classList.add('active', 'text-primary');
        linkElement.classList.remove('text-neutral-600');
    } else {
        // Fallback if linkElement not passed (e.g. hash load)
        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active', 'text-primary');
            activeLink.classList.remove('text-neutral-600');
        }
    }

    // Close Mobile Sidebar if open
    closeMobileSidebar();

    const contentArea = document.getElementById('content-area');
    
    // Simple Loading State (Preserved from original)
    contentArea.innerHTML = '<div class="loading"><p class="text-neutral-600">Loading...</p></div>';

    try {
        const response = await fetch(sections[sectionId]);
        if (!response.ok) throw new Error('Failed to load section');
        
        const html = await response.text();
        contentArea.innerHTML = html;

        // Post-Load Enhancements
        updateTOC(sectionId);
        setupCopyButtons();
        setupScrollSpy();
        
        // Scroll to top
        document.getElementById('main-scroll-container').scrollTop = 0;
        currentSection = sectionId;

    } catch (error) {
        console.error('Error loading section:', error);
        contentArea.innerHTML = `
            <div class="text-center py-12">
                <p class="text-neutral-600 mb-4">Failed to load section</p>
                <button onclick="loadSection('${sectionId}')" class="px-4 py-2 bg-primary text-background text-sm uppercase tracking-wider">Retry</button>
            </div>
        `;
    }
}

// --- 1. Copy to Clipboard Feature ---
function setupCopyButtons() {
    const blocks = document.querySelectorAll('.code-block');
    blocks.forEach(block => {
        const pre = block.querySelector('pre');
        if (!pre) return;

        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.setAttribute('aria-label', 'Copy to clipboard');

        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(pre.textContent);
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                btn.textContent = 'Error';
            }
        });

        block.appendChild(btn);
    });
}

// --- 2. Global Search Feature ---
async function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const mainNav = document.getElementById('main-nav');

    // Pre-fetch all sections for indexing
    const promises = Object.entries(sections).map(async ([key, url]) => {
        try {
            const res = await fetch(url);
            const text = await res.text();
            
            // Create a temp div to parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // Index Headings
            const headings = doc.querySelectorAll('h1, h2, h3, h4');
            headings.forEach(h => {
                const id = h.id || h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                searchIndex.push({
                    sectionId: key,
                    anchorId: id,
                    title: h.textContent.trim(),
                    text: h.nextElementSibling ? h.nextElementSibling.textContent.slice(0, 100) : '',
                    type: 'heading'
                });
            });

            // Index Methods (Endpoints)
            const methods = doc.querySelectorAll('.endpoint-method');
            methods.forEach(m => {
                const code = m.nextElementSibling; // The <code> block usually follows
                if(code) {
                    searchIndex.push({
                        sectionId: key,
                        anchorId: null, // Usually close to a header, but we'll link to section
                        title: `${m.textContent} ${code.textContent}`,
                        text: 'Endpoint definition',
                        type: 'endpoint'
                    });
                }
            });

        } catch (e) {
            console.error('Indexing failed for', key);
        }
    });

    await Promise.all(promises);

    // Search Input Event
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        if (query.length < 2) {
            resultsContainer.classList.add('hidden');
            mainNav.classList.remove('hidden');
            return;
        }

        const results = searchIndex.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.text.toLowerCase().includes(query)
        );

        displaySearchResults(results, resultsContainer, mainNav);
    });
}

function displaySearchResults(results, container, nav) {
    nav.classList.add('hidden');
    container.classList.remove('hidden');
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<p class="text-sm text-neutral-500 p-4">No results found.</p>';
        return;
    }

    results.forEach(res => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.innerHTML = `
            <div class="text-sm font-medium text-primary">${res.title}</div>
            <div class="text-xs text-neutral-500 uppercase tracking-wide mt-1">${res.sectionId}</div>
        `;
        div.onclick = () => {
            // Clear Search
            document.getElementById('search-input').value = '';
            container.classList.add('hidden');
            nav.classList.remove('hidden');
            
            // Navigate
            loadSection(res.sectionId).then(() => {
                if(res.anchorId) {
                    const element = document.getElementById(res.anchorId);
                    if(element) element.scrollIntoView({behavior: 'smooth'});
                }
            });
        };
        container.appendChild(div);
    });
}

// --- 3. Mobile Sidebar Logic ---
function setupMobileSidebar() {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    function toggle() {
        const isClosed = sidebar.classList.contains('-translate-x-full');
        if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            backdrop.classList.remove('hidden');
            // small delay for opacity transition
            setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
        } else {
            closeMobileSidebar();
        }
    }

    btn.addEventListener('click', toggle);
    backdrop.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
}

// --- 4. Active Scroll Spy ---
function setupScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const headers = document.querySelectorAll('#content-area h2, #content-area h3');
    
    if (observer) observer.disconnect();

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                tocLinks.forEach(link => link.classList.remove('active'));
                
                // Add active to current
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.toc-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        root: document.getElementById('main-scroll-container'),
        threshold: 0.1,
        rootMargin: "-20% 0px -60% 0px" // Trigger when header is near top
    });

    headers.forEach(header => observer.observe(header));
}

function updateTOC(sectionId) {
    const tocNav = document.getElementById('toc-nav');
    const section = document.getElementById('content-area'); // Look in loaded content
    
    if (!section) return;
    
    const headings = section.querySelectorAll('h2, h3');
    tocNav.innerHTML = '';
    
    if (headings.length === 0) {
        tocNav.innerHTML = '<p class="text-xs text-neutral-500">No headings</p>';
        return;
    }
    
    headings.forEach(heading => {
        // Ensure ID exists
        const id = heading.id || heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        heading.id = id;
        
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent;
        link.className = heading.tagName === 'H2' 
            ? 'toc-link block text-sm mb-2' 
            : 'toc-link block text-sm ml-4 mb-1';
        
        link.onclick = (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        
        tocNav.appendChild(link);
    });
}