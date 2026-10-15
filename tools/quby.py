"""Quby — the Quesly mascot. Builds the face SVGs and the default avatars.

Geometry is the Figma frame (38.6 x 37), cleaned up so every mood sits on the same grid:
two eyes (r 5.32) above two bars (9.32 high). Run: python3 tools/quby.py
"""
import hashlib, os

W, H = 38.6008, 37.0
R = 5.32425                      # eye radius
EYE_Y = R
BAR_H = 9.31743
BAR1_Y, BAR2_Y = 14.5048, 27.6826
SHORT = 21.0                     # short bottom bar ("thinking")
GAP = 2 * 7.2543                 # centre-to-centre eye distance (14.51)
CENTER = (W - GAP) / 2           # left eye x when centred (12.05)
LOOK = CENTER - R                # how far eyes can move sideways (6.72)

# id: (left eye, right eye, eye shift, bottom bar)
MOODS = {
    1: ("full", "top", 0, "full"),      # wink
    2: ("top", "top", 0, "full"),       # happy ^^
    3: ("full", "full", 0, "full"),     # hi
    4: ("bottom", "full", 0, "full"),   # sly
    5: ("full", "full", -LOOK, "full"), # looks left
    6: ("full", "full", LOOK, "full"),  # looks right
    7: ("full", "full", 0, "left"),     # thinking
    8: ("full", "full", 0, "right"),    # thinking, mirrored
}

def f(x):
    return f"{x:.2f}".rstrip("0").rstrip(".")

def eye(cx, kind):
    if kind == "full":
        return f'<circle cx="{f(cx)}" cy="{f(EYE_Y)}" r="{f(R)}"/>'
    sweep = 1 if kind == "top" else 0          # dome (top half) or bowl (bottom half)
    return f'<path d="M{f(cx - R)} {f(EYE_Y)}A{f(R)} {f(R)} 0 0 {sweep} {f(cx + R)} {f(EYE_Y)}Z"/>'

def face(mood):
    le, re_, dx, bar = MOODS[mood]
    x = CENTER + dx
    bar2 = {"full": (0, W), "left": (0, SHORT), "right": (W - SHORT, SHORT)}[bar]
    return (eye(x, le) + eye(x + GAP, re_)
            + f'<rect y="{f(BAR1_Y)}" width="{f(W)}" height="{f(BAR_H)}"/>'
            + f'<rect x="{f(bar2[0])}" y="{f(BAR2_Y)}" width="{f(bar2[1])}" height="{f(BAR_H)}"/>')

# Avatar colour pairs: (background, Quby)
PAIRS = [
    ("#07583D", "#D4FF00"), ("#D4FF00", "#07583D"), ("#044330", "#FFFFFF"), ("#EAF4EE", "#07583D"),
    ("#16181A", "#D4FF00"), ("#FF6A1A", "#FFFFFF"), ("#2F7FE0", "#FFFFFF"), ("#F3F5F4", "#16181A"),
]

def pick(username):
    """Same username → same Quby. Face and colour come from different bytes of the hash."""
    h = hashlib.sha256(username.lower().encode()).digest()
    return (h[5] % 8) + 1, PAIRS[h[0] % len(PAIRS)]

def avatar(username):
    mood, (bg, fg) = pick(username)
    s = 52 / W                                   # Quby is 52% of the circle wide
    tx, ty = (100 - W * s) / 2, (100 - H * s) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
            f'<circle cx="50" cy="50" r="50" fill="{bg}"/>'
            f'<g fill="{fg}" transform="translate({f(tx)} {f(ty)}) scale({s:.4f})">{face(mood)}</g></svg>\n')

if __name__ == "__main__":
    root = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
    for m in MOODS:
        with open(os.path.join(root, "quby", f"quby-{m}.svg"), "w") as fh:
            fh.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(W)} {f(H)}" fill="#D4FF00">{face(m)}</svg>\n')
    users = ["van.derss2", "alexo91", "funnnnyyy1", "mr.smith", "john.john", "chill_mara", "AnnaViva",
             "arturo_sun", "koko_lilly", "nata.ver", "leo.martin", "camille_b", "yasmine.k", "theo_runs", "misslilly_57"]
    os.makedirs(os.path.join(root, "avatars"), exist_ok=True)
    for u in users:
        with open(os.path.join(root, "avatars", f"{u}.svg"), "w") as fh:
            fh.write(avatar(u))
        print(u, pick(u))
