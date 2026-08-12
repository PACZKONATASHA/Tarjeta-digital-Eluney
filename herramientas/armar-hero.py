# Arma el hero de la tarjeta: toma el diseño original (marco, guirnalda y textos)
# y reemplaza la foto del circulo por la foto real de Eluney recortada: todo el
# fondo (las dos chicas del espejo, la pared, el piso) queda en negro.
#
#   python herramientas/armar-hero.py
#
# Entrada : recursos/hero-mi-tarjeta.png  (diseño original)
#           recursos/img-del-hero.jpeg    (foto real)
# Salida  : recursos/hero-eluney.jpg

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rec = lambda n: os.path.join(RAIZ, "recursos", n)

# Negro del fondo del circulo (apenas calido, para no cortar contra el bosque)
NEGRO = (7, 6, 5)

# Circulo del diseño original (ajustado por minimos cuadrados sobre el anillo)
CX, CY, R = 506.0, 627.9, 267.6
# Encuadre de la foto: centro y radio del recorte circular
FOTO_C, FOTO_R = (430, 610), 340

# Contorno de Eluney: todo lo que queda fuera se pinta de negro.
# Del pelo para abajo el borde salio de medir la foto fila por fila.
IZQ = [(542,325),(520,318),(500,314),(478,310),(458,312),(438,316),(422,326),(410,336),
       (403,345),(397,350),(382,357),(366,367),(355,377),(342,387),(338,397),(332,407),
       (331,417),(331,427),(321,437),(313,447),(311,457),(309,467),(305,477),(301,487),
       (288,497),(282,507),(282,517),(268,527),(260,537),(256,547),(253,557),(254,567),
       (247,577),(238,587),(234,597),(230,607),(226,617),(232,627),(234,637),(231,647),
       (215,657),(200,670),(188,682),(178,696),(168,712),(158,735),(148,765),(138,800),
       (131,835),(127,870),(128,905),(133,945),(142,995),(154,1045),(170,1100),(190,1160),
       (210,1225),(230,1280)]
# Lado derecho: borde del celular, la mano y el brazo, medido fila por fila.
DER = [(800,1280),(790,1150),(778,1040),(766,980),(760,950),(755,920),(750,900),
       (745,880),(735,860),(725,840),(715,820),(705,800),(695,780),(685,760),
       (675,740),(665,720),(658,700),(660,684),(672,668),(684,652),(690,636),
       (692,618),(688,598),(680,578),(668,558),(658,542),(650,520),(647,490),
       (645,460),(647,420),(650,390),(654,365),(662,345),(640,336),(600,331),(566,328)]

# Huecos de fondo que quedan encerrados dentro del contorno (se pintan de negro)
RECORTES = [
    # naranja del espejo, entre el pelo y la mano
    [(534,660),(546,656),(556,662),(560,676),(557,690),(548,698),(538,694),(531,678)],
]


def separar_del_fondo(foto):
    """Recorta a Eluney: todo lo que no es ella queda en negro."""
    w, h = foto.size
    m = Image.new("L", (w, h), 0)
    dib = ImageDraw.Draw(m)
    dib.polygon(IZQ + DER, fill=255)
    for hueco in RECORTES:
        dib.polygon(hueco, fill=0)
    m = m.filter(ImageFilter.GaussianBlur(5))
    fondo = Image.new("RGB", (w, h), NEGRO)
    return Image.composite(foto, fondo, m)


def recorte_circular(seg, lado):
    cx, cy = FOTO_C
    c = seg.crop((cx - FOTO_R, cy - FOTO_R, cx + FOTO_R, cy + FOTO_R))
    c = c.resize((lado, lado), Image.LANCZOS)
    c = ImageEnhance.Contrast(c).enhance(1.06)
    c = ImageEnhance.Brightness(c).enhance(.92)
    a = np.asarray(c).astype(float)
    a[..., 0] *= 1.05          # calido, para pegar con el dorado de la tarjeta
    a[..., 1] *= 1.00
    a[..., 2] *= 0.90
    # hundimos las sombras: el pelo queda negro y no se cuela nada de luz de atras
    L = a.mean(2)
    a *= np.where(L < 82, np.clip((L - 20) / 62, 0, 1), 1.0)[..., None]
    yy, xx = np.mgrid[0:lado, 0:lado]
    rr = np.hypot(xx - lado / 2, yy - lado / 2) / (lado / 2)
    vineta = np.clip(1 - .55 * np.clip((rr - .62) / .40, 0, 1) ** 1.5, 0, 1)
    return Image.fromarray(np.clip(a * vineta[..., None], 0, 255).astype(np.uint8))


def capa_guirnalda(hero):
    """Recupera las hojas y el anillo del diseño original para volver a
    dibujarlos encima de la foto nueva."""
    a = np.asarray(hero).astype(float)
    h, w, _ = a.shape
    Y, X = np.mgrid[0:h, 0:w]
    rad = np.hypot(X - CX, Y - CY)
    ang = np.degrees(np.arctan2(Y - CY, X - CX))
    mn, mx, L = a.min(2), a.max(2), a.mean(2)
    Lb = np.asarray(Image.fromarray(L.astype(np.uint8))
                    .filter(ImageFilter.GaussianBlur(14))).astype(float)
    trazo = np.clip((L - Lb - 18) / 45, 0, 1)          # lineas finas y claras
    blanco = np.clip((mn - 115) / 70, 0, 1) * np.clip((70 - (mx - mn)) / 30, 0, 1)
    corona = np.clip((rad - 210) / 12, 0, 1) * np.clip((R + 34 - rad) / 10, 0, 1)
    alpha = np.clip(trazo * blanco * corona * 1.9, 0, 1)
    anillo = np.clip((rad - (R - 7)) / 3, 0, 1) * np.clip(((R + 7) - rad) / 3, 0, 1)
    # arriba y a la derecha no hay hojas: ahi solo dejamos el anillo
    alpha = np.where((ang > -110) & (ang < 35), np.minimum(alpha, anillo), alpha)
    return Image.fromarray((alpha * 255).astype(np.uint8))


def main():
    hero = Image.open(rec("hero-mi-tarjeta.png")).convert("RGB")
    foto = Image.open(rec("img-del-hero.jpeg")).convert("RGB")

    lado = int(2 * R) + 40
    cara = recorte_circular(separar_del_fondo(foto), lado)

    out = hero.copy()
    interior = int(2 * (R - 4))
    off = (lado - interior) // 2
    mask = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mask).ellipse((off, off, off + interior, off + interior), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    out.paste(cara, (int(CX) - lado // 2, int(CY) - lado // 2), mask)

    out.paste(hero, (0, 0), capa_guirnalda(hero))

    destino = rec("hero-eluney.jpg")
    out.save(destino, quality=90, optimize=True, progressive=True)
    print("listo ->", destino, out.size, os.path.getsize(destino) // 1024, "KB")


if __name__ == "__main__":
    main()
