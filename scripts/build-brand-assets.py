from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SKULL = Image.open(ROOT / "assets/illustrations/skull-king.png").convert("RGBA")
TEXTURE = Image.open(ROOT / "assets/brand/leather-map-texture.png").convert("RGB")


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def centered_paste(
    canvas: Image.Image, image: Image.Image, y_offset: int = 0
) -> None:
    x = (canvas.width - image.width) // 2
    y = (canvas.height - image.height) // 2 + y_offset
    canvas.alpha_composite(image, (x, y))


texture = TEXTURE.resize((1024, 1024), Image.Resampling.LANCZOS)
texture = ImageEnhance.Contrast(texture).enhance(1.08)
texture = ImageEnhance.Color(texture).enhance(0.92)

icon = texture.convert("RGBA")
icon_skull = contain(SKULL, (690, 760))
shadow_subject = Image.new("RGBA", icon.size, (0, 0, 0, 0))
centered_paste(shadow_subject, icon_skull, 18)
shadow_alpha = shadow_subject.getchannel("A").filter(ImageFilter.GaussianBlur(18))
shadow = Image.new("RGBA", icon.size, (0, 0, 0, 0))
shadow.putalpha(shadow_alpha.point(lambda value: int(value * 0.55)))
icon.alpha_composite(shadow, (0, 28))
centered_paste(icon, icon_skull)
icon.convert("RGB").save(ROOT / "assets/icon.png", optimize=True)

adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
adaptive_skull = contain(SKULL, (540, 600))
centered_paste(adaptive, adaptive_skull)
adaptive.save(ROOT / "assets/adaptive-icon.png", optimize=True)

splash = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
splash_skull = contain(SKULL, (610, 680))
centered_paste(splash, splash_skull)
splash.save(ROOT / "assets/splash-icon.png", optimize=True)

favicon = icon.resize((48, 48), Image.Resampling.LANCZOS).convert("RGB")
favicon.save(ROOT / "assets/favicon.png", optimize=True)
