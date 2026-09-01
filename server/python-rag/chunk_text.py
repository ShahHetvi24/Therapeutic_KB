import re
from typing import List, Dict, Any

TARGET_CHUNK_SIZE = 1100
OVERLAP_SIZE = 180


def create_topic_from_filename(filename: str) -> str:
    """Convert a Markdown filename into a readable topic title."""
    stem = filename.rsplit(".", 1)[0] if "." in filename else filename
    cleaned = re.sub(r"^(?:\d+[\s._-]+)+", "", stem)
    cleaned = cleaned.replace("_", " ").replace("-", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    if not cleaned:
        cleaned = stem.replace("_", " ").replace("-", " ")

    return cleaned.title()


def _section_title_from_line(line: str) -> str:
    match = re.match(r"^(#{1,6})\s+(.*)$", line.strip())
    if not match:
        return ""
    return match.group(2).strip()


def _extract_sections(markdown_text: str) -> List[Dict[str, str]]:
    lines = markdown_text.splitlines()
    sections: List[Dict[str, str]] = []
    current_title = "Overview"
    current_lines: List[str] = []

    for line in lines:
        heading_title = _section_title_from_line(line)
        if heading_title:
            if current_lines or current_title != "Overview":
                sections.append({
                    "section": current_title,
                    "content": "\n".join(current_lines).strip()
                })
            current_title = heading_title
            current_lines = []
        else:
            current_lines.append(line.rstrip())

    if current_lines or current_title == "Overview":
        sections.append({
            "section": current_title,
            "content": "\n".join(current_lines).strip()
        })

    clean_sections = []
    for section in sections:
        if section["content"]:
            clean_sections.append(section)

    if not clean_sections:
        clean_sections.append({"section": "Document", "content": markdown_text.strip()})

    return clean_sections


def _split_text_with_overlap(text: str, target_size: int = TARGET_CHUNK_SIZE, overlap: int = OVERLAP_SIZE) -> List[str]:
    if not text or len(text) <= target_size:
        return [text.strip()] if text.strip() else []

    chunks: List[str] = []
    start = 0

    while start < len(text):
        end = min(start + target_size, len(text))
        window = text[start:end].strip()

        if not window:
            break

        if end < len(text):
            cut_index = max(
                window.rfind("\n\n"),
                window.rfind(". "),
                window.rfind("\n"),
                window.rfind(" ")
            )

            if cut_index > int(target_size * 0.6):
                end = start + cut_index
                window = text[start:end].strip()

        if window:
            chunks.append(window)

        if end >= len(text):
            break

        step = max(target_size - overlap, 1)
        start = max(start + step, end - overlap)

    return [chunk for chunk in chunks if chunk]


def chunk_markdown_text(markdown_text: str, source_name: str = "document.md", target_size: int = TARGET_CHUNK_SIZE, overlap: int = OVERLAP_SIZE) -> List[Dict[str, str]]:
    """Split markdown content into semantic sections and overlapping chunks."""
    sections = _extract_sections(markdown_text)
    chunks: List[Dict[str, str]] = []

    for section in sections:
        section_name = section["section"]
        section_text = section["content"].strip()

        if not section_text:
            continue

        full_section_text = f"## {section_name}\n\n{section_text}".strip()
        split_chunks = _split_text_with_overlap(full_section_text, target_size, overlap)

        for chunk_text in split_chunks:
            chunks.append({
                "text": chunk_text.strip(),
                "section": section_name
            })

    if not chunks:
        fallback_text = markdown_text.strip()
        chunks.append({
            "text": fallback_text,
            "section": "Document"
        })

    return chunks
