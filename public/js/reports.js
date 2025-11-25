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
    }
};
