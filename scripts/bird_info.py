import random
import requests
import json
import re
from bs4 import BeautifulSoup
from datetime import datetime
from html import unescape
import os

EBIRD_URL = "https://ebird.org/species/"
BIRD_MAP_URL = "https://ebird.org/embedmap/"
BIRD_HISTORY_FILE = 'data/bird_history.json'
EXTRA_BIRDS_FILE = 'data/extra_birds.json'
EBIRD_TAXONOMY_FILE = 'data/ebird_taxonomy.json'
NUM_EXTRA_BIRDS = 20

# Reads bird history from JSON file
def read_bird_history():
    if os.path.exists(BIRD_HISTORY_FILE):
        with open(BIRD_HISTORY_FILE, 'r') as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return []
    return []

# Writes bird history to JSON file
def write_bird_history(history):
    with open(BIRD_HISTORY_FILE, 'w') as file:
        json.dump(history, file, indent=2)

# Get a random valid bird from taxonomy
def get_random_bird():
    with open(EBIRD_TAXONOMY_FILE, 'r') as file:
        data = json.load(file)

    while True:
        bird = random.choice(data)
        if (
            bird['category'] == "species"
            and bird['range']
            and bird['extinct'] == ""
        ):
            return bird

# Scrape eBird to enrich the bird info
def get_bird_info(bird):
    ebird_url = EBIRD_URL + bird['species_code']
    ebird_html = requests.get(ebird_url).text
    soup = BeautifulSoup(ebird_html, 'html.parser')

    # Photo
    img_tag = soup.find('img', class_='Species-media-image')
    photo_url = img_tag['srcset'].split()[-2] if img_tag else ''

    # Image credit
    credit_tag = soup.find('span', string=re.compile(r'^©'))
    credit_name = re.sub(r'\s+', ' ', re.sub(r'^©\s*', '', unescape(credit_tag.text))) if credit_tag else ''

    # Checklist link
    checklist_tag = soup.find('a', class_='u-showForMedium u-linkPlain')
    checklist_url = 'https://ebird.org' + checklist_tag['href'] + "?view=photos" if checklist_tag else ''

    # Description
    desc_tag = soup.find('meta', {"name": "description"})
    description = ''
    if desc_tag:
        sentences = re.split(r'(?<=[.!?])\s+', desc_tag['content'])[:2]
        description = ' '.join(sentences)

    return {
        "speciesCode": bird['species_code'],
        "name": bird['English name'],
        "scientificName": bird['scientific name'],
        "photoUrl": photo_url,
        "rangeMapUrl": BIRD_MAP_URL + bird['species_code'] + "?scrollwheel=true&draggable=true&mapType=terrain",
        "rangeDescription": bird['range'].capitalize(),
        "description": description,
        "imageCreditName": credit_name,
        "checklistUrl": checklist_url,
        "timestamp": datetime.utcnow().isoformat()
    }

def read_json(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    # --- Generate today's Bird of the Day ---
    valid_bird = False
    while not valid_bird:
        bird = get_random_bird()
        result = get_bird_info(bird)
        if result.get("speciesCode") and result.get("photoUrl") and result.get("imageCreditName"):
            valid_bird = True

    # Load history and append new bird
    history = read_json(BIRD_HISTORY_FILE)
    result["isBirdOfTheDay"] = True
    history.append(result)
    write_json(BIRD_HISTORY_FILE, history)

    # --- Generate extra birds ---
    extra_birds = []
    for _ in range(20):  # generate 20 extras
        valid_extra = False
        while not valid_extra:
            bird = get_random_bird()
            extra = get_bird_info(bird)
            if extra.get("speciesCode") and extra.get("photoUrl") and extra.get("imageCreditName"):
                valid_extra = True
                extra["isBirdOfTheDay"] = False
                extra_birds.append(extra)

    write_json(EXTRA_BIRDS_FILE, extra_birds)