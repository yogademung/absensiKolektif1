let userHotelId = null;
let userHotelName = '';

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
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            data.data.forEach(voucher => {
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
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${voucher.zoom_link ? `<a href="${voucher.zoom_link}" target="_blank" class="text-blue-600 hover:underline">Join Meeting</a>` : '-'}
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
    } catch (err) {
        console.error('Failed to load history:', err);
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
    const warningContent = document.getElementById('warningContent');
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

    // Handle Form Submit - Show Warning First
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';

        const staffName = document.getElementById('staffName').value;
        const hotelId = hotelSelect.value;
        const moduleId = moduleSelect.value;
        const scheduleId = scheduleSelect.value;

        try {
            const res = await fetch('/api/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    staff_name: staffName,
                    hotel_id: hotelId,
                    module_id: moduleId,
                    schedule_id: scheduleId
                })
            });

            const data = await res.json();

            if (data.success) {
                closeRegistrationModal();
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
    });
});
