# backend/accounts/preprocessing_file/ocr_handwritten.py
"""
Handwritten Notes OCR Pipeline
────────────────────────────────
1. Preprocess image (grayscale + adaptive threshold)
2. Run Tesseract OCR (eng model)
3. Run Tesseract again with handwriting model if available
4. Send both outputs to Groq LLaMA for correction
5. Return corrected text (or best single-pass text if Groq unavailable)
"""

import os
import cv2
import numpy as np
import pytesseract
from groq import Groq

_groq_client = None

def _get_groq_client():
    global _groq_client
    if _groq_client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            return None
        try:
            _groq_client = Groq(api_key=api_key)
        except Exception:
            return None
    return _groq_client


def _preprocess_image(image_path: str) -> np.ndarray:
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")

    gray   = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31,
        C=10
    )
    return binary


def _run_tesseract(image: np.ndarray, lang: str = "eng") -> str:
    from pytesseract import Output

    data = pytesseract.image_to_data(
        image,
        lang=lang,
        config="--psm 6 --oem 1",
        output_type=Output.DICT,
    )

    lines      = {}
    line_order = []

    for i, word in enumerate(data["text"]):
        word = word.strip()
        if not word or int(data["conf"][i]) < 0:
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        if key not in lines:
            lines[key] = []
            line_order.append(key)
        lines[key].append(word)

    return "\n".join(" ".join(lines[k]) for k in line_order)


def _correct_with_groq(text1: str, text2: str) -> str:
    client = _get_groq_client()
    if not client:
        return text1  # Fallback to text1 if Groq API client is unconfigured

    prompt = f"""
You are given two OCR outputs of the same handwritten notes.
Your task is to correct the text using both inputs.

Instructions:
- Fix only spelling and OCR errors
- Correct broken words and merged words
- Use context to choose the correct word
- Prefer the more meaningful word between the two inputs

STRICT:
- Do NOT change sentence structure
- Do NOT rewrite sentences
- Do NOT add or remove content
- Keep line breaks exactly as they are
- Preserve headings and formatting

Return only the corrected text. No explanations.

OCR 1:
{text1}

OCR 2:
{text2}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return text1  # Soft fallback if connection drops or rate limits hit


def extract_handwritten_text(image_path: str) -> str:
    # 1. Preprocess
    processed_image = _preprocess_image(image_path)

    # 2. Standard English pass
    text_eng = _run_tesseract(processed_image, lang="eng")

    # 3. Check for custom handwriting data
    try:
        available_langs = pytesseract.get_languages()
    except Exception:
        available_langs = []

    if "handwriting" in available_langs:
        text_hw = _run_tesseract(processed_image, lang="handwriting")
        # 4. Groq correction pass using both models
        return _correct_with_groq(text_eng, text_hw)

    return text_eng
