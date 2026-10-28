#!/usr/bin/env python3
"""Audit generated pages for privacy, security, and publication invariants."""

from html.parser import HTMLParser
from pathlib import Path
import sys
from urllib.parse import urlparse


ALLOWED_RUNTIME_ORIGINS = {"https://static.cloudflareinsights.com"}
SITE_ORIGIN = "https://yodev21.github.io"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.anchors = []
        self.images = []
        self.scripts = []
        self.links = []
        self.iframes = []
        self.forms = []
        self.meta = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a":
            self.anchors.append(attrs)
        elif tag == "img":
            self.images.append(attrs)
        elif tag == "script":
            self.scripts.append(attrs)
        elif tag == "link":
            self.links.append(attrs)
        elif tag == "iframe":
            self.iframes.append(attrs)
        elif tag == "form":
            self.forms.append(attrs)
        elif tag == "meta":
            self.meta.append(attrs)


def origin(url):
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else None


def audit(build_dir):
    pages = sorted(build_dir.rglob("*.html"))
    assert pages, f"No HTML found in {build_dir}"

    for path in pages:
        html = path.read_text(encoding="utf-8")
        page = Page()
        page.feed(html)

        csp = [m.get("content", "") for m in page.meta if m.get("http-equiv") == "Content-Security-Policy"]
        assert len(csp) == 1, f"{path}: expected one CSP meta tag"
        for directive in (
            "default-src 'self'",
            "connect-src 'self' https://cloudflareinsights.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'none'",
        ):
            assert directive in csp[0], f"{path}: CSP missing {directive}"

        referrer = [m.get("content") for m in page.meta if m.get("name") == "referrer"]
        assert referrer == ["strict-origin-when-cross-origin"], f"{path}: invalid Referrer Policy"
        assert not page.iframes, f"{path}: iframe requires an explicit security review"
        assert not page.forms, f"{path}: form requires an explicit privacy review"

        for image in page.images:
            assert origin(image.get("src", "")) is None, f"{path}: remote image is not allowed"

        for script in page.scripts:
            src = script.get("src")
            if src and origin(src):
                assert origin(src) in ALLOWED_RUNTIME_ORIGINS, f"{path}: unapproved script origin {origin(src)}"

        for link in page.links:
            rel = link.get("rel", "").split()
            href_origin = origin(link.get("href", ""))
            if href_origin and any(item in rel for item in ("stylesheet", "preload", "prefetch", "preconnect", "icon")):
                assert href_origin in ALLOWED_RUNTIME_ORIGINS, f"{path}: unapproved resource origin {href_origin}"

        for anchor in page.anchors:
            href = anchor.get("href", "")
            external_origin = origin(href)
            if external_origin and external_origin != SITE_ORIGIN:
                assert anchor.get("target") == "_blank", f"{path}: external link must open a new tab: {href}"
                assert "noopener" in anchor.get("rel", "").split(), f"{path}: external link missing noopener: {href}"

    privacy = (build_dir / "PRIVACY.html").read_text(encoding="utf-8")
    for disclosure in (
        "Cloudflare, Inc.",
        "static.cloudflareinsights.com",
        "cloudflareinsights.com",
        "Cookie",
        "7日間",
        "6か月間",
        "2026年10月29日",
    ):
        assert disclosure in privacy, f"Privacy disclosure missing: {disclosure}"

    article_images = build_dir / "assets/images/articles"
    assert article_images.exists(), "Original article illustrations are missing"
    assert all(path.suffix == ".svg" for path in article_images.iterdir()), "Only original SVG article illustrations may be published"
    for removed_image in ("lts-careers.jpg", "lts-clover.jpg", "good-companies.jpg", "editch-note.jpg"):
        assert not (article_images / removed_image).exists(), f"Copied article image restored: {removed_image}"
    for css in build_dir.rglob("*.css"):
        assert "url(http://" not in css.read_text(encoding="utf-8")
        assert "url(https://" not in css.read_text(encoding="utf-8")
    print(f"Security, privacy, external-link and asset audit passed for {len(pages)} pages")


if __name__ == "__main__":
    audit(Path(sys.argv[1] if len(sys.argv) > 1 else "_site"))
