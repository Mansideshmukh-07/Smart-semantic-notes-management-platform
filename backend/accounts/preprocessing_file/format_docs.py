#!/usr/bin/env python3
"""
format_docs.py — Format chunks into documents = [...] format
Import this and call format_documents(chunks) to get the final output.

Example:
    from format_docs import format_documents, save_documents
    docs_str = format_documents(chunks)
    save_documents(chunks, "documents.py")
"""

import os


# ── Format chunks into documents = [...] string ───────────────────────────────

def format_documents(chunks: list[str]) -> str:
    """
    Convert list of chunks into documents = ["...", "...", ...] format.

    Args:
        chunks : list of text strings from chunk.py

    Returns:
        formatted Python string with documents = [...]
    """
    lines = ["documents = ["]

    for chunk in chunks:
        # Escape any triple quotes inside the text
        safe_chunk = chunk.replace('"""', "'''")
        # Clean up extra whitespace inside chunk
        safe_chunk = safe_chunk.strip()
        lines.append('   """')
        # Indent each line of the chunk for readability
        for text_line in safe_chunk.split('\n'):
            lines.append(f'   {text_line}')
        lines.append('   """,')
        lines.append('')

    lines.append(']')
    return '\n'.join(lines)


# ── Save to .py file ──────────────────────────────────────────────────────────

def save_documents(chunks: list[str],
                   output_path: str = "documents.py",
                   source: str      = "") -> None:
    """
    Save chunks as a documents.py file ready to import.

    Args:
        chunks      : list of text chunks
        output_path : where to save (default: documents.py)
        source      : original filename for the header comment
    """
    header = f'"""\n'
    if source:
        header += f'Source  : {source}\n'
    header += f'Chunks  : {len(chunks)}\n'
    header += f'Usage   : from documents import documents\n'
    header += f'"""\n\n'

    content = header + format_documents(chunks)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  Saved to       : '{output_path}'")
    print(f"  Total chunks   : {len(chunks)}")
