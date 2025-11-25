document.addEventListener('DOMContentLoaded', () => {
    const hotelSelect = document.getElementById('hotelSelect');
    const moduleSelect = document.getElementById('moduleSelect');
    const scheduleSelect = document.getElementById('scheduleSelect');
    const form = document.getElementById('registrationForm');
    const errorMessage = document.getElementById('errorMessage');

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
