//scripts.js
document.getElementById('fetchProfile').addEventListener('click', async () => {
    const accessToken = prompt('Enter your access token');
    const response = await fetch(`/profile?access_token=${accessToken}`);
    const data = await response.json();
    const profileDiv = document.getElementById('profile');
    profileDiv.innerHTML = `
        <h2>Profile Information</h2>
        <p>ID: ${data.id}</p>
        <p>Username: ${data.username}</p>
        <p>Name: ${data.name}</p>
        <img src="${data.profile_picture_url}" alt="Profile Picture">
    `;
});

document.getElementById('fetchMedia').addEventListener('click', async () => {
    const accessToken = prompt('Enter your access token');
    const response = await fetch(`/media?access_token=${accessToken}`);
    const data = await response.json();
    const mediaDiv = document.getElementById('media');
    mediaDiv.innerHTML = ''; // Clear previous content

    data.data.forEach(item => {
        const mediaItem = document.createElement('div');
        mediaItem.classList.add('media-item');
        mediaItem.dataset.id = item.id; // Store the post ID in a data attribute
        mediaItem.dataset.caption = item.caption;
        //mediaItem.dataset.timestamp = item.timestamp;
        
        if (item.media_type === 'IMAGE') {
            mediaItem.innerHTML = `<img src="${item.media_url}" alt="Instagram Image">`;
        } else if (item.media_type === 'VIDEO') {
            mediaItem.innerHTML = `<video controls><source src="${item.media_url}" type="video/mp4"></video>`;
        } else if (item.media_type === 'CAROUSEL_ALBUM') {
            mediaItem.innerHTML = `<img src="${item.media_url}" alt="Instagram Carousel">`; // Simplified for carousel, you may need additional logic for multiple images
        }
        
        mediaDiv.appendChild(mediaItem);
    });
        // Add click event listeners to each media item
        document.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', () => {
                const postId = item.dataset.id;
                const postCaption = item.dataset.caption;
                //const postTimestamp = item.dataset.timestamp;
                displayPostDetails(postId, postCaption, /*postTimestamp*/);
            });
        });
    });
    function displayPostDetails(id, caption, timestamp) {
        const postDetailsDiv = document.getElementById('post-details');
        postDetailsDiv.innerHTML = `
            <h3>Post Details</h3>
            <p>ID: ${id}</p>
            <p>Caption: ${caption}</p>
            
        `;
    }
