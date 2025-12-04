// Token Report Data
let allTokenData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Chart instances
let hotelChart = null;
let sessionChart = null;
let timelineChart = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadFilters();
    await loadTokenData();
});

// Load filter options
async function loadFilters() {
    try {
        // Load modules
        const modulesRes = await fetch('/api/admin/modules');
        const modulesData = await modulesRes.json();
        const moduleSelect = document.getElementById('filterModule');

        if (modulesData.success) {
            modulesData.data.forEach(module => {
                const option = document.createElement('option');
                option.value = module.id;
                option.textContent = module.name;
                moduleSelect.appendChild(option);
            });
        }

        // Load schedules
        const schedulesRes = await fetch('/api/admin/schedules');
        const schedulesData = await schedulesRes.json();
        const scheduleSelect = document.getElementById('filterSchedule');

        if (schedulesData.success) {
            schedulesData.data.forEach(schedule => {
                const option = document.createElement('option');
                option.value = schedule.id;
                const date = new Date(schedule.date).toLocaleDateString();
                option.textContent = `${schedule.module_name} - ${date} (${schedule.session})`;
                scheduleSelect.appendChild(option);
            });

            // Load unique sessions from schedules
            const uniqueSessions = [...new Set(schedulesData.data.map(s => s.session))].filter(Boolean);
            const sessionSelect = document.getElementById('filterSession');
            uniqueSessions.forEach(session => {
                const option = document.createElement('option');
                option.value = session;
                option.textContent = session;
                sessionSelect.appendChild(option);
            });
        }

        // Load hotels
        const hotelsRes = await fetch('/api/admin/hotels');
        const hotelsData = await hotelsRes.json();
        const hotelSelect = document.getElementById('filterHotel');

        if (hotelsData.success) {
            hotelsData.data.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.id;
                option.textContent = hotel.name;
                hotelSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

// Load token data
async function loadTokenData() {
    try {
        const res = await fetch('/api/admin/reports/token-logs');
        const data = await res.json();

        if (data.success) {
            allTokenData = data.data;
            filteredData = [...allTokenData];
            updateSummaryCards();
            renderTable();
            renderCharts();
        }
    } catch (error) {
        console.error('Error loading token data:', error);
    }
}

// Apply filters
function applyFilters() {
    const moduleId = document.getElementById('filterModule').value;
    const scheduleId = document.getElementById('filterSchedule').value;
    const session = document.getElementById('filterSession').value;
    const hotelId = document.getElementById('filterHotel').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;

    filteredData = allTokenData.filter(item => {
        // Module filter
        if (moduleId && item.module_id != moduleId) return false;

        // Schedule filter
        if (scheduleId && item.schedule_id != scheduleId) return false;

        // Session filter
        if (session && item.session !== session) return false;

        // Hotel filter
        if (hotelId && item.hotel_id != hotelId) return false;

        // Date period filter
        if (dateFrom || dateTo) {
            const itemDate = new Date(item.created_at || item.date);
            itemDate.setHours(0, 0, 0, 0);

            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                fromDate.setHours(0, 0, 0, 0);
                if (itemDate < fromDate) return false;
            }

            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (itemDate > toDate) return false;
            }
        }

        return true;
    });

    currentPage = 1;
    updateSummaryCards();
    renderTable();
    renderCharts();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterModule').value = '';
    document.getElementById('filterSchedule').value = '';
    document.getElementById('filterSession').value = '';
    document.getElementById('filterHotel').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    applyFilters();
}

// Update summary cards
function updateSummaryCards() {
    const totalTokens = filteredData.reduce((sum, item) => sum + (item.token_cost || 0), 0);
    const totalParticipants = filteredData.length;
    const uniqueHotels = new Set(filteredData.map(item => item.hotel_id)).size;
    const avgTokens = totalParticipants > 0 ? (totalTokens / totalParticipants).toFixed(2) : 0;

    document.getElementById('totalTokens').textContent = totalTokens;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('totalHotels').textContent = uniqueHotels;
    document.getElementById('avgTokens').textContent = avgTokens;
}

// Render table with pagination
function renderTable() {
    const tbody = document.getElementById('tokenTableBody');
    tbody.innerHTML = '';

    const totalRecords = filteredData.length;
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);

    // Update pagination info
    document.getElementById('showingStart').textContent = totalRecords > 0 ? startIndex + 1 : 0;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalRecords').textContent = totalRecords;

    // Render current page data
    const pageData = filteredData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No data available</td></tr>';
    } else {
        pageData.forEach(item => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm">${new Date(item.created_at || item.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${item.module_name || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${item.session || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${item.hotel_name || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${item.staff_name || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold ${item.token_cost > 0 ? 'text-red-600' : 'text-gray-500'}">${item.token_cost || 0}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Render pagination controls
    renderPaginationControls(totalPages);
}

// Render pagination controls
function renderPaginationControls(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    // Show max 5 page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 rounded-md ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        btn.onclick = () => goToPage(i);
        pageNumbers.appendChild(btn);
    }

    // Enable/disable prev/next buttons
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function goToPage(page) {
    currentPage = page;
    renderTable();
}

// Render charts
function renderCharts() {
    renderHotelChart();
    renderSessionChart();
    renderTimelineChart();
}

// Bar Chart: Tokens by Hotel
function renderHotelChart() {
    const ctx = document.getElementById('hotelChart').getContext('2d');

    // Aggregate data by hotel
    const hotelData = {};
    filteredData.forEach(item => {
        const hotel = item.hotel_name || 'Unknown';
        hotelData[hotel] = (hotelData[hotel] || 0) + (item.token_cost || 0);
    });

    const labels = Object.keys(hotelData);
    const data = Object.values(hotelData);

    if (hotelChart) hotelChart.destroy();

    hotelChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tokens Used',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Pie Chart: Tokens by Session
function renderSessionChart() {
    const ctx = document.getElementById('sessionChart').getContext('2d');

    // Aggregate data by session
    const sessionData = {};
    filteredData.forEach(item => {
        const session = item.session || 'Unknown';
        sessionData[session] = (sessionData[session] || 0) + (item.token_cost || 0);
    });

    const labels = Object.keys(sessionData);
    const data = Object.values(sessionData);

    if (sessionChart) sessionChart.destroy();

    sessionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Line Chart: Token Usage Over Time
function renderTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');

    // Aggregate data by date
    const dateData = {};
    filteredData.forEach(item => {
        const date = new Date(item.created_at || item.date).toLocaleDateString();
        dateData[date] = (dateData[date] || 0) + (item.token_cost || 0);
    });

    // Sort by date
    const sortedDates = Object.keys(dateData).sort((a, b) => new Date(a) - new Date(b));
    const labels = sortedDates;
    const data = sortedDates.map(date => dateData[date]);

    if (timelineChart) timelineChart.destroy();

    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tokens Used',
                data: data,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Print to PDF
function printReport() {
    window.print();
}

// Export to CSV
function exportToCSV() {
    if (filteredData.length === 0) {
        alert('No data to export');
        return;
    }

    // CSV Headers
    let csv = 'sep=;\\nDate;Schedule;Session;Hotel;Staff Name;Tokens Used\\n';

    // Add data rows
    filteredData.forEach(item => {
        const date = new Date(item.created_at || item.date).toLocaleDateString();
        const schedule = (item.module_name || '-').replace(/;/g, ',');
        const session = (item.session || '-').replace(/;/g, ',');
        const hotel = (item.hotel_name || '-').replace(/;/g, ',');
        const staff = (item.staff_name || '-').replace(/;/g, ',');
        const tokens = item.token_cost || 0;

        csv += `${date};${schedule};${session};${hotel};${staff};${tokens}\\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `token_usage_report_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
