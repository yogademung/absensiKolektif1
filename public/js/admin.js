const AdminApp = {
    // --- Authentication ---
    async login(email, password) {
        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                // Token is in cookie, but we can also store in localStorage if needed.
                // For this app, we rely on httpOnly cookie for security, but we might need to know if we are logged in.
                // We'll redirect to dashboard.
                window.location.href = '/admin/dashboard';
            } else {
                // Show error alert
                const errorAlert = document.getElementById('errorAlert');
                const errorMessage = document.getElementById('errorMessage');
                if (errorAlert && errorMessage) {
                    errorMessage.textContent = data.message || 'Email atau password salah';
                    errorAlert.classList.remove('hidden');
                }
            }
        } catch (err) {
            console.error(err);
            // Show error alert for network errors
            const errorAlert = document.getElementById('errorAlert');
            const errorMessage = document.getElementById('errorMessage');
            if (errorAlert && errorMessage) {
                errorMessage.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
                errorAlert.classList.remove('hidden');
            }
        }
    },

    async logout() {
        await fetch('/api/admin/auth/logout', { method: 'POST' });
        window.location.href = '/admin/login';
    },

    async checkAuth() {
        try {
            const res = await fetch('/api/admin/auth/me');
            if (res.status === 401) {
                window.location.href = '/admin/login';
            }
        } catch (err) {
            window.location.href = '/admin/login';
        }
    },

    // --- Hotels ---
    async initHotels() {
        const form = document.getElementById('addHotelForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('hotelName').value;
                const quota = document.getElementById('tokenQuota').value;
                await this.createHotel(name, quota);
            });
        }

        const editForm = document.getElementById('editHotelForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editHotelId').value;
                const name = document.getElementById('editHotelName').value;
                const quota = document.getElementById('editTokenQuota').value;
                await this.updateHotel(id, name, parseInt(quota));
            });
        }

        this.loadHotels();
    },

    async loadHotels() {
        const res = await fetch('/api/admin/hotels');
        const data = await res.json();
        const tbody = document.getElementById('hotelsTableBody');
        tbody.innerHTML = '';

        if (data.success) {
            data.data.forEach(hotel => {
                const remaining = hotel.token_quota - hotel.token_used;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${hotel.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${hotel.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${hotel.token_quota}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${hotel.token_used}</td>
                    <td class="px-6 py-4 whitespace-nowrap ${remaining <= 0 ? 'text-red-600 font-bold' : 'text-green-600'}">${remaining}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onclick="AdminApp.editHotel(${hotel.id}, '${hotel.name.replace(/'/g, "\\'")}', ${hotel.token_quota})" class="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onclick="AdminApp.deleteHotel(${hotel.id})" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    async createHotel(name, token_quota) {
        const res = await fetch('/api/admin/hotels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, token_quota })
        });
        if (res.ok) {
            document.getElementById('addHotelForm').reset();
            this.loadHotels();
        }
    },

    async deleteHotel(id) {
        if (confirm('Are you sure?')) {
            await fetch(`/api/admin/hotels/${id}`, { method: 'DELETE' });
            this.loadHotels();
        }
    },

    editHotel(id, name, tokenQuota) {
        document.getElementById('editHotelId').value = id;
        document.getElementById('editHotelName').value = name;
        document.getElementById('editTokenQuota').value = tokenQuota;
        document.getElementById('editHotelModal').classList.remove('hidden');
    },

    closeEditHotelModal() {
        document.getElementById('editHotelModal').classList.add('hidden');
        document.getElementById('editHotelForm').reset();
    },

    async updateHotel(id, name, token_quota) {
        const res = await fetch(`/api/admin/hotels/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, token_quota })
        });
        if (res.ok) {
            this.closeEditHotelModal();
            this.loadHotels();
        } else {
            alert('Failed to update hotel');
        }
    },

    // --- Modules ---
    async initModules() {
        const form = document.getElementById('addModuleForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('moduleName').value;
                const description = document.getElementById('moduleDesc').value;
                await this.createModule(name, description);
            });
        }

        const editForm = document.getElementById('editModuleForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editModuleId').value;
                const name = document.getElementById('editModuleName').value;
                const description = document.getElementById('editModuleDesc').value;
                await this.updateModule(id, name, description);
            });
        }

        this.loadModules();
    },

    async loadModules() {
        const res = await fetch('/api/admin/modules');
        const data = await res.json();
        const list = document.getElementById('modulesList');
        list.innerHTML = '';

        if (data.success) {
            data.data.forEach(mod => {
                const div = document.createElement('div');
                div.className = 'bg-white p-6 rounded-lg shadow';
                div.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-bold text-gray-900">${mod.name}</h3>
                        <button onclick="AdminApp.deleteModule(${mod.id})" class="text-red-500 hover:text-red-700">&times;</button>
                    </div>
                    <p class="text-gray-600 mb-4">${mod.description || 'No description'}</p>
                    <button onclick="AdminApp.editModule(${mod.id}, '${mod.name.replace(/'/g, "\\'")}', '${(mod.description || '').replace(/'/g, "\\'")}')" 
                        class="text-green-600 hover:text-green-900 font-medium">
                        Edit
                    </button>
                `;
                list.appendChild(div);
            });
        }
    },

    editModule(id, name, description) {
        document.getElementById('editModuleId').value = id;
        document.getElementById('editModuleName').value = name;
        document.getElementById('editModuleDesc').value = description || '';
        document.getElementById('editModuleModal').classList.remove('hidden');
    },

    closeEditModuleModal() {
        document.getElementById('editModuleModal').classList.add('hidden');
        document.getElementById('editModuleForm').reset();
    },

    async updateModule(id, name, description) {
        const res = await fetch(`/api/admin/modules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        if (res.ok) {
            this.closeEditModuleModal();
            this.loadModules();
        } else {
            alert('Failed to update module');
        }
    },
    async createModule(name, description) {
        const res = await fetch('/api/admin/modules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        if (res.ok) {
            document.getElementById('addModuleForm').reset();
            this.loadModules();
        }
    },

    async deleteModule(id) {
        if (confirm('Are you sure?')) {
            await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
            this.loadModules();
        }
    },

    // --- Schedules ---
    async initSchedules() {
        // Load modules for dropdown
        const res = await fetch('/api/admin/modules');
        const data = await res.json();
        const select = document.getElementById('scheduleModule');
        const editSelect = document.getElementById('editScheduleModule');
        const filter = document.getElementById('filterModule');

        if (data.success) {
            data.data.forEach(mod => {
                const option = `<option value="${mod.id}">${mod.name}</option>`;
                select.innerHTML += option;
                filter.innerHTML += option;
                if (editSelect) editSelect.innerHTML += option;
            });
        }

        const form = document.getElementById('addScheduleForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    module_id: document.getElementById('scheduleModule').value,
                    date: document.getElementById('scheduleDate').value,
                    session: document.getElementById('scheduleSession').value,
                    start_time: document.getElementById('startTime').value,
                    end_time: document.getElementById('endTime').value,
                    zoom_link: document.getElementById('zoomLink').value,
                    max_participants: 50 // Default
                };
                await this.createSchedule(payload);
            });
        }

        const editForm = document.getElementById('editScheduleForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editScheduleId').value;
                const payload = {
                    module_id: document.getElementById('editScheduleModule').value,
                    date: document.getElementById('editScheduleDate').value,
                    session: document.getElementById('editScheduleSession').value,
                    start_time: document.getElementById('editStartTime').value,
                    end_time: document.getElementById('editEndTime').value,
                    zoom_link: document.getElementById('editZoomLink').value,
                    max_participants: 50
                };
                await this.updateSchedule(id, payload);
            });
        }

        filter.addEventListener('change', () => this.loadSchedules(filter.value));
        this.loadSchedules();
    },

    async loadSchedules(moduleId = '') {
        let url = '/api/admin/schedules';
        if (moduleId) url += `?module_id=${moduleId}`;

        const res = await fetch(url);
        const data = await res.json();
        const tbody = document.getElementById('schedulesTableBody');
        tbody.innerHTML = '';

        if (data.success) {
            data.data.forEach(sch => {
                const date = new Date(sch.date).toLocaleDateString();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${sch.session}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${sch.module_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${sch.start_time} - ${sch.end_time}</td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate"><a href="${sch.zoom_link}" target="_blank" class="text-blue-600 hover:underline">${sch.zoom_link}</a></td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onclick="AdminApp.editSchedule(${sch.id}, ${sch.module_id}, '${sch.date}', '${sch.session}', '${sch.start_time}', '${sch.end_time}', '${sch.zoom_link.replace(/'/g, "\\'")}')"
                            class="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onclick="AdminApp.deleteSchedule(${sch.id})" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    async createSchedule(payload) {
        const res = await fetch('/api/admin/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            document.getElementById('addScheduleForm').reset();
            this.loadSchedules();
        } else {
            alert('Failed to create schedule');
        }
    },

    editSchedule(id, moduleId, date, session, startTime, endTime, zoomLink) {
        document.getElementById('editScheduleId').value = id;
        document.getElementById('editScheduleModule').value = moduleId;

        // Convert date to YYYY-MM-DD format for input type="date"
        const dateObj = new Date(date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        document.getElementById('editScheduleDate').value = formattedDate;

        document.getElementById('editScheduleSession').value = session;
        document.getElementById('editStartTime').value = startTime;
        document.getElementById('editEndTime').value = endTime;
        document.getElementById('editZoomLink').value = zoomLink;
        document.getElementById('editScheduleModal').classList.remove('hidden');
    },

    closeEditScheduleModal() {
        document.getElementById('editScheduleModal').classList.add('hidden');
        document.getElementById('editScheduleForm').reset();
    },

    async updateSchedule(id, payload) {
        const res = await fetch(`/api/admin/schedules/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            this.closeEditScheduleModal();
            this.loadSchedules();
        } else {
            alert('Failed to update schedule');
        }
    },

    async deleteSchedule(id) {
        if (confirm('Are you sure?')) {
            await fetch(`/api/admin/schedules/${id}`, { method: 'DELETE' });
            this.loadSchedules();
        }
    },

    // --- Admins ---
    async initAdmins() {
        const form = document.getElementById('addAdminForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPassword').value;
                await this.createAdmin(email, password);
            });
        }
        this.loadAdmins();
    },

    async loadAdmins() {
        const res = await fetch('/api/admin/admins');
        const data = await res.json();
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '';

        if (data.success) {
            data.data.forEach(admin => {
                const createdAt = new Date(admin.created_at).toLocaleDateString();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${admin.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${admin.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${createdAt}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="AdminApp.deleteAdmin(${admin.id})" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    async createAdmin(email, password) {
        // Hide previous alerts
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        successAlert.classList.add('hidden');
        errorAlert.classList.add('hidden');

        const res = await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            document.getElementById('addAdminForm').reset();
            document.getElementById('successMessage').textContent = 'Admin created successfully!';
            successAlert.classList.remove('hidden');
            this.loadAdmins();

            // Hide success message after 3 seconds
            setTimeout(() => {
                successAlert.classList.add('hidden');
            }, 3000);
        } else {
            document.getElementById('errorMessage').textContent = data.message || 'Failed to create admin';
            errorAlert.classList.remove('hidden');
        }
    },

    async deleteAdmin(id) {
        if (confirm('Are you sure you want to delete this admin?')) {
            await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
            this.loadAdmins();
        }
    },

    // --- Reports ---
    toggleReportView() {
        const normalView = document.getElementById('normalView');
        const reportView = document.getElementById('reportView');

        if (reportView.classList.contains('hidden')) {
            normalView.classList.add('hidden');
            reportView.classList.remove('hidden');
            this.loadScheduleReports();
        } else {
            reportView.classList.add('hidden');
            normalView.classList.remove('hidden');
        }
    },

    async loadScheduleReports() {
        const res = await fetch('/api/admin/reports/schedules');
        const data = await res.json();
        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            data.data.forEach(schedule => {
                const date = new Date(schedule.date).toLocaleDateString();
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 cursor-pointer';
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium">${schedule.module_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${schedule.session}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            ${schedule.total_hotels || 0} hotels
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            ${schedule.total_registrations || 0} staff
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            ${schedule.tokens_used || 0} tokens
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button onclick="AdminApp.toggleScheduleDetails(${schedule.id}, this)" 
                            class="text-blue-600 hover:text-blue-900 font-medium">
                            View Details ▼
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);

                // Create detail row (hidden by default)
                const detailTr = document.createElement('tr');
                detailTr.id = `detail-${schedule.id}`;
                detailTr.className = 'hidden bg-gray-50';
                detailTr.innerHTML = `
                    <td colspan="7" class="px-6 py-4">
                        <div class="loading-${schedule.id}">
                            <p class="text-gray-500 text-center">Loading details...</p>
                        </div>
                        <div class="detail-content-${schedule.id} hidden"></div>
                    </td>
                `;
                tbody.appendChild(detailTr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No data available</td></tr>';
        }
    },

    async toggleScheduleDetails(scheduleId, button) {
        const detailRow = document.getElementById(`detail-${scheduleId}`);
        const loadingDiv = detailRow.querySelector(`.loading-${scheduleId}`);
        const contentDiv = detailRow.querySelector(`.detail-content-${scheduleId}`);

        if (detailRow.classList.contains('hidden')) {
            // Show details
            detailRow.classList.remove('hidden');
            button.textContent = 'Hide Details ▲';

            // Load data if not already loaded
            if (contentDiv.classList.contains('hidden')) {
                const res = await fetch(`/api/admin/reports/schedules/${scheduleId}`);
                const data = await res.json();

                loadingDiv.classList.add('hidden');
                contentDiv.classList.remove('hidden');

                if (data.success && data.data.length > 0) {
                    let html = '<div class="space-y-4">';

                    data.data.forEach(hotel => {
                        const firstReg = new Date(hotel.first_registration).toLocaleString();
                        const lastReg = new Date(hotel.last_registration).toLocaleString();

                        html += `
                            <div class="bg-white p-4 rounded-lg border border-gray-200">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 class="font-bold text-lg text-gray-800">${hotel.hotel_name}</h4>
                                        <p class="text-sm text-gray-500">Hotel ID: ${hotel.hotel_id}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-gray-600">
                                            <span class="font-semibold">${hotel.total_registrations}</span> registrations
                                        </div>
                                        <div class="text-sm text-gray-600">
                                            <span class="font-semibold">${hotel.unique_staff}</span> unique staff
                                        </div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span class="text-gray-600">First Registration:</span>
                                        <p class="font-medium">${firstReg}</p>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Last Registration:</span>
                                        <p class="font-medium">${lastReg}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    });

                    html += '</div>';
                    contentDiv.innerHTML = html;
                } else {
                    contentDiv.innerHTML = '<p class="text-gray-500 text-center py-4">No registrations found for this schedule</p>';
                }
            }
        } else {
            // Hide details
            detailRow.classList.add('hidden');
            button.textContent = 'View Details ▼';
        }
    }
};
