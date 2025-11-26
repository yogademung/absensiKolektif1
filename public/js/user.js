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

    // Handle Form Submit
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
