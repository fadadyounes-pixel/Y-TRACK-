"""
HHOR Brand Identity — PNG Logo Generator
Produces:
  HHOR-logo-horizontal-light.png
  HHOR-logo-horizontal-dark.png
  HHOR-logo-stacked-light.png
  HHOR-logo-stacked-dark.png
  HHOR-brand-overview.png
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__)) + "/logo"

# ── Colors ───────────────────────────────────────────────────────────────
BLUE   = (11,  45,  92)
ORANGE = (230, 126,  34)
LIGHT  = (242, 242, 242)
WHITE  = (255, 255, 255)
PAGE   = (210, 210, 210)

def blend(fg, bg, a):
    """Composite fg over bg at alpha a (0–1)."""
    return tuple(round(fg[i]*a + bg[i]*(1-a)) for i in range(3))

# Pre-blended colours for use on each background
SEP_L   = blend(BLUE,  LIGHT, 0.10)   # separator on light
NAME_L  = blend(BLUE,  LIGHT, 0.58)   # secondary text on light
LBL_L   = blend(BLUE,  LIGHT, 0.38)   # section label on page bg
SEP_D   = blend(LIGHT, BLUE,  0.12)   # separator on dark
NAME_D  = blend(LIGHT, BLUE,  0.58)   # secondary text on dark
LBL_HDR = blend(LIGHT, BLUE,  0.42)   # label in header
HDR_SUB = blend(LIGHT, BLUE,  0.35)   # header subtitle

# ── Font loader ───────────────────────────────────────────────────────────
FP = "/usr/share/fonts/truetype/montserrat/Montserrat-"

def f(style, size):
    return ImageFont.truetype(f"{FP}{style}.ttf", size)

# ── Text helpers ──────────────────────────────────────────────────────────
def tbox(draw, text, font):
    """Return (ox, oy, width, height) of text bounding box."""
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[0], bb[1], bb[2]-bb[0], bb[3]-bb[1]

def put(draw, x, y, text, font, color):
    """Draw text with top-left of visual bounding box at (x, y)."""
    ox, oy, w, h = tbox(draw, text, font)
    draw.text((x - ox, y - oy), text, font=font, fill=color)
    return w, h

def put_cx(draw, cx, y, text, font, color):
    """Draw text horizontally centred at cx, top of bbox at y."""
    ox, oy, w, h = tbox(draw, text, font)
    draw.text((cx - ox - w//2, y - oy), text, font=font, fill=color)
    return w, h

def put_mid(draw, cx, cy, text, font, color):
    """Draw text centred both axes at (cx, cy)."""
    ox, oy, w, h = tbox(draw, text, font)
    draw.text((cx - ox - w//2, cy - oy - h//2), text, font=font, fill=color)
    return w, h

# ── Mark drawing ──────────────────────────────────────────────────────────
def draw_mark(draw, x, y, h, bar, cross):
    """
    Abstract H mark.
    Natural proportions: 50 wide × 64 tall, bars=14 wide, gap=22.
    Crossbar at y=22, height=20.
    """
    s   = h / 64
    bw  = round(14 * s)
    tot = round(50 * s)
    rs  = round(36 * s)
    cy  = round(22 * s)
    ch  = round(20 * s)
    cw  = rs - bw             # gap between bars
    draw.rectangle([x,    y,    x+bw-1,    y+h-1],        fill=bar)
    draw.rectangle([x+rs, y,    x+rs+bw-1, y+h-1],        fill=bar)
    draw.rectangle([x+bw, y+cy, x+bw+cw-1, y+cy+ch-1],    fill=cross)
    return tot   # returns mark width


# ═══════════════════════════════════════════════════════════════════════════
# HORIZONTAL LOGO  (1120 × 220 px)
# ═══════════════════════════════════════════════════════════════════════════
def make_horiz(bg, bar_col, text_col, name_col, cross_col=ORANGE):
    W, H = 1120, 220
    img  = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)

    PAD_X, PAD_Y = 52, 32
    MARK_H = H - PAD_Y * 2        # 156 px tall mark
    mk_w = draw_mark(draw, PAD_X, PAD_Y, MARK_H, bar_col, cross_col)

    # thin separator
    sep_x = PAD_X + mk_w + 26
    draw.rectangle([sep_x, PAD_Y, sep_x, H-PAD_Y-1],
                   fill=blend(bar_col, bg, 0.12))

    # HHOR
    fh  = f("Black", 110)
    tx  = sep_x + 28
    ox, oy, tw, th = tbox(draw, "HHOR", fh)
    ty  = (H - th) // 2
    draw.text((tx - ox, ty - oy), "HHOR", font=fh, fill=text_col)

    # Orange accent dash
    bar_y = ty + th + 8
    draw.rectangle([tx, bar_y, tx+56, bar_y+5], fill=ORANGE)

    # Platform name
    fn  = f("Medium", 19)
    ny  = bar_y + 18
    ox2, oy2, _, _ = tbox(draw, "PLATEFORME HAY HASSANI OUM RABII", fn)
    draw.text((tx - ox2, ny - oy2),
              "PLATEFORME HAY HASSANI OUM RABII", font=fn, fill=name_col)

    return img


# ═══════════════════════════════════════════════════════════════════════════
# STACKED LOGO  (680 × 440 px)
# ═══════════════════════════════════════════════════════════════════════════
def make_stacked(bg, bar_col, text_col, name_col, cross_col=ORANGE):
    W, H = 680, 440
    img  = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)

    CX = W // 2

    # Mark centred
    MARK_H = 120
    mk_w = round(50 * MARK_H / 64)
    mk_x = CX - mk_w // 2
    mk_y = 40
    draw_mark(draw, mk_x, mk_y, MARK_H, bar_col, cross_col)

    # HHOR
    fh = f("Black", 116)
    ox, oy, tw, th = tbox(draw, "HHOR", fh)
    ty = mk_y + MARK_H + 26
    draw.text((CX - ox - tw//2, ty - oy), "HHOR", font=fh, fill=text_col)

    # Orange separator
    sep_y = ty + th + 13
    bar_w = 70
    draw.rectangle([CX - bar_w//2, sep_y, CX + bar_w//2, sep_y+4], fill=ORANGE)

    # Platform name lines
    fn1 = f("Regular", 20)
    fn2 = f("Regular", 20)
    ny1 = sep_y + 20
    ny2 = ny1 + 28
    put_cx(draw, CX, ny1, "PLATEFORME", fn1, name_col)
    put_cx(draw, CX, ny2, "HAY HASSANI OUM RABII", fn2, name_col)

    return img


# ═══════════════════════════════════════════════════════════════════════════
# BRAND OVERVIEW SHEET  (1600 × 1820 px)
# ═══════════════════════════════════════════════════════════════════════════
def make_overview():
    W, H = 1600, 1820
    img  = Image.new("RGB", (W, H), PAGE)
    draw = ImageDraw.Draw(img)

    SP = 32   # side padding
    G  = 16   # gutter

    # ── HEADER ─────────────────────────────────────────────────────────────
    draw.rectangle([0, 0, W, 108], fill=BLUE)
    draw.rectangle([0, 104, W, 110], fill=ORANGE)  # orange border

    put(draw, SP, 26, "BRAND IDENTITY SYSTEM",
        f("SemiBold", 11), blend(ORANGE, BLUE, 0.85))
    put(draw, SP, 44, "HHOR", f("Black", 34), LIGHT)
    put(draw, SP, 86, "PLATEFORME HAY HASSANI OUM RABII",
        f("Medium", 10), HDR_SUB)

    y = 124

    # ── HELPER: section label ───────────────────────────────────────────────
    def sec_label(label, yy):
        put(draw, SP, yy, label, f("SemiBold", 9), LBL_L)
        draw.rectangle([SP, yy+18, W-SP, yy+19],
                       fill=blend(BLUE, PAGE, 0.10))
        return yy + 30

    # ── HELPER: caption below a panel ──────────────────────────────────────
    def caption(cx, yy, text):
        put_cx(draw, cx, yy, text, f("Medium", 9), LBL_L)

    # ─────────────────────────────────────────────────────────────────────
    # 01  HORIZONTAL LOGOS
    # ─────────────────────────────────────────────────────────────────────
    y = sec_label("01  —  LOGO  /  VARIANTE HORIZONTALE", y)

    PW = (W - SP*2 - G) // 2    # panel width  ~760 px
    PH = 200                     # panel height

    # light
    lx = SP
    ly = y
    draw.rectangle([lx, ly, lx+PW-1, ly+PH-1], fill=LIGHT)
    # mark
    MH = PH - 64
    PAD = 32
    mk_w = draw_mark(draw, lx+PAD, ly+PAD, MH, BLUE, ORANGE)
    # separator
    sx = lx + PAD + mk_w + 22
    draw.rectangle([sx, ly+PAD, sx, ly+PH-PAD], fill=SEP_L)
    # HHOR
    fhh = f("Black", 90)
    tx  = sx + 22
    ox, oy, tw, th = tbox(draw, "HHOR", fhh)
    ty2 = ly + (PH - th)//2
    draw.text((tx-ox, ty2-oy), "HHOR", font=fhh, fill=BLUE)
    bar_y = ty2 + th + 7
    draw.rectangle([tx, bar_y, tx+46, bar_y+4], fill=ORANGE)
    nx = tx
    ny = bar_y + 16
    put(draw, nx, ny, "PLATEFORME HAY HASSANI OUM RABII",
        f("Medium", 15), NAME_L)
    caption(lx + PW//2, ly+PH+10, "FOND CLAIR  ·  USAGE PRINCIPAL")

    # dark
    dx = lx + PW + G
    dy = ly
    draw.rectangle([dx, dy, dx+PW-1, dy+PH-1], fill=BLUE)
    mk_w2 = draw_mark(draw, dx+PAD, dy+PAD, MH, LIGHT, ORANGE)
    sx2 = dx + PAD + mk_w2 + 22
    draw.rectangle([sx2, dy+PAD, sx2, dy+PH-PAD], fill=SEP_D)
    tx2 = sx2 + 22
    ox, oy, tw, th = tbox(draw, "HHOR", fhh)
    ty3 = dy + (PH - th)//2
    draw.text((tx2-ox, ty3-oy), "HHOR", font=fhh, fill=LIGHT)
    bar_y2 = ty3 + th + 7
    draw.rectangle([tx2, bar_y2, tx2+46, bar_y2+4], fill=ORANGE)
    put(draw, tx2, bar_y2+16, "PLATEFORME HAY HASSANI OUM RABII",
        f("Medium", 15), NAME_D)
    caption(dx + PW//2, dy+PH+10, "FOND SOMBRE  ·  VERSION INVERSÉE")

    y = ly + PH + 36

    # ─────────────────────────────────────────────────────────────────────
    # 02  STACKED LOGOS
    # ─────────────────────────────────────────────────────────────────────
    y = sec_label("02  —  LOGO  /  VARIANTE EMPILÉE  (STACKED)", y)

    SW  = 420   # stacked panel width
    SH  = 380   # stacked panel height
    SCX = SP + SW//2
    DCX = SP + SW + G + SW//2

    # light stacked
    sx0, sy0 = SP, y
    draw.rectangle([sx0, sy0, sx0+SW-1, sy0+SH-1], fill=LIGHT)
    CX1 = sx0 + SW//2
    smh = 110
    smw = round(50 * smh / 64)
    smx = CX1 - smw//2
    draw_mark(draw, smx, sy0+36, smh, BLUE, ORANGE)
    fst = f("Black", 100)
    ox, oy, tw, th = tbox(draw, "HHOR", fst)
    sty = sy0 + 36 + smh + 24
    draw.text((CX1 - ox - tw//2, sty - oy), "HHOR", font=fst, fill=BLUE)
    ssep = sty + th + 12
    draw.rectangle([CX1-32, ssep, CX1+32, ssep+3], fill=ORANGE)
    fn_st = f("Regular", 18)
    sn1y = ssep + 16
    sn2y = sn1y + 26
    put_cx(draw, CX1, sn1y, "PLATEFORME", fn_st, NAME_L)
    put_cx(draw, CX1, sn2y, "HAY HASSANI OUM RABII", fn_st, NAME_L)
    caption(CX1, sy0+SH+10, "FOND CLAIR  ·  FORMAT CARRÉ / APP")

    # dark stacked
    dx0 = sx0 + SW + G
    dy0 = y
    draw.rectangle([dx0, dy0, dx0+SW-1, dy0+SH-1], fill=BLUE)
    CX2 = dx0 + SW//2
    smx2 = CX2 - smw//2
    draw_mark(draw, smx2, dy0+36, smh, LIGHT, ORANGE)
    ox, oy, tw, th = tbox(draw, "HHOR", fst)
    sty2 = dy0 + 36 + smh + 24
    draw.text((CX2 - ox - tw//2, sty2 - oy), "HHOR", font=fst, fill=LIGHT)
    ssep2 = sty2 + th + 12
    draw.rectangle([CX2-32, ssep2, CX2+32, ssep2+3], fill=ORANGE)
    sn1y2 = ssep2 + 16
    sn2y2 = sn1y2 + 26
    put_cx(draw, CX2, sn1y2, "PLATEFORME", fn_st, NAME_D)
    put_cx(draw, CX2, sn2y2, "HAY HASSANI OUM RABII", fn_st, NAME_D)
    caption(CX2, dy0+SH+10, "FOND SOMBRE  ·  FORMAT CARRÉ / APP")

    y = sy0 + SH + 36

    # ─────────────────────────────────────────────────────────────────────
    # 03  THE MARK  (4 sizes / backgrounds)
    # ─────────────────────────────────────────────────────────────────────
    y = sec_label("03  —  LE SIGNE  /  THE MARK  —  ISOLÉ", y)

    mark_sizes = [
        (2.5, LIGHT, BLUE, ORANGE, "GRAND FORMAT\nFOND CLAIR"),
        (2.0, BLUE,  LIGHT, ORANGE, "FOND SOMBRE"),
        (1.5, ORANGE, BLUE, LIGHT, "FOND ORANGE"),
        (0.9, LIGHT, BLUE, ORANGE, "TAILLE\nMINIMALE"),
    ]

    MH_BASE = 64
    total_cells = len(mark_sizes)
    cell_w = (W - SP*2 - G*(total_cells-1)) // total_cells
    cell_h = 220

    for i, (scale, bg_c, bar_c, cross_c, label_text) in enumerate(mark_sizes):
        cx0 = SP + i * (cell_w + G)
        draw.rectangle([cx0, y, cx0+cell_w-1, y+cell_h-1], fill=bg_c)
        mh = round(MH_BASE * scale)
        mw = round(50 * scale)
        mx = cx0 + (cell_w - mw) // 2
        my = y + (cell_h - mh) // 2 - 12
        draw_mark(draw, mx, my, mh, bar_c, cross_c)
        lbl_col = blend(bar_c, bg_c, 0.40)
        for j, line in enumerate(label_text.split("\n")):
            put_cx(draw, cx0+cell_w//2, y+cell_h-30+j*14,
                   line, f("SemiBold", 9), lbl_col)

    y += cell_h + 36

    # ─────────────────────────────────────────────────────────────────────
    # 04  COLOR PALETTE
    # ─────────────────────────────────────────────────────────────────────
    y = sec_label("04  —  PALETTE DE COULEURS", y)

    sw_w = (W - SP*2 - G*2) // 3
    sw_h = 240
    swatches = [
        (BLUE,   "#0B2D5C", "BLEU MARINE PRINCIPAL",   "R 11  G 45  B 92", "Structure · Texte · Fond principal"),
        (ORANGE, "#E67E22", "ORANGE BRÛLÉ — ACCENT",   "R 230 G 126 B 34", "Accent uniquement — crossbar, tiret"),
        (LIGHT,  "#F2F2F2", "GRIS CLAIR / BLANC",       "R 242 G 242 B 242", "Fond clair · Texte inversé"),
    ]
    for i, (clr, hex_v, name, rgb, role) in enumerate(swatches):
        sx0 = SP + i * (sw_w + G)
        sy0 = y
        # colour block
        SWATCH_H = 110
        draw.rectangle([sx0, sy0, sx0+sw_w-1, sy0+SWATCH_H-1], fill=clr)
        if clr == LIGHT:
            draw.rectangle([sx0, sy0+SWATCH_H-1, sx0+sw_w-1, sy0+SWATCH_H-1],
                           fill=blend(BLUE, LIGHT, 0.15))
        # white info area
        draw.rectangle([sx0, sy0+SWATCH_H, sx0+sw_w-1, sy0+sw_h-1], fill=WHITE)
        tp = sy0 + SWATCH_H + 14
        put(draw, sx0+18, tp,     hex_v, f("ExtraBold", 18), BLUE)
        put(draw, sx0+18, tp+26,  name,  f("SemiBold",   9), blend(BLUE, WHITE, 0.50))
        put(draw, sx0+18, tp+48,  rgb,   f("Regular",    9), blend(BLUE, WHITE, 0.30))
        put(draw, sx0+18, tp+70,  role,  f("Medium",     9), ORANGE)

    y += sw_h + 36

    # ─────────────────────────────────────────────────────────────────────
    # 05  TYPOGRAPHY
    # ─────────────────────────────────────────────────────────────────────
    y = sec_label("05  —  TYPOGRAPHIE  ·  MONTSERRAT", y)

    tc_rect = [SP, y, W-SP-1, y+360]
    draw.rectangle(tc_rect, fill=WHITE)

    tp = y + 28
    put(draw, SP+28, tp, "Montserrat", f("ExtraBold", 26), BLUE)
    put(draw, SP+204, tp+5, "Google Fonts  ·  Juarez Design  ·  Libre & gratuit",
        f("Regular", 10), blend(BLUE, WHITE, 0.32))

    tp += 50
    draw.rectangle([SP, tp, W-SP, tp+1], fill=blend(BLUE, WHITE, 0.07))
    tp += 12

    rows = [
        ("HHOR", "Black", 70, "BLACK 900  ·  70px  —  Acronyme principal"),
        ("HHOR", "ExtraBold", 42, "EXTRABOLD 800  ·  42px  —  Titres secondaires"),
        ("PLATEFORME HAY HASSANI OUM RABII", "SemiBold", 13,
         "SEMIBOLD 600  ·  13px  —  Nom complet sous l'acronyme"),
        ("Empowerment  ·  Jeunesse  ·  Maroc", "Medium", 13,
         "MEDIUM 500  ·  Tagline optionnelle"),
    ]
    for sample, style, size, meta in rows:
        w, h = put(draw, SP+28, tp, sample, f(style, size), BLUE)
        put(draw, SP+28, tp+h+6, meta, f("Regular", 9), blend(BLUE, WHITE, 0.28))
        tp += h + 32
        draw.rectangle([SP, tp-4, W-SP, tp-3], fill=blend(BLUE, WHITE, 0.06))

    y += 360 + 36

    # ─────────────────────────────────────────────────────────────────────
    # FOOTER
    # ─────────────────────────────────────────────────────────────────────
    FY = H - 56
    draw.rectangle([0, FY, W, H], fill=BLUE)
    put(draw, SP, FY+20, "HHOR  ·  PLATEFORME HAY HASSANI OUM RABII  ·  IDENTITÉ VISUELLE",
        f("Medium", 9), blend(LIGHT, BLUE, 0.35))
    ox, oy, tw, th = tbox(draw, "VERSION 1.0  ·  2025", f("Medium", 9))
    draw.text((W-SP-tw-ox, FY+20-oy), "VERSION 1.0  ·  2025",
              font=f("Medium", 9),
              fill=blend(LIGHT, BLUE, 0.35))
    # orange dot
    draw.ellipse([W//2-5, FY+18, W//2+5, FY+28+2], fill=ORANGE)

    return img


# ═══════════════════════════════════════════════════════════════════════════
# Generate all files
# ═══════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)

    print("Generating horizontal logos...")
    make_horiz(LIGHT, BLUE, BLUE, NAME_L).save(f"{OUT}/HHOR-logo-horizontal-light.png")
    make_horiz(BLUE, LIGHT, LIGHT, NAME_D).save(f"{OUT}/HHOR-logo-horizontal-dark.png")

    print("Generating stacked logos...")
    make_stacked(LIGHT, BLUE, BLUE, NAME_L).save(f"{OUT}/HHOR-logo-stacked-light.png")
    make_stacked(BLUE, LIGHT, LIGHT, NAME_D).save(f"{OUT}/HHOR-logo-stacked-dark.png")

    print("Generating brand overview...")
    make_overview().save(f"{OUT}/HHOR-brand-overview.png")

    print("Done. Files in:", OUT)
