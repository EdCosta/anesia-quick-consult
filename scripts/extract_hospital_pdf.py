import argparse
import json
import logging
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader


logging.getLogger("pypdf").setLevel(logging.ERROR)


def parse_pages(raw: str, page_count: int) -> list[int]:
    pages: set[int] = set()
    for chunk in raw.split(","):
        part = chunk.strip()
        if not part:
            continue
        if "-" in part:
            start_raw, end_raw = part.split("-", 1)
            start = max(1, int(start_raw))
            end = min(page_count, int(end_raw))
            if end < start:
                start, end = end, start
            pages.update(range(start, end + 1))
        else:
            page = int(part)
            if 1 <= page <= page_count:
                pages.add(page)
    return sorted(pages)


def extract_pages(reader: PdfReader, pages: Iterable[int], max_chars: int) -> list[dict[str, object]]:
    extracted: list[dict[str, object]] = []
    for page_num in pages:
        text = (reader.pages[page_num - 1].extract_text() or "").replace("\x00", "").strip()
        extracted.append(
            {
                "page": page_num,
                "chars": len(text),
                "text": text[:max_chars],
            }
        )
    return extracted


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract selected pages from a hospital PDF into JSON for protocol review."
    )
    parser.add_argument("pdf", help="Path to the source PDF")
    parser.add_argument(
        "--pages",
        default="1-5",
        help="Comma-separated pages or ranges, e.g. 3-4,145,149-150",
    )
    parser.add_argument(
        "--max-chars",
        type=int,
        default=3000,
        help="Maximum characters to keep per page in the output",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf).expanduser()
    reader = PdfReader(str(pdf_path))
    pages = parse_pages(args.pages, len(reader.pages))

    payload = {
        "source": str(pdf_path),
        "page_count": len(reader.pages),
        "pages": extract_pages(reader, pages, args.max_chars),
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
