/*
 * Hexagon Timeline Loader
 * -- Automatically sorts and renders honeycomb items from JSON
 */

document.addEventListener('DOMContentLoaded', () => {
    initHexTooltips(); //starting immediately in case hex's don't load right away
    loadTimeline();
});

async function loadTimeline() {
    const container = document.querySelector('.hex-test');
    if (!container) return;

    try {
        // 1. Fetch the data
        const response = await fetch('data.json'); // Ensure path matches file structure
        let data = await response.json();

        // 2. Sort by date (Newest first)
        // ensures that even if items are added out of order in JSON, the timeline stays chronological
        data.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));

        // 3. Clear container and Build HTML
        container.innerHTML = '';

        data.forEach((item, index) => {
            // Alternate side based on index: Even index = Left, Odd index = Right
            const sideClass = (index % 2 === 0) ? 'hex-test__label--left' : 'hex-test__label--right';
            
            const hexHtml = `
                <div>
                    <a class="hex-test__hex-link" href="${item.hexHref}">
                        <div class="hex-test__inner">
                            <img src="${item.imgSrc}" class="${item.imgClass}" alt="${item.imgAlt}" loading="lazy" />
                        </div>
                    </a>
                    <div class="${sideClass}">
                        <a class="hex-test__text" href="${item.hexHref}" data-desc="${item.dataDesc}">
                            <span class="hex-test__year">
                                ${item.yearText}
                            </span>
                            <span class="hex-test__title">
                                <i class="${item.icon}"></i>
                                &nbsp;${item.title}
                            </span>
                        </a>
                        <span class="hex-test__line"></span>
                        <span class="hex-test__dot"></span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', hexHtml);
        });

        // 4. Initialize Tooltips AFTER elements are added to the DOM
        initHexTooltips();

    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying load... (${retries} attempts left)`);
            setTimeout(() => loadTimeline(retries - 1), 1000); // Wait 1 second and retry
        } else {
            console.error("Max retries reached. Loading failed:", error);
            container.innerHTML = "<p>Failed to load timeline. Please refresh.</p>";
        }
    }
}

/*
* Tooltip Logic: updated for dynamic content
*/
function initHexTooltips() {
    const tooltip = document.getElementById('hexTooltip');
    if (!tooltip) return;

    const triggers = document.querySelectorAll('.hex-test__text, .hex-test__hex-link, .hex-tooltip-trigger');

    triggers.forEach(trigger => {
        // Helper to find description if hovering the hex image instead of the text
        const getDescription = (el) => {
            if (el.getAttribute('data-desc')) return el.getAttribute('data-desc');
            const parent = el.closest('.hex-test > div');
            if (parent) {
                const textLink = parent.querySelector('.hex-test__text');
                return textLink ? textLink.getAttribute('data-desc') : '';
            }
            return '';
        };

        trigger.addEventListener('mouseenter', (e) => {
            const descText = getDescription(trigger);
            if (descText) {
                tooltip.textContent = descText;
                tooltip.classList.add('is-visible');
            }
        });

        trigger.addEventListener('mousemove', (e) => {
            if (!tooltip.classList.contains('is-visible')) return;
            
            const offset = 15;
            let x = e.clientX + offset;
            let y = e.clientY + offset;

            // Boundary Check: prevent going off-screen
            const tw = tooltip.offsetWidth;
            const th = tooltip.offsetHeight;
            if (x + tw > window.innerWidth - 10) x = e.clientX - tw - offset;
            if (y + th > window.innerHeight - 10) y = e.clientY - th - offset;

            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        trigger.addEventListener('mouseleave', () => {
            tooltip.classList.remove('is-visible');
        });
    });
}