#!/usr/bin/env python3
"""
chunk.py — Hybrid Chunking Module (Section + Paragraph + Merge + Overlap)
Import this and call chunk(text) to get chunks ready for embedding.

4-Step Strategy:
    Step 1 : Split by section headings
    Step 2 : Within each section, split by paragraphs
    Step 3 : Merge paragraphs that are too small
    Step 4 : Apply overlap chunking on final chunks

Example:
    from chunk import chunk
    chunks = chunk(text)
"""

import re


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Section Detection & Splitting
# ─────────────────────────────────────────────────────────────────────────────

def is_heading(line: str) -> bool:
    """
    Detect section headings. Covers patterns common in student notes:

    - Unit 1, Chapter 2, Topic 3
    - ALL CAPS lines
    - Lines ending with ':'  like  "Definition:"  "Advantages:"
    - Numbered  "1. Serial Schedule"
    - Roman     "i. Conflict Serializable"
    """
    line = line.strip()
    if not line or len(line) < 2:
        return False

    patterns = [
        r'^(unit|chapter|topic|section|module|part)\s+\d+',  # Unit 1, Chapter 2
        r'^(definition|advantage|disadvantage|example|note'
        r'|overview|introduction|summary|conclusion'
        r'|types?|properties|features?|characteristics?'
        r'|algorithm|steps?|applications?)\s*:?\s*$',         # Definition: Advantages:
        r'^\d+\.\s+[A-Z]',                                   # 1. Serial Schedule
        r'^[ivxIVX]+\.\s+[A-Z]',                             # i. Conflict Serializable
        r'^[A-Z][A-Z\s\-]{3,}:?\s*$',                        # ALL CAPS HEADING
        r'^#{1,4}\s+',                                        # ## Markdown heading
    ]

    for pat in patterns:
        if re.match(pat, line, re.IGNORECASE):
            return True

    # Short line (< 60 chars), starts with capital,
    # no sentence-ending punctuation → likely a heading
    if (len(line) < 60
            and line[0].isupper()
            and not line.endswith(('.', ',', ';', '?', '!'))
            and len(line.split()) >= 2
            and len(line.split()) <= 8):
        return True

    return False


def split_by_sections(text: str) -> list[dict]:
    """
    Step 1: Split text into sections based on headings.

    Returns list of dicts:
        [
            {"heading": "1. Serial Schedule", "content": "..."},
            {"heading": "2. Non-Serial",      "content": "..."},
        ]
    """
    lines           = text.split('\n')
    sections        = []
    current_heading = "Introduction"
    current_lines   = []

    for line in lines:
        if is_heading(line.strip()):
            # Save previous section
            content = '\n'.join(current_lines).strip()
            if content:
                sections.append({
                    "heading": current_heading,
                    "content": content
                })
            # Start new section
            current_heading = line.strip()
            current_lines   = []
        else:
            current_lines.append(line)

    # Save last section
    content = '\n'.join(current_lines).strip()
    if content:
        sections.append({
            "heading": current_heading,
            "content": content
        })

    return sections


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — Paragraph Splitting within each Section
# ─────────────────────────────────────────────────────────────────────────────

def split_by_paragraphs(text: str) -> list[str]:
    """
    Step 2: Split section content by blank lines.
    Each paragraph ≈ one idea.
    """
    paragraphs = re.split(r'\n\s*\n', text)
    return [p.strip() for p in paragraphs if p.strip()]


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Merge Small Paragraphs
# ─────────────────────────────────────────────────────────────────────────────

def merge_small_paragraphs(paragraphs: list[str],
                            min_words: int = 20) -> list[str]:
    """
    Step 3: If a paragraph is too small, merge it with the next one.
    Prevents tiny chunks like "Definition:" alone from becoming embeddings.

    Args:
        paragraphs : list of paragraph strings
        min_words  : merge if paragraph has fewer words than this
    """
    if not paragraphs:
        return []

    merged = []
    buffer = paragraphs[0]

    for i in range(1, len(paragraphs)):
        if len(buffer.split()) < min_words:
            # Current buffer too small — merge with next paragraph
            buffer = buffer + '\n\n' + paragraphs[i]
        else:
            merged.append(buffer)
            buffer = paragraphs[i]

    # Don't forget the last buffer
    if buffer.strip():
        merged.append(buffer)

    return merged


# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — Overlap Chunking
# ─────────────────────────────────────────────────────────────────────────────

def apply_overlap(chunks: list[str],
                  chunk_size: int = 250,
                  overlap: int    = 40) -> list[str]:
    """
    Step 4: Apply overlap chunking on the final list of chunks.

    For each chunk:
    - If chunk > chunk_size words → split it with overlap
    - Add overlap words from previous chunk to start of current chunk
      so context flows across boundaries

    Args:
        chunks     : list of paragraph/section chunks
        chunk_size : max words per chunk (default 250)
        overlap    : words to repeat between chunks (default 40)
    """

    # First pass: split any oversized chunks
    split_chunks = []
    for chunk in chunks:
        words = chunk.split()
        if len(words) <= chunk_size:
            split_chunks.append(chunk)
        else:
            # Split with overlap
            start = 0
            while start < len(words):
                end   = start + chunk_size
                piece = ' '.join(words[start:end])
                split_chunks.append(piece)
                start = end - overlap
                if start >= len(words):
                    break

    # Second pass: prepend tail of previous chunk to each chunk
    overlapped = []
    for i, current in enumerate(split_chunks):
        if i == 0:
            overlapped.append(current)
        else:
            prev_words = split_chunks[i - 1].split()
            # Take last `overlap` words from previous chunk
            tail = ' '.join(prev_words[-overlap:]) if len(prev_words) >= overlap \
                   else ' '.join(prev_words)
            overlapped.append(tail + ' ' + current)

    return overlapped


# ─────────────────────────────────────────────────────────────────────────────
# MAIN chunk() — All 4 Steps Together
# ─────────────────────────────────────────────────────────────────────────────

def chunk(text: str,
          chunk_size: int = 250,
          overlap: int    = 40,
          min_words: int  = 20,
          verbose: bool   = True) -> list[str]:
    """
    Hybrid chunking: Section → Paragraph → Merge Small → Overlap

    Args:
        text       : clean text from preprocess.py
        chunk_size : max words per chunk (default 250)
        overlap    : overlap words between chunks (default 40)
        min_words  : min words to keep a chunk (default 20)
        verbose    : print step-by-step summary

    Returns:
        list of text chunks ready for embedding
    """

    if verbose:
        print(f"\n[ Chunking — 4-Step Hybrid Strategy ]")

    # ── Step 1: Section splitting ─────────────────────────────────────
    sections = split_by_sections(text)
    if verbose:
        print(f"  Step 1 sections    : {len(sections)}")
        for s in sections:
            print(f"    → '{s['heading'][:50]}'")

    # ── Step 2: Paragraph splitting inside each section ───────────────
    all_paragraphs = []
    for section in sections:
        heading    = section["heading"]
        paragraphs = split_by_paragraphs(section["content"])

        # Prepend heading to first paragraph of each section
        # so embedding knows what section it belongs to
        if paragraphs:
            paragraphs[0] = heading + '\n' + paragraphs[0]
        else:
            paragraphs = [heading]

        all_paragraphs.extend(paragraphs)

    if verbose:
        print(f"  Step 2 paragraphs  : {len(all_paragraphs)}")

    # ── Step 3: Merge small paragraphs ────────────────────────────────
    merged = merge_small_paragraphs(all_paragraphs, min_words=min_words)
    if verbose:
        print(f"  Step 3 after merge : {len(merged)}")

    # ── Step 4: Overlap chunking ──────────────────────────────────────
    final_chunks = apply_overlap(merged, chunk_size=chunk_size, overlap=overlap)

    # Filter out anything still too short
    final_chunks = [c.strip() for c in final_chunks
                    if len(c.strip().split()) >= min_words]

    if verbose:
        print(f"  Step 4 final chunks: {len(final_chunks)}")
        avg = sum(len(c.split()) for c in final_chunks) // max(len(final_chunks), 1)
        print(f"  Avg words/chunk    : {avg}")
        print(f"  Chunk size limit   : {chunk_size} words")
        print(f"  Overlap            : {overlap} words")

    return final_chunks
