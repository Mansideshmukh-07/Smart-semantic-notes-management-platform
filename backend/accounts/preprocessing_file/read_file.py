#!/usr/bin/env python3
"""
read_file.py — Universal File Reader + Preprocessor
Reads text from PDF, DOCX, or TXT files then preprocesses it for embeddings.

Usage:
    python3 read_file.py notes.pdf
    python3 read_file.py notes.docx
    python3 read_file.py notes.txt
"""

import sys
import os

# ── Import preprocessing module ───────────────────────────────────────────────
from .preprocess import preprocess


# ── PDF Reader ────────────────────────────────────────────────────────────────

def read_pdf(file_path: str) -> str:
    try:
        import pdfplumber
    except ImportError:
        print("Installing pdfplumber...")
        os.system("pip install pdfplumber --break-system-packages -q")
        import pdfplumber

    text = ""
    with pdfplumber.open(file_path) as pdf:
        print(f"  Pages found : {len(pdf.pages)}")
        for i, page in enumerate(pdf.pages, 1):
            page_text = page.extract_text()
            if page_text:
                text += f"\n--- Page {i} ---\n"
                text += page_text
    return text.strip()


# ── DOCX Reader ───────────────────────────────────────────────────────────────

def read_docx(file_path: str) -> str:
    try:
        import docx
    except ImportError:
        print("Installing python-docx...")
        os.system("pip install python-docx --break-system-packages -q")
        import docx

    doc  = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        if para.text.strip():
            text += para.text + "\n"
    return text.strip()


# ── TXT Reader ────────────────────────────────────────────────────────────────

def read_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read().strip()


# ── Main Reader ───────────────────────────────────────────────────────────────

def read_file(file_path: str) -> str:
    """Read text from PDF, DOCX, or TXT file."""

    if not os.path.exists(file_path):
        print(f"ERROR: File not found: {file_path}")
        sys.exit(1)

    ext = os.path.splitext(file_path)[1].lower()

    print(f"\n  File : {file_path}")
    print(f"  Type : {ext}")

    if ext == ".pdf":
        return read_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return read_docx(file_path)
    elif ext == ".txt":
        return read_txt(file_path)
    else:
        print(f"ERROR: Unsupported file type '{ext}'")
        print("  Supported: .pdf  .docx  .doc  .txt")
        sys.exit(1)


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("Usage: python3 read_file.py <file>")
        print("  python3 read_file.py notes.pdf")
        print("  python3 read_file.py notes.docx")
        print("  python3 read_file.py notes.txt")
        sys.exit(1)

    print(f"\n{'='*55}")
    print(f"  File Reader + Preprocessor")
    print(f"{'='*55}")

    # ── Step 1: Extract text ──────────────────────────────────────────
    print(f"\n[ Step 1: Extracting text ]")
    raw_text = read_file(sys.argv[1])
    print(f"  Words extracted : {len(raw_text.split())}")

    # ── Step 2: Preprocess ────────────────────────────────────────────
    print(f"\n[ Step 2: Preprocessing ]")
    clean_text = preprocess(raw_text)
    print(f"  Words after     : {len(clean_text.split())}")

    # ── Print result ──────────────────────────────────────────────────
    print(f"\n{'='*55}")
    print(f"  FINAL CLEAN TEXT")
    print(f"{'='*55}\n")
    print(clean_text)

    # ── Save output ───────────────────────────────────────────────────
    out_path = "preprocessed_text.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(clean_text)

    print(f"\n  Saved to : '{out_path}'")
    print(f"{'='*55}\n")
