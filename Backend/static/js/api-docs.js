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

async function loadSection(sectionId, linkElement) {
    if (!sections[sectionId]) {
        console.error('Section not found:', sectionId);
        return;
    }

    // Update sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        link.classList.add('text-neutral-600');
        link.classList.remove('text-primary');
    });
    
    if (linkElement) {
        linkElement.classList.add('active');
        linkElement.classList.remove('text-neutral-600');
        linkElement.classList.add('text-primary');
    }

    // Show loading
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="loading"><p class="text-neutral-600">Loading...</p></div>';

    try {
        // Load section content
        const response = await fetch(sections[sectionId]);
        if (!response.ok) {
            throw new Error('Failed to load section');
        }
        const html = await response.text();
        contentArea.innerHTML = html;

        // Update TOC
        updateTOC(sectionId);
        currentSection = sectionId;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading section:', error);
        contentArea.innerHTML = `
            <div class="text-center py-12">
                <p class="text-neutral-600 mb-4">Failed to load section</p>
                <button onclick="loadSection('${sectionId}')" class="px-4 py-2 bg-primary text-background text-sm uppercase tracking-wider">
                    Retry
                </button>
            </div>
        `;
    }
}

function updateTOC(sectionId) {
    const tocNav = document.getElementById('toc-nav');
    const section = document.getElementById(sectionId);
    
    if (!section) {
        tocNav.innerHTML = '';
        return;
    }
    
    const headings = section.querySelectorAll('h2, h3');
    tocNav.innerHTML = '';
    
    if (headings.length === 0) {
        tocNav.innerHTML = '<p class="text-xs text-neutral-500">No headings</p>';
        return;
    }
    
    headings.forEach(heading => {
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
            // Update active TOC link
            document.querySelectorAll('.toc-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        };
        
        tocNav.appendChild(link);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSection('introduction');
    
    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (sections[hash]) {
            const link = document.querySelector(`a[href="#${hash}"]`);
            if (link) {
                loadSection(hash, link);
            }
        }
    });
});

