const AdminApp = {
    // --- Authentication ---
    async login(email, password) {
        // Deprecated: Use loginWithCaptcha instead
        await this.loginWithCaptcha(email, password, null, null);
    },

    async loginWithCaptcha(email, password, captchaId, captchaInput) {
        try {
            const body = { email, password };
            if (captchaId && captchaInput) {
                body.captchaId = captchaId;
                body.captchaInput = captchaInput;
            }

            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                // Token is in cookie, but we can also store in localStorage if needed.
                // For this app, we rely on httpOnly cookie for security, but we might need to know if we are logged in.

                const user = data.data.user;
                if (user && user.role === 'hotel_user') {
                    window.location.href = '/';
                } else {
                    window.location.href = '/admin/dashboard';
                }
            } else {
                // Show error alert
                const errorAlert = document.getElementById('errorAlert');
                const errorMessage = document.getElementById('errorMessage');
                if (errorAlert && errorMessage) {
                    errorMessage.textContent = data.message || 'Email atau password salah';
                    errorAlert.classList.remove('hidden');
                }

                // Refresh CAPTCHA on failure if function exists
                if (typeof refreshCaptcha === 'function') {
                    refreshCaptcha();
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
                const gdriveLink = document.getElementById('gdriveLink').value;
                const overhandleFormLink = document.getElementById('overhandleFormLink').value;
                await this.createHotel(name, quota, gdriveLink, overhandleFormLink);
            });
        }

        const editForm = document.getElementById('editHotelForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editHotelId').value;
                const name = document.getElementById('editHotelName').value;
                const quota = document.getElementById('editTokenQuota').value;
                const gdriveLink = document.getElementById('editGdriveLink').value;
                const overhandleFormLink = document.getElementById('editOverhandleFormLink').value;
                await this.updateHotel(id, name, parseInt(quota), gdriveLink, overhandleFormLink);
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
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${hotel.gdrive_link ? `<a href="${hotel.gdrive_link}" target="_blank" class="text-blue-600 hover:underline">View Link</a>` : '<span class="text-gray-400">-</span>'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${hotel.overhandle_form_link ? `<a href="${hotel.overhandle_form_link}" target="_blank" class="text-blue-600 hover:underline">View Form</a>` : '<span class="text-gray-400">-</span>'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onclick="AdminApp.editHotel(${hotel.id}, '${hotel.name.replace(/'/g, "\\'")}', ${hotel.token_quota}, '${(hotel.gdrive_link || '').replace(/'/g, "\\'")}', '${(hotel.overhandle_form_link || '').replace(/'/g, "\\'")}' )" class="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onclick="AdminApp.deleteHotel(${hotel.id})\" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    async createHotel(name, token_quota, gdrive_link, overhandle_form_link) {
        const res = await fetch('/api/admin/hotels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, token_quota, gdrive_link, overhandle_form_link })
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

    editHotel(id, name, tokenQuota, gdriveLink, overhandleFormLink) {
        document.getElementById('editHotelId').value = id;
        document.getElementById('editHotelName').value = name;
        document.getElementById('editTokenQuota').value = tokenQuota;
        document.getElementById('editGdriveLink').value = gdriveLink || '';
        document.getElementById('editOverhandleFormLink').value = overhandleFormLink || '';
        document.getElementById('editHotelModal').classList.remove('hidden');
    },

    closeEditHotelModal() {
        document.getElementById('editHotelModal').classList.add('hidden');
        document.getElementById('editHotelForm').reset();
    },

    async updateHotel(id, name, token_quota, gdrive_link, overhandle_form_link) {
        const res = await fetch(`/api/admin/hotels/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, token_quota, gdrive_link, overhandle_form_link })
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
                let configInfo = '';
                if (mod.usage_config) {
                    try {
                        const config = typeof mod.usage_config === 'string' ? JSON.parse(mod.usage_config) : mod.usage_config;
                        if (config) {
                            const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const dayNames = (config.days || []).map(d => daysMap[d]).join(', ');
                            const sessionNames = (config.sessions || []).map(s => s.name).join(', ') || 'No sessions';

                            configInfo = `
                                <div class="mt-3 pt-3 border-t border-gray-100 text-sm">
                                    <div class="flex items-center text-gray-600 mb-1">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <span>${dayNames || 'No days configured'}</span>
                                    </div>
                                    <div class="flex items-center text-gray-600">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span class="truncate" title="${sessionNames}">${sessionNames}</span>
                                    </div>
                                </div>
                            `;
                        }
                    } catch (e) { console.error('Error rendering card config', e); }
                }

                div.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-bold text-gray-900">${mod.name}</h3>
                        <button onclick="AdminApp.deleteModule(${mod.id})" class="text-red-500 hover:text-red-700">&times;</button>
                    </div>
                    <p class="text-gray-600 mb-4">${mod.description || 'No description'}</p>
                    ${configInfo}
                    <button onclick="AdminApp.editModule(${mod.id}, '${mod.name.replace(/'/g, "\\'")}', '${(mod.description || '').replace(/'/g, "\\'")}')" 
                        class="text-green-600 hover:text-green-900 font-medium mt-2">
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
                    video_link: document.getElementById('videoLink').value || null,
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
                    video_link: document.getElementById('editVideoLink').value || null,
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
                const videoStatus = sch.video_link ? `<a href="${sch.video_link}" target="_blank" class="text-green-600 hover:underline">✓ Available</a>` : '<span class="text-gray-400">-</span>';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${sch.session}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${sch.module_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${sch.start_time} - ${sch.end_time}</td>
                    <td class="px-6 py-4 whitespace-nowrap max-w-xs truncate"><a href="${sch.zoom_link}" target="_blank" class="text-blue-600 hover:underline">${sch.zoom_link}</a></td>
                    <td class="px-6 py-4 whitespace-nowrap">${videoStatus}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onclick="AdminApp.editSchedule(${sch.id}, ${sch.module_id}, '${sch.date}', '${sch.session}', '${sch.start_time}', '${sch.end_time}', '${sch.zoom_link.replace(/'/g, "\\'")}'${sch.video_link ? `, '${sch.video_link.replace(/'/g, "\\'")}` : ', null'})" class="text-blue-600 hover:text-blue-900">Edit</button>
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

    editSchedule(id, moduleId, date, session, startTime, endTime, zoomLink, videoLink = null) {
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
        document.getElementById('editVideoLink').value = videoLink || '';
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
        const roleSelect = document.getElementById('adminRole');
        const hotelSelectContainer = document.getElementById('hotelSelectContainer');
        const hotelSelect = document.getElementById('adminHotel');

        // Load hotels immediately so they're ready when needed
        await this.loadHotelsForDropdown(hotelSelect);

        if (roleSelect) {
            roleSelect.addEventListener('change', () => {
                if (roleSelect.value === 'hotel_user') {
                    hotelSelectContainer.classList.remove('hidden');
                } else {
                    hotelSelectContainer.classList.add('hidden');
                    hotelSelect.value = '';
                }
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPassword').value;
                const role = document.getElementById('adminRole').value;
                const hotelId = document.getElementById('adminHotel').value;

                await this.createAdmin(email, password, role, hotelId);
            });
        }
        this.loadAdmins();
    },

    async loadHotelsForDropdown(selectElement) {
        const res = await fetch('/api/admin/hotels');
        const data = await res.json();
        if (data.success) {
            data.data.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.id;
                option.textContent = hotel.name;
                selectElement.appendChild(option);
            });
        }
    },

    async loadAdmins() {
        const res = await fetch('/api/admin/admins');
        const data = await res.json();
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '';

        // Fetch hotels for mapping
        const hotelsRes = await fetch('/api/admin/hotels');
        const hotelsData = await hotelsRes.json();
        const hotelsMap = {};
        if (hotelsData.success) {
            hotelsData.data.forEach(hotel => {
                hotelsMap[hotel.id] = hotel.name;
            });
        }

        if (data.success) {
            data.data.forEach(admin => {
                const createdAt = new Date(admin.created_at).toLocaleDateString();
                const roleBadge = admin.role === 'hotel_user'
                    ? '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Hotel User</span>'
                    : '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Super Admin</span>';
                const hotelName = admin.hotel_id ? (hotelsMap[admin.hotel_id] || 'Unknown') : '-';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${admin.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${admin.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${roleBadge}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${hotelName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${createdAt}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="AdminApp.deleteAdmin(${admin.id})" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    async createAdmin(email, password, role, hotel_id) {
        // Hide previous alerts
        const successAlert = document.getElementById('successAlert');
        const errorAlert = document.getElementById('errorAlert');
        successAlert.classList.add('hidden');
        errorAlert.classList.add('hidden');

        // Validate hotel selection for hotel_user
        if (role === 'hotel_user' && !hotel_id) {
            document.getElementById('errorMessage').textContent = 'Please select a hotel for Hotel User role';
            errorAlert.classList.remove('hidden');
            return;
        }

        const payload = { email, password, role };
        if (role === 'hotel_user' && hotel_id) {
            payload.hotel_id = parseInt(hotel_id);
        }

        const res = await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
    },

    // --- Custom Modal Helpers ---
    showAlert(title, message, type = 'info') {
        const modal = document.getElementById('customAlert');
        const icon = document.getElementById('alertIcon');
        const titleEl = document.getElementById('alertTitle');
        const messageEl = document.getElementById('alertMessage');
        const okBtn = document.getElementById('alertOkBtn');

        titleEl.textContent = title;
        messageEl.textContent = message;

        // Set icon based on type
        let iconHTML = '';
        let iconClass = '';

        switch (type) {
            case 'success':
                iconClass = 'bg-green-100';
                iconHTML = `<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>`;
                break;
            case 'error':
                iconClass = 'bg-red-100';
                iconHTML = `<svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>`;
                break;
            case 'warning':
                iconClass = 'bg-yellow-100';
                iconHTML = `<svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>`;
                break;
            default:
                iconClass = 'bg-blue-100';
                iconHTML = `<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>`;
        }

        icon.className = `mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${iconClass}`;
        icon.innerHTML = iconHTML;

        modal.classList.remove('hidden');

        return new Promise((resolve) => {
            okBtn.onclick = () => {
                modal.classList.add('hidden');
                resolve(true);
            };
        });
    },

    showSuccess(message) {
        return this.showAlert('✅ Berhasil!', message, 'success');
    },

    showError(message) {
        return this.showAlert('❌ Error', message, 'error');
    },

    showWarning(message) {
        return this.showAlert('⚠️ Peringatan', message, 'warning');
    },

    showConfirm(title, message, details = '') {
        const modal = document.getElementById('customConfirm');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const detailsEl = document.getElementById('confirmDetails');
        const okBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');

        titleEl.textContent = title;
        messageEl.textContent = message;

        if (details) {
            detailsEl.innerHTML = details;
            detailsEl.classList.remove('hidden');
        } else {
            detailsEl.classList.add('hidden');
        }

        modal.classList.remove('hidden');

        return new Promise((resolve) => {
            okBtn.onclick = () => {
                modal.classList.add('hidden');
                resolve(true);
            };
            cancelBtn.onclick = () => {
                modal.classList.add('hidden');
                resolve(false);
            };
        });
    },

    // --- Hotel Schedules ---
    async initHotelSchedules() {
        // Initialize Select2 for hotels
        $('#hotelSelect').select2({
            placeholder: 'Search and select hotels...',
            allowClear: true,
            width: '100%'
        });

        // Initialize Select2 for schedules
        $('#scheduleSelect').select2({
            placeholder: 'Search and select schedules...',
            allowClear: true,
            width: '100%'
        });

        // Load hotels for multi-select
        await this.loadHotelsForMultiSelect();

        // Load schedules for manual mode
        await this.loadSchedulesForMultiSelect();

        // Load hotels for filter dropdown
        await this.loadHotelsForFilter();

        // Load current assignments
        await this.loadHotelSchedules();

        // Add date change listeners for preview
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        if (startDate && endDate) {
            startDate.addEventListener('change', () => this.updateDateRangePreview());
            endDate.addEventListener('change', () => this.updateDateRangePreview());
        }
    },

    async loadHotelsForMultiSelect() {
        const res = await fetch('/api/admin/hotels');
        const data = await res.json();
        const select = $('#hotelSelect');
        select.empty();

        if (data.success) {
            data.data.forEach(hotel => {
                const availableTokens = hotel.token_quota - hotel.token_used;
                const option = new Option(
                    `${hotel.name} (${availableTokens} tokens available)`,
                    hotel.id,
                    false,
                    false
                );
                select.append(option);
            });
        }
        select.trigger('change');
    },

    async loadSchedulesForMultiSelect() {
        const res = await fetch('/api/admin/schedules');
        const data = await res.json();
        const select = $('#scheduleSelect');
        select.empty();

        if (data.success) {
            data.data.forEach(schedule => {
                const date = new Date(schedule.date).toLocaleDateString();
                const option = new Option(
                    `${date} - ${schedule.module_name} (${schedule.session})`,
                    schedule.id,
                    false,
                    false
                );
                select.append(option);
            });
        }
        select.trigger('change');
    },

    async loadHotelsForFilter() {
        const res = await fetch('/api/admin/hotels');
        const data = await res.json();
        const select = document.getElementById('filterHotel');
        select.innerHTML = '<option value="">All Hotels</option>';

        if (data.success) {
            data.data.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.id;
                option.textContent = hotel.name;
                select.appendChild(option);
            });
        }
    },

    switchAssignmentMode(mode) {
        const manualMode = document.getElementById('manualMode');
        const dateRangeMode = document.getElementById('dateRangeMode');
        const manualTab = document.getElementById('manualTab');
        const dateRangeTab = document.getElementById('dateRangeTab');

        if (mode === 'manual') {
            manualMode.classList.remove('hidden');
            dateRangeMode.classList.add('hidden');
            manualTab.classList.add('active', 'border-purple-600', 'text-purple-600');
            manualTab.classList.remove('border-transparent', 'text-gray-500');
            dateRangeTab.classList.remove('active', 'border-purple-600', 'text-purple-600');
            dateRangeTab.classList.add('border-transparent', 'text-gray-500');
        } else {
            manualMode.classList.add('hidden');
            dateRangeMode.classList.remove('hidden');
            dateRangeTab.classList.add('active', 'border-purple-600', 'text-purple-600');
            dateRangeTab.classList.remove('border-transparent', 'text-gray-500');
            manualTab.classList.remove('active', 'border-purple-600', 'text-purple-600');
            manualTab.classList.add('border-transparent', 'text-gray-500');
        }
    },

    async updateDateRangePreview() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const preview = document.getElementById('dateRangePreview');
        const previewText = document.getElementById('previewText');

        if (startDate && endDate) {
            // Fetch schedules in range
            const res = await fetch(`/api/admin/schedules`);
            const data = await res.json();

            if (data.success) {
                const schedulesInRange = data.data.filter(s => {
                    return s.date >= startDate && s.date <= endDate;
                });

                previewText.textContent = `${schedulesInRange.length} schedule(s) found between ${new Date(startDate).toLocaleDateString()} and ${new Date(endDate).toLocaleDateString()}`;
                preview.classList.remove('hidden');
            }
        } else {
            preview.classList.add('hidden');
        }
    },

    async assignHotelsManual() {
        const hotelIds = $('#hotelSelect').val();
        const scheduleIds = $('#scheduleSelect').val();

        if (!hotelIds || hotelIds.length === 0) {
            await this.showWarning('Silakan pilih minimal satu hotel terlebih dahulu.');
            return;
        }

        if (!scheduleIds || scheduleIds.length === 0) {
            await this.showWarning('Silakan pilih minimal satu jadwal terlebih dahulu.');
            return;
        }

        const totalAssignments = hotelIds.length * scheduleIds.length;
        const totalTokens = scheduleIds.length;
        const details = `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Jumlah Hotel:</span>
                    <span class="font-semibold">${hotelIds.length}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Jumlah Jadwal:</span>
                    <span class="font-semibold">${scheduleIds.length}</span>
                </div>
                <div class="flex justify-between border-t pt-2">
                    <span class="text-gray-600">Total Assignment:</span>
                    <span class="font-semibold">${totalAssignments}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Token per Hotel:</span>
                    <span class="font-semibold text-red-600">-${totalTokens}</span>
                </div>
            </div>
        `;

        const confirmed = await this.showConfirm(
            'Konfirmasi Assignment',
            'Apakah Anda yakin ingin melanjutkan?',
            details
        );

        if (!confirmed) return;

        try {
            const res = await fetch('/api/admin/hotel-schedules/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotel_ids: hotelIds.map(id => parseInt(id)),
                    schedule_ids: scheduleIds.map(id => parseInt(id))
                })
            });

            const data = await res.json();

            if (data.success) {
                await this.showSuccess(`Berhasil membuat ${data.data.created} assignment!`);
                $('#hotelSelect').val(null).trigger('change');
                $('#scheduleSelect').val(null).trigger('change');
                await this.loadHotelSchedules();
                await this.loadHotelsForMultiSelect(); // Refresh token counts
            } else {
                await this.showError(data.message);
            }
        } catch (error) {
            await this.showError(error.message);
        }
    },

    async assignHotelsByDateRange() {
        const hotelIds = $('#hotelSelect').val();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!hotelIds || hotelIds.length === 0) {
            await this.showWarning('Silakan pilih minimal satu hotel terlebih dahulu.');
            return;
        }

        if (!startDate || !endDate) {
            await this.showWarning('Silakan pilih tanggal mulai dan tanggal akhir.');
            return;
        }

        if (startDate > endDate) {
            await this.showWarning('Tanggal mulai harus lebih awal atau sama dengan tanggal akhir.');
            return;
        }

        try {
            const res = await fetch('/api/admin/hotel-schedules/bulk-by-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hotel_ids: hotelIds.map(id => parseInt(id)),
                    start_date: startDate,
                    end_date: endDate
                })
            });

            const data = await res.json();

            if (data.success) {
                await this.showSuccess(`Berhasil membuat ${data.data.created} assignment untuk ${hotelIds.length} hotel!`);
                $('#hotelSelect').val(null).trigger('change');
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';
                document.getElementById('dateRangePreview').classList.add('hidden');
                await this.loadHotelSchedules();
                await this.loadHotelsForMultiSelect(); // Refresh token counts
            } else {
                await this.showError(data.message);
            }
        } catch (error) {
            await this.showError(error.message);
        }
    },

    async loadHotelSchedules() {
        const hotelId = document.getElementById('filterHotel').value;
        let url = '/api/admin/hotel-schedules';
        if (hotelId) {
            url += `?hotel_id=${hotelId}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        const tbody = document.getElementById('assignmentsTableBody');
        tbody.innerHTML = '';

        if (data.success && data.data.length > 0) {
            data.data.forEach(assignment => {
                const date = new Date(assignment.date).toLocaleDateString();
                const status = assignment.staff_name === 'HOTEL_ASSIGNMENT'
                    ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>'
                    : '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Claimed</span>';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${assignment.hotel_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${assignment.module_name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${date}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${assignment.session}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${assignment.start_time} - ${assignment.end_time}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${status}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${assignment.staff_name === 'HOTEL_ASSIGNMENT' ? `
                            <button onclick="AdminApp.removeHotelSchedule(${assignment.id})" 
                                class="text-red-600 hover:text-red-900">Remove</button>
                        ` : `
                            <span class="text-gray-400">Claimed by ${assignment.staff_name}</span>
                        `}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No assignments found</td></tr>';
        }
    },

    async removeHotelSchedule(assignmentId) {
        const confirmed = await this.showConfirm(
            'Hapus Assignment?',
            'Token akan dikembalikan ke hotel.',
            '<p class="text-sm text-gray-600">Assignment yang sudah di-claim oleh staff tidak dapat dihapus.</p>'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/hotel-schedules/${assignmentId}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                await this.showSuccess('Assignment berhasil dihapus dan token telah dikembalikan!');
                await this.loadHotelSchedules();
                await this.loadHotelsForMultiSelect(); // Refresh token counts
            } else {
                await this.showError(data.message);
            }
        } catch (error) {
            await this.showError(error.message);
        }
    },

    // --- Others Information ---
    async initOthersInformation() {
        const form = document.getElementById('addInfoForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const type = document.getElementById('infoType').value;
                const detail = document.getElementById('infoDetail').value;
                await this.createOthersInfo(type, detail);
            });
        }

        const editForm = document.getElementById('editInfoForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('editInfoId').value;
                const type = document.getElementById('editInfoType').value;
                const detail = document.getElementById('editInfoDetail').value;
                await this.updateOthersInfo(id, type, detail);
            });
        }

        this.loadOthersInformation();
    },

    async loadOthersInformation() {
        try {
            const filterType = document.getElementById('filterType')?.value || '';
            let url = '/api/admin/others-information';
            if (filterType) {
                url += `?type=${filterType}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            const tbody = document.getElementById('infoTableBody');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(info => {
                    const typeLabels = {
                        'terms': 'Terms & Conditions',
                        'generate_token': 'Generate Token Info',
                        'maximum_expired': 'Maximum Expired Days',
                        'warning_generate': 'Warning - Generate',
                        'warning_registration': 'Warning - Registration',
                        'info_general': 'General Info'
                    };

                    const typeColors = {
                        'terms': 'bg-blue-100 text-blue-800',
                        'generate_token': 'bg-purple-100 text-purple-800',
                        'maximum_expired': 'bg-indigo-100 text-indigo-800',
                        'warning_generate': 'bg-red-100 text-red-800',
                        'warning_registration': 'bg-yellow-100 text-yellow-800',
                        'info_general': 'bg-green-100 text-green-800'
                    };

                    const createdDate = new Date(info.created_at).toLocaleDateString('id-ID');
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-gray-50 cursor-pointer';
                    tr.onclick = () => AdminApp.editOthersInfo(info.id, info.type, info.detail);
                    tr.innerHTML = `
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap">${info.id}</td>
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap">
                            <span class="px-2 py-1 ${typeColors[info.type] || 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium">
                                ${typeLabels[info.type] || info.type}
                            </span>
                        </td>
                        <td class="px-3 md:px-6 py-4">
                            <div class="max-w-md truncate text-sm">${info.detail}</div>
                        </td>
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">${createdDate}</td>
                        <td class="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="event.stopPropagation(); AdminApp.editOthersInfo(${info.id}, '${info.type.replace(/'/g, "\\'")}', \`${info.detail.replace(/`/g, '\\`')}\`)" 
                                class="text-blue-600 hover:text-blue-900">
                                <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No information found</td></tr>';
            }
        } catch (error) {
            await this.showError('Failed to load information: ' + error.message);
        }
    },

    async createOthersInfo(type, detail) {
        try {
            const res = await fetch('/api/admin/others-information', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, detail })
            });

            const data = await res.json();

            if (data.success) {
                await this.showSuccess('Informasi berhasil ditambahkan!');
                document.getElementById('addInfoForm').reset();
                await this.loadOthersInformation();
            } else {
                await this.showError(data.message);
            }
        } catch (error) {
            await this.showError(error.message);
        }
    },

    editOthersInfo(id, type, detail) {
        document.getElementById('editInfoId').value = id;
        document.getElementById('editInfoType').value = type;
        document.getElementById('editInfoDetail').value = detail;
        document.getElementById('editInfoModal').classList.remove('hidden');
    },

    closeEditInfoModal() {
        document.getElementById('editInfoModal').classList.add('hidden');
    },

    async updateOthersInfo(id, type, detail) {
        try {
            const res = await fetch(`/api/admin/others-information/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, detail })
            });

            const data = await res.json();

            if (data.success) {
                await this.showSuccess('Informasi berhasil diupdate!');
                this.closeEditInfoModal();
                await this.loadOthersInformation();
            } else {
                await this.showError(data.message);
            }
        } catch (error) {
            await this.showError(error.message);
        }
    },

    async deleteOthersInfo(id) {
        const confirmed = await this.showConfirm(
            'Hapus Informasi?',
            'Apakah Anda yakin ingin menghapus informasi ini?',
            '<p class="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan.</p>'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/others-information/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                await this.showSuccess('Informasi berhasil dihapus!');
                await this.loadOthersInformation();
            } else {
                await this.showError(data.message);
            }
        } catch (error) {
            await this.showError(error.message);
        }
    },

    // --- Print Hotel Schedules ---
    printHotelSchedules() {
        const tbody = document.getElementById('assignmentsTableBody');
        const table = document.querySelector('.min-w-full');

        if (!tbody || tbody.rows.length === 0) {
            this.showWarning('Tidak ada data jadwal untuk dicetak');
            return;
        }

        // Get filter value to determine hotel name
        const filterHotel = document.getElementById('filterHotel');
        const selectedHotelId = filterHotel.value;
        let hotelName = 'All Hotels';

        if (selectedHotelId) {
            const selectedOption = filterHotel.options[filterHotel.selectedIndex];
            hotelName = selectedOption.text;
        }

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Process table rows
        let tableRows = '';
        Array.from(tbody.rows).forEach(row => {
            if (row.cells.length > 1) { // Skip "no data" rows
                let rowHtml = '<tr>';
                Array.from(row.cells).forEach((cell, index) => {
                    // Skip the Actions column (last column)
                    if (index < row.cells.length - 1) {
                        rowHtml += `<td>${cell.textContent.trim()}</td>`;
                    }
                });
                rowHtml += '</tr>';
                tableRows += rowHtml;
            }
        });

        // Build the print content with signature section
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hotel Schedules - Print</title>
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
                    .signature-section {
                        margin-top: 60px;
                        display: flex;
                        justify-content: space-between;
                        padding: 0 40px;
                    }
                    .signature-box {
                        text-align: center;
                        width: 200px;
                    }
                    .signature-line {
                        margin-top: 80px;
                        border-top: 1px solid #000;
                        padding-top: 5px;
                        font-weight: 600;
                    }
                    .signature-title {
                        font-weight: 600;
                        margin-bottom: 10px;
                    }
                    @media print {
                        body { margin: 10px; }
                    }
                </style>
            </head>
            <body>
                <h1>Hotel Schedule Assignments</h1>
                <div class="hotel-info">
                    ${hotelName}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Hotel</th>
                            <th>Module</th>
                            <th>Date</th>
                            <th>Session</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                <div class="print-date">
                    Printed on: ${new Date().toLocaleString()}
                </div>
                <div class="signature-section">
                    <div class="signature-box">
                        <div class="signature-title">PT. Supranusa Sindata</div>
                        <div class="signature-line">
                            (________________)
                        </div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">Hotel</div>
                        <div class="signature-line">
                            (________________)
                        </div>
                    </div>
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
};
