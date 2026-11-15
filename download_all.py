import urllib.request
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

INDEX_URL = "https://shirdibooks.com/sai-satcharitra-chapters/"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def get_chapter_list():
    req = urllib.request.Request(INDEX_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8')

    pattern = r'<a\s+[^>]*href="(https://shirdibooks\.com/[^"]*(?:chapter|epilogue)[^"]*)"[^>]*>(.*?)</a>'
    matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)

    chapters = []
    seen = set()
    for href, label in matches:
        clean_label = re.sub(r'<[^>]+>', '', label).strip()
        clean_label = re.sub(r'\s+', ' ', clean_label)
        if href not in seen and clean_label and "Sai Satcharitra Chapters" not in clean_label:
            seen.add(href)
            chapters.append((href, clean_label))
    return chapters

def clean_chapter_html(raw_html):
    # Remove audio prompt paragraph
    cleaned = re.sub(r'<p[^>]*>.*?audiobook.*?</p>', '', raw_html, flags=re.DOTALL | re.IGNORECASE)
    # Remove sharedaddy / Jetpack sharing
    cleaned = re.sub(r'<div class="sharedaddy.*', '', cleaned, flags=re.DOTALL)
    # Remove scripts and styles
    cleaned = re.sub(r'<script.*?</script>', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'<style.*?</style>', '', cleaned, flags=re.DOTALL)
    # Remove navigation links inside content if any
    cleaned = re.sub(r'<p[^>]*>\s*<a href="[^"]*sai-satcharitra-chapter[^"]*">.*?Next.*?</p>', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r'<p[^>]*>\s*<a href="[^"]*sai-satcharitra-chapter[^"]*">.*?Previous.*?</p>', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
    # Clean up empty paragraphs
    cleaned = re.sub(r'<p>\s*&nbsp;\s*</p>', '', cleaned)
    cleaned = re.sub(r'<p>\s*</p>', '', cleaned)
    return cleaned.strip()

def fetch_single_chapter(index, url, label):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=20) as resp:
            html = resp.read().decode('utf-8')

        # Extract entry title
        title_m = re.search(r'<h1 class="entry-title"[^>]*>(.*?)</h1>', html, re.DOTALL)
        full_title = re.sub(r'<[^>]+>', '', title_m.group(1)).strip() if title_m else label

        # Extract entry content
        content_m = re.search(r'<div class="entry-content[^"]*"[^>]*>(.*?)</div>\s*<!-- \.entry-content -->', html, re.DOTALL)
        if not content_m:
            content_m = re.search(r'<div class="entry-content[^"]*"[^>]*>(.*?)(?:<footer|<div class="ast-single-post-order"|<nav|<div id="comments")', html, re.DOTALL)

        raw_content = content_m.group(1) if content_m else ""
        cleaned_html = clean_chapter_html(raw_content)

        # Extract bullet topics at the top if present
        topics = []
        topics_m = re.search(r'<ul[^>]*>(.*?)</ul>', cleaned_html, re.DOTALL)
        if topics_m:
            li_items = re.findall(r'<li[^>]*>(.*?)</li>', topics_m.group(1), re.DOTALL)
            for li in li_items:
                clean_t = re.sub(r'<[^>]+>', '', li).strip()
                if clean_t:
                    topics.append(clean_t)

        # Word count & reading time calculation
        plain_text = re.sub(r'<[^>]+>', ' ', cleaned_html)
        words = len(plain_text.split())
        est_minutes = max(2, round(words / 180)) # ~180 words per minute for devotional reading

        slug = url.strip('/').split('/')[-1]

        return {
            "id": index,
            "title": full_title,
            "short_title": label,
            "slug": slug,
            "url": url,
            "topics": topics,
            "word_count": words,
            "reading_time_mins": est_minutes,
            "content": cleaned_html
        }
    except Exception as e:
        print(f"Error fetching {label} ({url}): {e}")
        return None

def main():
    print("Fetching chapter list...")
    chapter_list = get_chapter_list()
    print(f"Found {len(chapter_list)} chapters. Fetching contents in parallel...")

    results = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_idx = {
            executor.submit(fetch_single_chapter, i, href, lbl): i 
            for i, (href, lbl) in enumerate(chapter_list, 1)
        }
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            data = future.result()
            if data:
                results[idx] = data
                print(f"✔ Done [{idx}/{len(chapter_list)}]: {data['short_title']}")

    # Sort results in correct order
    ordered_chapters = [results[i] for i in sorted(results.keys())]

    output_path = "/Users/layyzee/Downloads/Deepseek+REA/sai_satcharitra_app/data/chapters.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(ordered_chapters, f, ensure_ascii=False, indent=2)

    print(f"\n🎉 Successfully downloaded and cleaned {len(ordered_chapters)} chapters into {output_path}!")

if __name__ == "__main__":
    main()
