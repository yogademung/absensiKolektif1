const AuditLogsApp = {
    allLogs: [],

    async init() {
        await this.loadFilters();
        await this.loadAuditLogs();
        this.setupEventListeners();
    },

    async loadFilters() {
        // Load admins for filter
        const adminsRes = await fetch('/api/admin/admins');
        const adminsData = await adminsRes.json();
        const adminSelect = document.getElementById('filterAdmin');

        if (adminsData.success) {
            adminsData.data.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.id;
                option.textContent = admin.email;
                adminSelect.appendChild(option);
            });
        }
    },

    async loadAuditLogs() {
        const res = await fetch('/api/admin/audit-logs');
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
            const adminEmail = log.admin_email || 'User Action';

            // Format action badge
            let actionClass = 'bg-gray-100 text-gray-800';
            if (log.action === 'CREATE') actionClass = 'bg-green-100 text-green-800';
            else if (log.action === 'UPDATE') actionClass = 'bg-yellow-100 text-yellow-800';
            else if (log.action === 'DELETE') actionClass = 'bg-red-100 text-red-800';
            else if (log.action === 'GENERATE_VOUCHER') actionClass = 'bg-blue-100 text-blue-800';
            else if (log.action === 'LOGIN') actionClass = 'bg-purple-100 text-purple-800';

            // Format details (old/new values)
            let details = '';
            if (log.action === 'CREATE' && log.new_values) {
                const newVals = JSON.parse(log.new_values);
                details = this.formatValues(newVals, 'Created');
            } else if (log.action === 'UPDATE') {
                const oldVals = log.old_values ? JSON.parse(log.old_values) : {};
                const newVals = log.new_values ? JSON.parse(log.new_values) : {};
                details = this.formatUpdateValues(oldVals, newVals);
            } else if (log.action === 'DELETE' && log.old_values) {
                const oldVals = JSON.parse(log.old_values);
                details = this.formatValues(oldVals, 'Deleted');
            } else if (log.action === 'GENERATE_VOUCHER' && log.new_values) {
                const newVals = JSON.parse(log.new_values);
                details = this.formatValues(newVals, 'Generated');
            } else if (log.action === 'LOGIN' && log.new_values) {
                const newVals = JSON.parse(log.new_values);
                details = this.formatValues(newVals, 'User Info');
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50';
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm">${dateTime}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${adminEmail}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${actionClass}">
                        ${log.action}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm capitalize">${log.entity_type || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${log.entity_id || '-'}</td>
                <td class="px-6 py-4 text-sm">
                    <div class="json-view">${details}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${log.ip_address || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    formatValues(values, prefix = '') {
        if (!values || Object.keys(values).length === 0) return '-';

        let html = prefix ? `<strong>${prefix}:</strong><br>` : '';
        Object.entries(values).forEach(([key, value]) => {
            html += `${key}: ${value}<br>`;
        });
        return html;
    },

    formatUpdateValues(oldVals, newVals) {
        let html = '<strong>Changes:</strong><br>';
        const allKeys = new Set([...Object.keys(oldVals), ...Object.keys(newVals)]);

        allKeys.forEach(key => {
            if (oldVals[key] !== newVals[key]) {
                html += `${key}: ${oldVals[key] || 'null'} → ${newVals[key] || 'null'}<br>`;
            }
        });

        return html;
    },

    updateStats(logs) {
        const totalLogs = logs.length;
        const createActions = logs.filter(log => log.action === 'CREATE').length;
        const updateActions = logs.filter(log => log.action === 'UPDATE').length;
        const deleteActions = logs.filter(log => log.action === 'DELETE').length;
        const loginActions = logs.filter(log => log.action === 'LOGIN').length;

        document.getElementById('totalLogs').textContent = totalLogs;
        document.getElementById('createActions').textContent = createActions;
        document.getElementById('updateActions').textContent = updateActions;
        document.getElementById('deleteActions').textContent = deleteActions;

        // If we want to show login stats, we might need a new card or just include it in total
        // For now, let's just make sure it's counted in totalLogs (which it is)
    },

    setupEventListeners() {
        const filterAction = document.getElementById('filterAction');
        const filterEntityType = document.getElementById('filterEntityType');
        const filterAdmin = document.getElementById('filterAdmin');
        const filterDateFrom = document.getElementById('filterDateFrom');
        const filterDateTo = document.getElementById('filterDateTo');

        const applyFilters = () => {
            let filtered = this.allLogs;

            // Filter by action
            if (filterAction.value) {
                filtered = filtered.filter(log => log.action === filterAction.value);
            }

            // Filter by entity type
            if (filterEntityType.value) {
                filtered = filtered.filter(log => log.entity_type === filterEntityType.value);
            }

            // Filter by admin
            if (filterAdmin.value) {
                filtered = filtered.filter(log => log.admin_id == filterAdmin.value);
            }

            // Filter by date range
            if (filterDateFrom.value) {
                const fromDate = new Date(filterDateFrom.value);
                fromDate.setHours(0, 0, 0, 0);
                filtered = filtered.filter(log => new Date(log.created_at) >= fromDate);
            }

            if (filterDateTo.value) {
                const toDate = new Date(filterDateTo.value);
                toDate.setHours(23, 59, 59, 999);
                filtered = filtered.filter(log => new Date(log.created_at) <= toDate);
            }

            this.renderLogs(filtered);
            this.updateStats(filtered);
        };

        filterAction.addEventListener('change', applyFilters);
        filterEntityType.addEventListener('change', applyFilters);
        filterAdmin.addEventListener('change', applyFilters);
        filterDateFrom.addEventListener('change', applyFilters);
        filterDateTo.addEventListener('change', applyFilters);
    },

    printLogs() {
        // Get the table element
        const table = document.querySelector('.min-w-full');
        const tbody = document.getElementById('logsTableBody');

        if (!tbody || tbody.rows.length === 0) {
            alert('No logs to print');
            return;
        }

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Get current filter values for the title
        const filterAction = document.getElementById('filterAction');
        const filterEntityType = document.getElementById('filterEntityType');
        const filterAdmin = document.getElementById('filterAdmin');

        const actionText = filterAction.options[filterAction.selectedIndex]?.text || 'All Actions';
        const entityText = filterEntityType.options[filterEntityType.selectedIndex]?.text || 'All Types';
        const adminText = filterAdmin.options[filterAdmin.selectedIndex]?.text || 'All Admins';

        // Build the print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Logs - Print</title>
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
                <h1>System Audit Logs</h1>
                <div class="filters">
                    Action: ${actionText} | Entity: ${entityText} | Admin: ${adminText}
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
        let csv = 'sep=;\nDate & Time;Admin;Action;Entity Type;Entity ID;Details;IP Address\n';

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

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `audit_logs_${timestamp}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
