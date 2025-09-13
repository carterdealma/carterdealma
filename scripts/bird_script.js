/**
 * This function updates the bird display with the provided bird data.
 * It updates the bird name, scientific name, photo, range map, description, and image credit information.
 * If the photo URL is empty, it refreshes the bird of the day.
 * @param {*} birdData 
 */
function updateBirdDisplay(birdData) 
{
    document.getElementById('loader').style.display = 'none'; // Hide the loader
    document.getElementById('bird_name').textContent = birdData.name;
    document.getElementById('bird_scientific_name').textContent = birdData.scientificName;
    document.getElementById('bird_photo').src = birdData.photoUrl;
    document.getElementById('bird_map').src = birdData.rangeMapUrl;
    document.getElementById('range_description').textContent = birdData.rangeDescription;
    document.getElementById('bird_description').textContent = birdData.description;
    // Set the image credit
    const creditElement = document.getElementById("image_credit")
    creditElement.textContent = "";
    const textNode = document.createTextNode("Photo by: ");
    creditElement.appendChild(textNode);
    const link = document.createElement('a')
    const url = birdData.checklistUrl;
    const name = birdData.imageCreditName;
    link.href = url;
    link.textContent = name;
    link.target = "_blank"; // Open in new tab
    link.rel = "noopener noreferrer"; // Security best practice
    creditElement.appendChild(link);
    creditElement.style.display = 'inline';
    // Change bird title and show/hide the back button based on the bird type
    if (birdData.isBirdOfTheDay) {
        document.getElementById('bird_title').textContent = "Bird of the Day: ";
        document.getElementById('back_button').style.display = 'none'; // Hide the back button
    }
    else {
        document.getElementById('bird_title').textContent = "You've spotted the: ";
        document.getElementById('back_button').style.display = 'block'; // Show the back button
    }
    // Enable all buttons
    document.getElementById('back_button').disabled = false; // Enable the back button
    document.getElementById('new_bird_button').disabled = false; // Enable the new bird button
}

// Fetches the Bird of the Day from the server and updates the display.
fetch('/bird-of-the-day')
    .then(response => response.json())
    .then(updateBirdDisplay)
    .catch(console.error);

// Add click handler for the "new bird" button
document.getElementById('new_bird_button').addEventListener('click', () => {
    document.getElementById('loader').style.display = 'block'; // Show the loader
    document.getElementById('new_bird_button').disabled = true; // Disable the new bird button to prevent multiple clicks
    document.getElementById('back_button').disabled = true; // Disable the new bird button to prevent any clicks
    fetch('/see-new-bird')
        .then(response => response.json())
        .then(updateBirdDisplay)
        .catch(console.error);
});

// Add click handler for the "back" button
document.getElementById('back_button').addEventListener('click', () => {
    document.getElementById('back_button').disabled = true; // Disable the back button to prevent multiple clicks
    fetch('/bird-of-the-day')
        .then(response => response.json())
        .then(updateBirdDisplay)
        .catch(console.error);
});

const eventSource = new EventSource('/bird-updates');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'new_bird') {
        fetch('/bird-of-the-day')
            .then(response => response.json())
            .then(updateBirdDisplay)
            .catch(console.error);
    }
};
