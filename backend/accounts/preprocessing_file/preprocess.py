#!/usr/bin/env python3
"""
preprocess.py — Text Preprocessing Module
Import this file and call preprocess(text) to clean extracted text.

Example:
    from preprocess import preprocess
    cleaned = preprocess(raw_text)
"""

import re
import unicodedata


# ── Step 1: Basic Cleaning ────────────────────────────────────────────────────

def remove_page_markers(text: str) -> str:
    """Remove page markers like '--- Page 1 ---' added during extraction."""
    text = re.sub(r'---\s*Page\s*\d+\s*---', '', text)
    return text


def remove_null_chars(text: str) -> str:
    """Remove null/control characters that come from PDF extraction."""
    text = text.replace('\x0c', '')   # form feed
    text = text.replace('\x00', '')   # null byte
    text = text.replace('\x0b', '')   # vertical tab
    text = re.sub(r'[\x01-\x08\x0e-\x1f\x7f]', '', text)
    return text


def fix_bullet_symbols(text: str) -> str:
    """Convert unicode bullet symbols (●, •, ■ etc.) to plain '-'."""
    text = re.sub(r'[●•■◆▪►▶✓✗​]+\s*', '- ', text)
    return text


def remove_noise_lines(text: str) -> str:
    """Remove decorative lines, standalone page numbers, copyright lines."""
    lines   = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()

        # Skip decorative lines: ─────, =====, *****
        if re.match(r'^[\-=_*~#]{4,}$', stripped):
            continue

        # Skip standalone page numbers: "1", "- 2 -", "Page 2 of 5"
        if re.match(r'^-?\s*\d+\s*-?$', stripped):
            continue
        if re.match(r'^page\s+\d+(\s+of\s+\d+)?$', stripped, re.IGNORECASE):
            continue

        # Skip copyright lines
        if re.match(r'^©|^copyright', stripped, re.IGNORECASE):
            continue

        cleaned.append(line)

    return '\n'.join(cleaned)


# ── Step 2: Fix Broken Lines ──────────────────────────────────────────────────

def fix_hyphenated_words(text: str) -> str:
    """Fix words broken across lines with hyphen: 'transac-\ntion' → 'transaction'."""
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    return text


def fix_broken_sentences(text: str) -> str:
    """
    PDFs often break mid-sentence with a newline.
    Join lines that are clearly part of the same sentence.
    """
    lines  = text.split('\n')
    result = []
    i      = 0

    while i < len(lines):
        current = lines[i].rstrip()

        if i < len(lines) - 1:
            next_line = lines[i + 1].strip()

            should_join = (
                current
                and next_line
                and not current.endswith(('.', '!', '?', ':'))
                and not re.match(r'^[\-\d+\.]', next_line)
                and not re.match(r'^[A-Z][a-z].*:$', next_line)
                and next_line[0].islower()
            )

            if should_join:
                if current.endswith('-'):
                    result.append(current[:-1] + next_line)
                else:
                    result.append(current + ' ' + next_line)
                i += 2
                continue

        result.append(current)
        i += 1

    return '\n'.join(result)


# ── Step 3: Normalize Whitespace ──────────────────────────────────────────────

def normalize_whitespace(text: str) -> str:
    """Clean up tabs, trailing spaces, and excess blank lines."""
    text = text.replace('\t', ' ')
    text = re.sub(r'[ \t]+$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[ \t]+', '', text, flags=re.MULTILINE)
    text = re.sub(r' {2,}', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


# ── Step 4: Unicode Normalization ─────────────────────────────────────────────

def normalize_unicode(text: str) -> str:
    """Normalize unicode: fix encoding, replace fancy quotes/dashes."""
    text = unicodedata.normalize('NFC', text)

    replacements = {
        '\u2018': "'",    # left single quote
        '\u2019': "'",    # right single quote
        '\u201c': '"',    # left double quote
        '\u201d': '"',    # right double quote
        '\u2013': '-',    # en dash
        '\u2014': '-',    # em dash
        '\u2026': '...',  # ellipsis
        '\u00a0': ' ',    # non-breaking space
        '\u200b': '',     # zero-width space
        '\u200c': '',     # zero-width non-joiner
        '\u200d': '',     # zero-width joiner
        '\ufeff': '',     # BOM
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)

    return text


# ── Step 5: Structure Preservation ───────────────────────────────────────────

def clean_structure(text: str) -> str:
    """Remove junk structure, normalize list formatting."""
    lines   = text.split('\n')
    cleaned = []

    for line in lines:
        stripped = line.strip()

        # Skip empty bullet points
        if re.match(r'^-\s*$', stripped):
            continue

        # Skip lines that are only special characters
        if stripped and all(not c.isalnum() for c in stripped):
            continue

        # "1.Serial" → "1. Serial"
        line = re.sub(r'^(\d+\.)([A-Za-z])', r'\1 \2', line)

        # "i.Conflict" → "i. Conflict"
        line = re.sub(r'^([ivxIVX]+\.)([A-Za-z])', r'\1 \2', line)

        cleaned.append(line)

    return '\n'.join(cleaned)


# ── Main Preprocess Function (import this) ────────────────────────────────────

def preprocess(text: str, verbose: bool = True) -> str:
    """
    Run all preprocessing steps on extracted text.

    Args:
        text    : raw text from read_file.py
        verbose : print step-by-step progress (default True)

    Returns:
        cleaned text ready for chunking and embedding
    """

    steps = [
        ("Remove page markers",  remove_page_markers),
        ("Remove null chars",    remove_null_chars),
        ("Fix bullet symbols",   fix_bullet_symbols),
        ("Fix hyphenated words", fix_hyphenated_words),
        ("Fix broken sentences", fix_broken_sentences),
        ("Remove noise lines",   remove_noise_lines),
        ("Clean structure",      clean_structure),
        ("Normalize unicode",    normalize_unicode),
        ("Normalize whitespace", normalize_whitespace),
    ]

    for name, fn in steps:
        before = len(text)
        text   = fn(text)
        after  = len(text)
        diff   = before - after
        if verbose:
            print(f"  ✓ {name:<25} ({'-' + str(diff) if diff > 0 else str(diff)} chars)")

    return text
