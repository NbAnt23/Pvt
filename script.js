document.addEventListener('DOMContentLoaded', function() {
    initNetworkBackground();

    if (document.getElementById('company-search')) {
        initCompanySearch();
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        initEmailPlaceholder();
    }
});

function initNetworkBackground() {
    const networkBackground = document.getElementById('networkBackground');
    const particleCount = 50;
    const lineCount = 50;
    const particles = [];
    const maxDistance = 40;

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('network-particle');
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        networkBackground.appendChild(particle);
        particles.push({
            element: particle,
            x: parseFloat(particle.style.left),
            y: parseFloat(particle.style.top),
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2
        });
    }

    function createLine() {
        const line = document.createElement('div');
        line.classList.add('network-line');
        networkBackground.appendChild(line);
        return line;
    }

    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > 100) particle.vx *= -1;
            if (particle.y < 0 || particle.y > 100) particle.vy *= -1;

            particle.element.style.left = `${particle.x}%`;
            particle.element.style.top = `${particle.y}%`;
        });
    }

    function updateLines() {
        const lines = networkBackground.querySelectorAll('.network-line');
        lines.forEach((line, index) => {
            const p1 = particles[index % particles.length];
            const p2 = particles[(index + 1) % particles.length];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            line.style.width = `${distance}%`;
            line.style.left = `${p1.x}%`;
            line.style.top = `${p1.y}%`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.opacity = Math.max(0, 0.5 - distance / maxDistance);
        });
    }

    function animate() {
        updateParticles();
        updateLines();
        requestAnimationFrame(animate);
    }

    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
    for (let i = 0; i < lineCount; i++) {
        createLine();
    }

    animate();
}

function initCompanySearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('company-search');
    const companyList = document.getElementById('company-list');
    const searchResults = document.getElementById('search-results');

    let companies = [];

    async function loadCompanies() {
        try {
            const response = await fetch('companies.xlsx');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, {type: 'array'});
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const sheetData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            
            companies = sheetData.flat().filter(company => company && typeof company === 'string');

            console.log('Companies loaded:', companies.length);
            console.log('First few companies:', companies.slice(0, 5));
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    }

    loadCompanies();

    searchInput.addEventListener('input', function() {
        const inputValue = this.value.toLowerCase().trim();
        console.log('Search input:', inputValue);

        if (inputValue.length === 0) {
            companyList.innerHTML = '';
            companyList.style.display = 'none';
            return;
        }

        const filteredCompanies = companies.filter(company => 
            company.toLowerCase().startsWith(inputValue)
        );
        console.log('Filtered companies:', filteredCompanies.length);

        displayCompanyList(filteredCompanies, inputValue);
    });

    function displayCompanyList(filteredCompanies, inputValue) {
        companyList.innerHTML = '';
        if (filteredCompanies.length > 0) {
            filteredCompanies.slice(0, 10).forEach(company => {
                const li = document.createElement('li');
                const regex = new RegExp(`^(${inputValue})(.*)`, 'i');
                const [, highlight, rest] = company.match(regex);
                li.innerHTML = `<strong>${highlight}</strong>${rest}`;
                li.addEventListener('click', function() {
                    searchInput.value = company;
                    companyList.innerHTML = '';
                    companyList.style.display = 'none';
                    searchForm.dispatchEvent(new Event('submit'));
                });
                companyList.appendChild(li);
            });
            companyList.style.display = 'block';
        } else {
            companyList.style.display = 'none';
        }
        console.log('Dropdown updated with', filteredCompanies.length, 'companies');
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value;
        console.log('Search submitted:', searchTerm);
        searchResults.innerHTML = `
            <h3>Search Results for "${searchTerm}"</h3>
            <p>Displaying results for ${searchTerm}. In a real application, this would show actual company data.</p>
        `;
        companyList.innerHTML = '';
        companyList.style.display = 'none';
    });

    document.addEventListener('click', function(e) {
        if (!searchForm.contains(e.target)) {
            companyList.innerHTML = '';
            companyList.style.display = 'none';
        }
    });
}

function initEmailPlaceholder() {
    const emailInput = document.getElementById('email');
    const placeholderText = "Enter your email address...";
    let placeholderIndex = 0;

    function typePlaceholder() {
        if (placeholderIndex < placeholderText.length) {
            emailInput.setAttribute('placeholder', placeholderText.slice(0, placeholderIndex + 1));
            placeholderIndex++;
            setTimeout(typePlaceholder, 100);
        } else {
            setTimeout(resetPlaceholder, 2000);
        }
    }

    function resetPlaceholder() {
        placeholderIndex = 0;
        emailInput.setAttribute('placeholder', '');
        setTimeout(typePlaceholder, 500);
    }

    typePlaceholder();
}