let userHotelId = null;
let userHotelName = '';
let allVouchersData = []; // Store all voucher data for filtering

// Modal controls
function openRegistrationModal() {
    document.getElementById('registrationModal').classList.remove('hidden');
}

function closeRegistrationModal() {
    document.getElementById('registrationModal').classList.add('hidden');
    document.getElementById('registrationForm').reset();
    document.getElementById('errorMessage').classList.add('hidden');
}

function logout() {
    fetch('/api/admin/auth/logout', { method: 'POST' })
        .then(() => {
            window.location.href = '/login';
        });
}

function printSchedule() {
    // Get the table element
    const table = document.querySelector('.min-w-full');
    const tbody = document.getElementById('historyTableBody');

    if (!tbody || tbody.rows.length === 0) {
        alert('No schedule data to print');
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Process table rows to extract actual URLs from links
    let tableRows = '';
    Array.from(tbody.rows).forEach(row => {
        let rowHtml = '<tr>';
        Array.from(row.cells).forEach((cell, index) => {
            // Check if this is the Zoom Link column (index 5) or Training Video column (index 6)
            if (index === 5 || index === 6) {
                const link = cell.querySelector('a');
                if (link && link.href) {
                    // Display the actual URL
                    rowHtml += `<td>${link.href}</td>`;
                } else {
                    // Display the text content if no link
                    rowHtml += `<td>${cell.textContent.trim()}</td>`;
                }
            } else {
                // For other columns, just use the text content
                rowHtml += `<td>${cell.textContent.trim()}</td>`;
            }
        });
        rowHtml += '</tr>';
        tableRows += rowHtml;
    });

    // Build the print content
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Schedule History - Print</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h1 {
                    text-align: center;
                    color: #1f2937;
                    margin-bottom: 10px;
                }
                .hotel-info {
                    text-align: center;
                    color: #2563eb;
                    font-weight: 600;
                    margin-bottom: 20px;
                    font-size: 16px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th {
                    background-color: #f9fafb;
                    border: 1px solid #e5e7eb;
                    padding: 12px 8px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }
                td {
                    border: 1px solid #e5e7eb;
                    padding: 10px 8px;
                    font-size: 13px;
                    color: #1f2937;
                    word-break: break-all;
                }
                tr:nth-child(even) {
                    background-color: #f9fafb;
                }
                .print-date {
                    text-align: right;
                    color: #6b7280;
                    font-size: 12px;
                    margin-top: 20px;
                }
                @media print {
                    body { margin: 10px; }
                }
            </style>
        </head>
        <body>
            <h1>Training Schedule History</h1>
            <div class="hotel-info">
                ${userHotelName || 'Hotel'}
            </div>
            <table>
                <thead>
                    ${table.querySelector('thead').innerHTML}
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div class="print-date">
                Printed on: ${new Date().toLocaleString()}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
}

function exportScheduleToCSV() {
    // Get schedule history data from the table
    const tbody = document.getElementById('historyTableBody');
    const rows = tbody.querySelectorAll('tr');

    if (rows.length === 0 || (rows.length === 1 && rows[0].cells.length === 1)) {
        alert('No schedule data to export');
        return;
    }

    // CSV Headers with semicolon delimiter
    let csv = 'sep=;\nDate;Module;Session;Time;Staff Name;Zoom Link;Training Video;Status;Token Cost\n';

    // Add data rows
    rows.forEach(row => {
        if (row.cells.length > 1) { // Skip "no data" rows
            const cells = row.cells;
            const rowData = [];

            for (let i = 0; i < cells.length; i++) {
                let cellText = cells[i].textContent.trim();
                // Remove extra whitespace and newlines
                cellText = cellText.replace(/\s+/g, ' ');

                // Handle links - extract URL if present
                const link = cells[i].querySelector('a');
                if (link) {
                    cellText = link.href;
                }

                // Escape quotes and wrap in quotes if contains semicolon
                if (cellText.includes(';') || cellText.includes('"')) {
                    cellText = '"' + cellText.replace(/"/g, '""') + '"';
                }
                rowData.push(cellText);
            }

            csv += rowData.join(';') + '\n';
        }
    });

    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with hotel name and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const hotelName = userHotelName.replace(/\s+/g, '_').toLowerCase();
    const filename = `schedule_${hotelName}_${timestamp}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper function to format Zoom link display
function formatZoomLink(zoomText) {
    if (!zoomText) return '-';

    // Extract URLs from the text using regex (works with any format)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = zoomText.match(urlRegex);
    const mainUrl = (urls && urls.length > 0) ? urls[0] : null;

    return `
        <div class="flex flex-row gap-3 py-2">
            ${mainUrl ? `
                <a href="${mainUrl}" target="_blank" class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join
                </a>
            ` : ''}
            
            <button onclick="copyZoomText(this)" data-zoom-text="${zoomText.replace(/"/g, '&quot;')}" class="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200 text-sm">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Info
            </button>
        </div>
    `;
}

// Function to copy Zoom text to clipboard
window.copyZoomText = function (button) {
    const zoomText = button.getAttribute('data-zoom-text');
    navigator.clipboard.writeText(zoomText).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
        `;
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
};



// Filter history by status
window.filterHistory = function (status) {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';

    // Update button styles
    const allBtn = document.getElementById('filterAll');
    const upcomingBtn = document.getElementById('filterUpcoming');
    const completedBtn = document.getElementById('filterCompleted');

    // Reset all buttons to inactive state
    const inactiveClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    const activeClass = 'bg-blue-600 text-white';

    allBtn.className = `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${inactiveClass}`;
    upcomingBtn.className = `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${inactiveClass}`;
    completedBtn.className = `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${inactiveClass}`;

    // Set active button
    if (status === 'all') {
        allBtn.className = `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeClass}`;
    } else if (status === 'upcoming') {
        upcomingBtn.className = `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeClass}`;
    } else if (status === 'completed') {
        completedBtn.className = `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeClass}`;
    }

    // Filter data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredData = allVouchersData;
    if (status === 'upcoming') {
        filteredData = allVouchersData.filter(voucher => {
            const scheduleDate = new Date(voucher.date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate >= today;
        });
    } else if (status === 'completed') {
        filteredData = allVouchersData.filter(voucher => {
            const scheduleDate = new Date(voucher.date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate < today;
        });
    }

    // Render filtered data
    if (filteredData.length > 0) {
        filteredData.forEach(voucher => {
            const scheduleDate = new Date(voucher.date);
            scheduleDate.setHours(0, 0, 0, 0);

            const isPast = scheduleDate < today;
            const statusClass = isPast ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800';
            const statusText = isPast ? 'Completed' : 'Upcoming';

            const tr = document.createElement('tr');
            tr.className = isPast ? 'bg-gray-50' : '';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm">${new Date(voucher.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${voucher.module_name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${voucher.session}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${voucher.start_time} - ${voucher.end_time}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${voucher.staff_name}</td>
                <td class="px-6 py-4 text-sm">
                    ${formatZoomLink(voucher.zoom_link)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${voucher.video_link ? `<a href="${voucher.video_link}" target="_blank" class="text-green-600 hover:underline">Watch Video</a>` : '<span class="text-gray-400">Not Available</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${voucher.token_cost > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}">
                    ${voucher.token_cost > 0 ? '-' + voucher.token_cost : '0'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No schedule history found</td></tr>';
    }
};

async function loadTokenInfo() {
    if (!userHotelId) return;

    try {
        const res = await fetch('/api/admin/hotels');
        const data = await res.json();
        if (data.success) {
            const hotel = data.data.find(h => h.id === userHotelId);
            if (hotel) {
                const remaining = hotel.token_quota - hotel.token_used;
                document.getElementById('remainingTokens').textContent = remaining;
                document.getElementById('hotelName').textContent = hotel.name;
                userHotelName = hotel.name;
            }
        }
    } catch (err) {
        console.error('Failed to load token info:', err);
    }
}

async function loadHistory() {
    if (!userHotelId) return;

    try {
        const res = await fetch(`/api/vouchers/history/${userHotelId}`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            // Store all data globally for filtering
            allVouchersData = data.data;
            // Render all data by default
            filterHistory('all');
        } else {
            allVouchersData = [];
            const tbody = document.getElementById('historyTableBody');
            tbody.innerHTML = '<tr><td colspan="9" class="px-6 py-4 text-center text-gray-500">No schedule history found</td></tr>';
        }
    } catch (err) {
        console.error('Failed to load history:', err);
    }
}

async function loadTokenExpiration() {
    try {
        // 1. Fetch maximum_expired value from others_information
        const infoRes = await fetch('/api/public/others-information?type=maximum_expired');
        const infoData = await infoRes.json();
        let maxExpiredDays = 90; // Default value

        if (infoData.success && infoData.data.length > 0) {
            maxExpiredDays = parseInt(infoData.data[0].detail) || 90;
        }

        // 2. Fetch all schedules to find the first one
        const schedRes = await fetch('/api/public/schedules');
        const schedData = await schedRes.json();

        if (schedData.success && schedData.data.length > 0) {
            // Sort schedules by date ascending to find the earliest
            const sortedSchedules = schedData.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            const firstScheduleDate = new Date(sortedSchedules[0].date);

            // 3. Calculate Expiration Date = First Schedule Date + maximum_expired days
            const expirationDate = new Date(firstScheduleDate);
            expirationDate.setDate(expirationDate.getDate() + maxExpiredDays);

            // 4. Display in Indonesian format
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('tokenExpiration').textContent = expirationDate.toLocaleDateString('id-ID', options);
        } else {
            document.getElementById('tokenExpiration').textContent = '-';
        }
    } catch (err) {
        console.error('Failed to load token expiration:', err);
        document.getElementById('tokenExpiration').textContent = '-';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const hotelSelect = document.getElementById('hotelSelect');
    const moduleSelect = document.getElementById('moduleSelect');
    const scheduleSelect = document.getElementById('scheduleSelect');
    const form = document.getElementById('registrationForm');
    const errorMessage = document.getElementById('errorMessage');

    // Check authentication and get user info
    try {
        const authRes = await fetch('/api/admin/auth/me');
        if (!authRes.ok) throw new Error('Not authenticated');
        const authData = await authRes.json();
        if (authData.success && authData.data.hotel_id) {
            userHotelId = authData.data.hotel_id;
        }
    } catch (e) {
        window.location.href = '/login';
        return;
    }

    // Load token info and history
    await loadTokenInfo();
    await loadHistory();
    await loadTokenExpiration();

    // Fetch Hotels
    fetch('/api/public/hotels')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                data.data.forEach(hotel => {
                    const option = document.createElement('option');
                    option.value = hotel.id;
                    option.textContent = `${hotel.name} (Quota: ${hotel.token_quota - hotel.token_used})`;

                    if (hotel.token_quota - hotel.token_used <= 0) {
                        option.disabled = true;
                        option.textContent += ' - FULL';
                    }
                    hotelSelect.appendChild(option);
                });

                if (userHotelId) {
                    hotelSelect.value = userHotelId;
                    hotelSelect.disabled = true;
                }
            }
        });

    // Fetch Modules
    fetch('/api/public/modules')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                data.data.forEach(mod => {
                    const option = document.createElement('option');
                    option.value = mod.id;
                    option.textContent = mod.name;
                    moduleSelect.appendChild(option);
                });
            }
        });

    // Handle Module Change -> Fetch Schedules
    moduleSelect.addEventListener('change', () => {
        const moduleId = moduleSelect.value;
        scheduleSelect.innerHTML = '<option value="">Select Schedule</option>';
        scheduleSelect.disabled = true;

        if (moduleId) {
            fetch(`/api/public/schedules?module_id=${moduleId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data.length > 0) {
                        scheduleSelect.disabled = false;
                        data.data.forEach(schedule => {
                            const option = document.createElement('option');
                            option.value = schedule.id;
                            // Format date/time nicely
                            const date = new Date(schedule.date).toLocaleDateString();
                            option.textContent = `${date} - ${schedule.session} (${schedule.start_time} - ${schedule.end_time})`;
                            scheduleSelect.appendChild(option);
                        });
                    } else {
                        const option = document.createElement('option');
                        option.textContent = 'No schedules available';
                        scheduleSelect.appendChild(option);
                    }
                });
        }
    });
    // Warning Modal Controls
    const warningModal = document.getElementById('warningModal');
    const warningCheckbox = document.getElementById('warningAgreeCheckbox');
    const warningApproveBtn = document.getElementById('warningApproveBtn');

    window.closeWarningModal = function () {
        warningModal.classList.add('hidden');
        warningCheckbox.checked = false;
        warningApproveBtn.disabled = true;
    };

    warningCheckbox.addEventListener('change', (e) => {
        warningApproveBtn.disabled = !e.target.checked;
    });

    // Store form data temporarily
    let pendingRegistration = null;

    // Handle Form Submit - Show Warning First
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        // Store form data
        pendingRegistration = {
            staffName: document.getElementById('staffName').value,
            hotelId: hotelSelect.value,
            moduleId: moduleSelect.value,
            scheduleId: scheduleSelect.value
        };

        // Show warning modal
        warningModal.classList.remove('hidden');
    });

    // Proceed with registration after approval
    window.proceedRegistration = async function () {
        if (!pendingRegistration) return;

        closeWarningModal();

        try {
            const res = await fetch('/api/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staff_name: pendingRegistration.staffName,
                    hotel_id: pendingRegistration.hotelId,
                    module_id: pendingRegistration.moduleId,
                    schedule_id: pendingRegistration.scheduleId
                })
            });

            const data = await res.json();

            if (data.success) {
                closeRegistrationModal();
                pendingRegistration = null;
                // Reload token info and history
                await loadTokenInfo();
                await loadHistory();
                // Redirect to success page
                window.location.href = `/success?voucherId=${data.data.voucherId}&remaining=${data.data.remainingTokens}`;
            } else {
                errorMessage.textContent = data.message || 'Registration failed';
                errorMessage.classList.remove('hidden');
            }
        } catch (err) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    };
});
