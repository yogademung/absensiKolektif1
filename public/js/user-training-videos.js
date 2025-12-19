let allVideos = [];
let userHotelId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth & Get User Info
    try {
        const authRes = await fetch('/api/admin/auth/me');
        if (!authRes.ok) throw new Error('Not authenticated');
        const authData = await authRes.json();
        if (authData.success && authData.data.hotel_id) {
            userHotelId = authData.data.hotel_id;
            loadVideos();
            loadModules();
        } else {
            window.location.href = '/login';
        }
    } catch (e) {
        window.location.href = '/login';
        return;
    }

    // 2. Event Listeners for Filters
    document.getElementById('searchFilter').addEventListener('input', filterVideos);
    document.getElementById('moduleFilter').addEventListener('change', filterVideos);
});

async function loadVideos() {
    const grid = document.getElementById('videoGrid');

    try {
        const res = await fetch(`/api/vouchers/history/${userHotelId}`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            // Filter only items that have a video link or are past (implied video existence)
            // But realistically, we just show all past trainings that MIGHT have a video
            // Strict filtering for valid history
            allVideos = data.data.filter(item => {
                // Ensure it belongs to this hotel (extra safety, though API handles it)
                if (item.hotel_id !== userHotelId) return false;

                // Show if it is a PAST training (completed) - presumed to be "taken"
                // Future trainings normally don't have videos yet, and "Media Library" implies past content.
                // However, if there is a video_link provided early, we can show it.
                // User requirement: "hanya memunculkan base on modul dan jadwal yang diambil"
                // The API /vouchers/history returns exactly the modules/schedules taken by this hotel/user.
                const isPast = new Date(item.date) < new Date();
                return isPast || item.video_link;
            });

            renderVideos(allVideos);
        } else {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <p class="text-lg">No training history found.</p>
                </div>`;
        }
    } catch (err) {
        console.error('Failed to load videos:', err);
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-red-500">
                <p>Failed to load content. Please try again later.</p>
            </div>`;
    }
}

async function loadModules() {
    try {
        const res = await fetch('/api/public/modules');
        const data = await res.json();
        if (data.success) {
            const select = document.getElementById('moduleFilter');
            data.data.forEach(mod => {
                const option = document.createElement('option');
                option.value = mod.name; // Filter by name for simplicity
                option.textContent = mod.name;
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load modules:', err);
    }
}

function renderVideos(videos) {
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = '';

    if (videos.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <p class="text-lg">No videos match your filter.</p>
            </div>`;
        return;
    }

    const today = new Date();
    // Expiration limit: 90 days (3 months)
    const EXPIRATION_DAYS = 90;

    videos.forEach(video => {
        const date = new Date(video.date);
        const expirationDate = new Date(date);
        expirationDate.setDate(date.getDate() + EXPIRATION_DAYS);

        const isExpired = today > expirationDate;
        const hasVideoLink = !!video.video_link;

        // Extract YouTube ID if possible
        let thumbnailUrl = '/images/video-placeholder.png'; // Fallback or generate a placeholder
        // Simple YouTube ID extraction
        const ytMatch = video.video_link ? video.video_link.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/) : null;
        if (ytMatch) {
            thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        } else {
            // Use a nice gradient placeholder if no youtube thumb
            thumbnailUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.module_name)}&background=0D8ABC&color=fff&size=400&font-size=0.33`;
        }

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full';

        card.innerHTML = `
            <div class="relative aspect-video bg-gray-100 group">
                <img src="${thumbnailUrl}" alt="${video.module_name}" class="w-full h-full object-cover ${isExpired || !hasVideoLink ? 'opacity-50 grayscale' : ''}">
                
                ${!isExpired && hasVideoLink ? `
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                    <button onclick="openVideo('${video.video_link}', '${video.module_name.replace(/'/g, "\\'")}')" class="bg-blue-600 text-white rounded-full p-3 transform hover:scale-110 transition-transform shadow-lg">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    </button>
                </div>
                ` : ''}

                ${isExpired ? `
                <div class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-60">
                    <span class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Expired</span>
                </div>
                ` : ''}

                 ${!hasVideoLink && !isExpired ? `
                <div class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-40">
                    <span class="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">No Recording</span>
                </div>
                ` : ''}
            </div>
            
            <div class="p-5 flex-1 flex flex-col">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-900 text-lg leading-tight line-clamp-2">${video.module_name}</h3>
                    <span class="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-md whitespace-nowrap ml-2">${video.session}</span>
                </div>
                
                <div class="text-sm text-gray-500 mb-4 space-y-1">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        ${new Date(video.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                     <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ${video.start_time} - ${video.end_time}
                    </div>
                </div>

                <div class="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span class="text-xs text-gray-400">
                        ${isExpired ? `Expired on ${expirationDate.toLocaleDateString()}` : `Available until ${expirationDate.toLocaleDateString()}`}
                    </span>
                    
                    ${!isExpired && hasVideoLink ? `
                    <button onclick="openVideo('${video.video_link}', '${video.module_name.replace(/'/g, "\\'")}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        Watch Now
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </button>
                    ` : ''}
                     ${!isExpired && !hasVideoLink ? `
                    <span class="text-gray-400 text-sm italic">Recording processing...</span>
                    ` : ''}
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function filterVideos() {
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
    const moduleTerm = document.getElementById('moduleFilter').value;

    const filtered = allVideos.filter(video => {
        const matchesSearch = video.module_name.toLowerCase().includes(searchTerm) ||
            video.staff_name.toLowerCase().includes(searchTerm);
        const matchesModule = moduleTerm === 'all' || video.module_name === moduleTerm;

        return matchesSearch && matchesModule;
    });

    renderVideos(filtered);
}

// Modal Logic
function openVideo(url, title) {
    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('videoFrame');
    const modalTitle = document.getElementById('modalTitle');

    // Convert regular YouTube URL to Embed URL
    let embedUrl = url;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    if (ytMatch) {
        // Added params:
        // modestbranding=1: Removes some YouTube branding
        // rel=0: Shows related videos from SAME channel only
        // iv_load_policy=3: Hides video annotations
        // fs=0: Disables fullscreen button (often prevents access to 'watch on youtube' link context)
        // disablekb=1: Disables keyboard shortcuts
        embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`;
    }

    frame.src = embedUrl;
    modalTitle.textContent = title;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('videoFrame');

    modal.classList.add('hidden');
    frame.src = ''; // Stop video
    document.body.style.overflow = '';
}
