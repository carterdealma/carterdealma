/**
 * Updates the bird display with the provided bird data.
 */
function updateBirdDisplay(birdData) {
    // Hide loader
    document.getElementById('loader').style.display = 'none';

    // Populate fields
    document.getElementById('bird_name').textContent = birdData.name;
    document.getElementById('bird_scientific_name').textContent = birdData.scientificName;
    document.getElementById('bird_photo').src = birdData.photoUrl;
    document.getElementById('bird_map').src = birdData.rangeMapUrl;
    document.getElementById('range_description').textContent = birdData.rangeDescription;
    document.getElementById('bird_description').textContent = birdData.description;

    // Image credit
    const creditElement = document.getElementById("image_credit");
    creditElement.textContent = "";
    const textNode = document.createTextNode("Photo by: ");
    creditElement.appendChild(textNode);
    const link = document.createElement('a');
    link.href = birdData.checklistUrl;
    link.textContent = birdData.imageCreditName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    creditElement.appendChild(link);
    creditElement.style.display = 'inline';

    // Bird type title + back button toggle
    if (birdData.isBirdOfTheDay) {
        document.getElementById('bird_title').textContent = "Bird of the Day: ";
        document.getElementById('back_button').style.display = 'none';
    } else {
        document.getElementById('bird_title').textContent = "You've spotted the: ";
        document.getElementById('back_button').style.display = 'block';
    }

    // Enable buttons
    document.getElementById('back_button').disabled = false;
    document.getElementById('new_bird_button').disabled = false;
}

// --- Fetch Bird of the Day ---
let birdOfTheDay = null;
let extraBirds = [];
let extraBirdIndex = 0;

fetch(`data/bird_history.json?t=${Date.now()}`, { cache: "no-store" })
    .then(response => response.json())
    .then(history => {
        if (!history || history.length === 0) {
            throw new Error("No Bird of the Day found in history.");
        }
        birdOfTheDay = history[history.length - 1]; // last entry
        birdOfTheDay.isBirdOfTheDay = true;
        updateBirdDisplay(birdOfTheDay);
    })
    .catch(err => {
        console.error(err);
        document.getElementById('bird_title').textContent = "Error loading Bird of the Day.";
    });

// --- Load extra birds for the "new bird" button ---
fetch(`data/extra_birds.json?t=${Date.now()}`, { cache: "no-store" })
    .then(response => response.json())
    .then(data => {
        extraBirds = data || [];
    })
    .catch(console.error);

// --- Click handler for "new bird" ---
document.getElementById('new_bird_button').addEventListener('click', () => {
    if (extraBirds.length === 0) return; // no birds loaded yet
    document.getElementById('loader').style.display = 'block';
    document.getElementById('new_bird_button').disabled = true;
    document.getElementById('back_button').disabled = true;

    // Cycle through pre-generated extra birds
    const bird = extraBirds[extraBirdIndex];
    bird.isBirdOfTheDay = false;
    updateBirdDisplay(bird);

    // Move index forward (loop back to start if at the end)
    extraBirdIndex = (extraBirdIndex + 1) % extraBirds.length;
});

// --- Click handler for "back" ---
document.getElementById('back_button').addEventListener('click', () => {
    if (!birdOfTheDay) return;
    document.getElementById('loader').style.display = 'block';
    document.getElementById('back_button').disabled = true;
    updateBirdDisplay(birdOfTheDay);
});
