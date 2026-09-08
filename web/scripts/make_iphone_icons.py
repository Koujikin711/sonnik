#!/usr/bin/env python3
"""PNG icons and unsigned iPhone webclip profile (not an APK)."""

from __future__ import annotations

import base64
import math
import uuid
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"
TEAL = (26, 58, 74, 255)
GOLD = (232, 201, 154, 255)
WAVE = (158, 197, 192, 255)


def rounded(size: int, radius: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=TEAL)
    s = size / 128
    # crescent
    draw.ellipse((int(56 * s), int(26 * s), int(100 * s), int(70 * s)), fill=GOLD)
    draw.ellipse((int(68 * s), int(26 * s), int(104 * s), int(62 * s)), fill=TEAL)
    # wave
    pts = []
    for i in range(0, 49):
        x = (28 + i) * s
        y = (88 - 18 * math.sin(i / 48 * math.pi)) * s
        pts.append((x, y))
    if len(pts) > 1:
        draw.line(pts, fill=WAVE, width=max(4, int(6 * s)), joint="curve")
    return img


def write_png(path: Path, size: int, radius: int | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    r = radius if radius is not None else int(size * 28 / 128)
    rounded(size, r).save(path, "PNG")


def splash(path: Path, w: int, h: int) -> None:
    img = Image.new("RGBA", (w, h), (15, 22, 26, 255))
    icon = rounded(320, 70)
    x = (w - icon.width) // 2
    y = (h - icon.height) // 2
    img.paste(icon, (x, y), icon)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "PNG")


def mobileconfig(icon_png: Path) -> str:
    icon_b64 = base64.b64encode(icon_png.read_bytes()).decode("ascii")
    clip = str(uuid.uuid4()).upper()
    root = str(uuid.uuid4()).upper()
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
      <key>Icon</key>
      <data>
{icon_b64}
      </data>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>Сонник</string>
      <key>PayloadDescription</key>
      <string>Ярлык Сонника на экран Домой</string>
      <key>PayloadDisplayName</key>
      <string>Сонник</string>
      <key>PayloadIdentifier</key>
      <string>io.github.koujikin711.sonnik.webclip</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>{clip}</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>https://koujikin711.github.io/sonnik/</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Ставит Сонник на экран Домой айфона</string>
  <key>PayloadDisplayName</key>
  <string>Сонник</string>
  <key>PayloadIdentifier</key>
  <string>io.github.koujikin711.sonnik</string>
  <key>PayloadOrganization</key>
  <string>Сонник</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>{root}</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
"""


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    write_png(ICONS / "icon-180.png", 180)
    write_png(ICONS / "icon-192.png", 192)
    write_png(ICONS / "icon-512.png", 512)
    write_png(PUBLIC / "apple-touch-icon.png", 180)
    splash(ICONS / "splash-1290x2796.png", 1290, 2796)
    splash(ICONS / "splash-1179x2556.png", 1179, 2556)
    (PUBLIC / "sonnik.mobileconfig").write_text(mobileconfig(ICONS / "icon-180.png"), encoding="utf-8")
    print("icons and iphone profile ready")


if __name__ == "__main__":
    main()
