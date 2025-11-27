const ReportsApp = {
    allLogs: [],

    async init() {
        await this.loadFilters();
        await this.loadTokenLogs();
        this.setupEventListeners();
    },

    async loadFilters() {
        // Load hotels for filter
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

        // Load modules for filter
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
    },

    async loadTokenLogs() {
        const res = await fetch('/api/admin/reports/token-logs');
        const data = await res.json();

        if (data.success) {
            this.allLogs = data.data;
            this.renderLogs(this.allLogs);
            this.updateStats(this.allLogs);
        }
    },

    renderLogs(logs) {
        const tbody = document.getElementById('logsTableBody');
        tbody.innerHTML = '';

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No logs found</td></tr>';
            return;
        }

        logs.forEach(log => {
            const dateTime = new Date(log.created_at).toLocaleString();
            const scheduleDate = log.schedule_date ? new Date(log.schedule_date).toLocaleDateString() : '-';
            const isFirstReg = log.token_change === -1;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm">${dateTime}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">${log.hotel_name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.staff_name || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.module_name || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${log.schedule_date ? `${scheduleDate} - ${log.session}` : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 rounded-full text-sm font-medium ${log.token_change < 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }">
                        ${log.token_change}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${isFirstReg
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }">
                        ${isFirstReg ? 'First' : 'Additional'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    updateStats(logs) {
        const totalRegistrations = logs.length;
        const tokensDeducted = logs.reduce((sum, log) => sum + Math.abs(log.token_change), 0);
        const firstRegistrations = logs.filter(log => log.token_change === -1).length;
        const additionalRegistrations = logs.filter(log => log.token_change === 0).length;

        document.getElementById('totalRegistrations').textContent = totalRegistrations;
        document.getElementById('tokensDeducted').textContent = tokensDeducted;
        document.getElementById('firstRegistrations').textContent = firstRegistrations;
        document.getElementById('additionalRegistrations').textContent = additionalRegistrations;
    },

    setupEventListeners() {
        const filterHotel = document.getElementById('filterHotel');
        const filterModule = document.getElementById('filterModule');
        const filterType = document.getElementById('filterType');

        const applyFilters = () => {
            let filtered = this.allLogs;

            // Filter by hotel
            if (filterHotel.value) {
                filtered = filtered.filter(log => log.hotel_id == filterHotel.value);
            }

            // Filter by module
            if (filterModule.value) {
                filtered = filtered.filter(log => log.module_id == filterModule.value);
            }

            // Filter by type
            if (filterType.value === 'first') {
                filtered = filtered.filter(log => log.token_change === -1);
            } else if (filterType.value === 'additional') {
                filtered = filtered.filter(log => log.token_change === 0);
            }

            this.renderLogs(filtered);
            this.updateStats(filtered);
        };

        filterHotel.addEventListener('change', applyFilters);
        filterModule.addEventListener('change', applyFilters);
        filterType.addEventListener('change', applyFilters);
    },

    printReport() {
        // Get the table element
        const table = document.querySelector('.min-w-full');
        const tbody = document.getElementById('logsTableBody');

        if (!tbody || tbody.rows.length === 0) {
            alert('No data to print');
            return;
        }

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Get current filter values for the title
        const filterHotel = document.getElementById('filterHotel');
        const filterModule = document.getElementById('filterModule');
        const filterType = document.getElementById('filterType');

        const hotelText = filterHotel.options[filterHotel.selectedIndex]?.text || 'All Hotels';
        const moduleText = filterModule.options[filterModule.selectedIndex]?.text || 'All Modules';
        const typeText = filterType.options[filterType.selectedIndex]?.text || 'All Types';

        // Build the print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Schedule Reports - Print</title>
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
                    .filters {
                        text-align: center;
                        color: #6b7280;
                        margin-bottom: 20px;
                        font-size: 14px;
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
                <h1>Token Usage & Registration Logs</h1>
                <div class="filters">
                    Hotel: ${hotelText} | Module: ${moduleText} | Type: ${typeText}
                </div>
                <table>
                    <thead>
                        ${table.querySelector('thead').innerHTML}
                    </thead>
                    <tbody>
                        ${tbody.innerHTML}
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
    },

    exportToCSV() {
        // Get current filtered logs from the table
        const tbody = document.getElementById('logsTableBody');
        const rows = tbody.querySelectorAll('tr');

        if (rows.length === 0 || (rows.length === 1 && rows[0].cells.length === 1)) {
            alert('No data to export');
            return;
        }

        // CSV Headers with semicolon delimiter
        let csv = 'sep=;\nDate & Time;Hotel;Staff Name;Module;Schedule;Token Change;Type\n';

        // Add data rows
        rows.forEach(row => {
            if (row.cells.length > 1) { // Skip "no data" rows
                const cells = row.cells;
                const rowData = [];

                for (let i = 0; i < cells.length; i++) {
                    let cellText = cells[i].textContent.trim();
                    // Remove extra whitespace and newlines
                    cellText = cellText.replace(/\s+/g, ' ');
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

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `schedule_reports_${timestamp}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

