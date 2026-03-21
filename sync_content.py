#!/usr/bin/env python3
"""Sync article content from source markdown files to Sanity, using exact original text."""
import json
import re
import uuid
import requests

PROJECT_ID = "9u8onm2t"
DATASET = "production"
TOKEN = "skuRU8cZuC6eGD6Ijiy982fC9zg977CckD1IkOS1AF79hMycLvpnsObOIsV59zaSzGVefjZUlorOCbhq0AIk3F14tzvCqifI9XmE8kLxP7iCJc0r88YgQWNivV5RcABmIYIZoKE3XWqG0wOgVeGVQGSBeXmDJ94IqUE1o8yfbsp1Ku1joG7D"
SRC = "/Users/nico/Desktop/RECHERCHE_MEMOIRE_TYPOGRAPHIE/ARTICLES/"

articles = {
    "c325cfd3-90a5-4d15-97a5-2bc60a1b4850": "Introduction.md",
    "4b03db43-0c86-4eed-b7d5-d119c45c2fbb": "L'origine de la typographie.md",
    "a4a90f8c-23fc-49b7-bb5a-ec8d142aabcf": "L'imprimerie et la transmission.md",
    "a631f16e-3f84-4c9b-afc1-4b0ad3caa031": "Les premiers typographes.md",
    "a1c1858a-ae3a-46ae-b28c-662087e49d15": "Claude Garamont et le Paris des années 1530.md",
    "bd89e5a3-4a33-4065-b3f0-c0498e0eda80": "La standardisation.md",
    "a1fd221f-e4bd-48f0-b5ae-b8e71441ddfb": "La classification typographique.md",
    "0a5ec4fd-9909-400b-87c4-98fb9d1d5d5e": "Le dessin typographique.md",
    "32a88c51-271b-452f-8cfc-0b74cdfd770d": "La typographie sur internet.md",
    "17613a11-6c36-48e1-80b0-2e5e660b6b14": "Les fonderies modernes.md",
    "74e1724c-2dc7-4957-9f1d-8f6cfd41fa70": "Licences typographiques.md",
    "9c7e4fd2-af95-43e2-9451-8692b26032d5": "Cocotte.md",
    "3c4f8457-4cdb-4afe-a6a7-7c53053c63e0": "L'association de polices.md",
    "7ea9d749-eead-4424-99ea-bde3b034795a": "La typographie et l'identité de marque.md",
    "a2e621fe-6151-4715-856d-5bec5c1ac955": "OpenType et les fonctionnalités avancées.md",
}


def key():
    return uuid.uuid4().hex[:12]


def process_inline(text):
    """Convert inline markdown to Portable Text spans."""
    spans = []
    # Split by bold and italic patterns
    parts = re.split(r'(\*\*[^*]+\*\*|_[^_]+_)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            spans.append({"_type": "span", "_key": key(), "text": part[2:-2], "marks": ["strong"]})
        elif part.startswith('_') and part.endswith('_'):
            spans.append({"_type": "span", "_key": key(), "text": part[1:-1], "marks": ["em"]})
        else:
            spans.append({"_type": "span", "_key": key(), "text": part, "marks": []})
    return spans


def md_to_portable_text(text):
    """Convert markdown to Portable Text blocks - faithful to source."""
    # Remove date line
    text = re.sub(r'^\*\*\d+.*?\d{4}\*\*\s*\n*', '', text.strip())

    lines = text.split('\n')
    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines
        if not line:
            i += 1
            continue

        # Skip Obsidian images
        if line.startswith('![['):
            i += 1
            continue

        # Skip external images (we can't import them easily)
        if re.match(r'!\[.*\]\(https?://', line):
            i += 1
            continue

        # Skip caption lines (italic after images)
        if line.startswith('*') and line.endswith('*') and not line.startswith('**'):
            i += 1
            continue

        # Blockquote
        if line.startswith('> '):
            content = line[2:]
            blocks.append({
                "_type": "block",
                "_key": key(),
                "style": "blockquote",
                "children": [{"_type": "span", "_key": key(), "text": content, "marks": []}],
                "markDefs": []
            })
            i += 1
            continue

        # H3
        if line.startswith('### '):
            blocks.append({
                "_type": "block",
                "_key": key(),
                "style": "h3",
                "children": [{"_type": "span", "_key": key(), "text": line[4:], "marks": []}],
                "markDefs": []
            })
            i += 1
            continue

        # Regular paragraph - collect until empty line
        para_lines = [line]
        i += 1
        # Don't merge lines - each non-empty line separated by blank line is its own paragraph
        # The source files have one paragraph per "block" separated by blank lines

        full_text = ' '.join(para_lines)
        spans = process_inline(full_text)
        blocks.append({
            "_type": "block",
            "_key": key(),
            "style": "normal",
            "children": spans,
            "markDefs": []
        })

    return blocks


def patch_article(doc_id, filename):
    filepath = SRC + filename
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    body = md_to_portable_text(content)

    url = f"https://{PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/{DATASET}"
    mutations = [{
        "patch": {
            "id": doc_id,
            "set": {"body": body}
        }
    }]

    resp = requests.post(url, json={"mutations": mutations}, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    })

    if resp.status_code == 200:
        print(f"  OK: {filename}")
    else:
        print(f"  ERROR {resp.status_code}: {filename} - {resp.text[:200]}")


if __name__ == "__main__":
    print("Syncing articles from source files to Sanity...")
    for doc_id, filename in articles.items():
        patch_article(doc_id, filename)
    print(f"Done! {len(articles)} articles synced.")
