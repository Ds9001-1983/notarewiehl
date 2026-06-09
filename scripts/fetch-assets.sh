#!/usr/bin/env bash
# Lädt alle Original-Assets (Bilder, Icons, Logo, PDF-Formulare) der bestehenden
# Notare-Wiehl-Website (CM4all/Strato) herunter und legt sie sauber benannt im
# Astro-Projekt ab. Einmalig auszuführen: `npm run fetch:assets`.
#
# CM4all-Verhalten (verifiziert):
#   - PNG: uproc.php ignoriert das /picture-NNNN-Suffix und liefert per 301 das Original.
#   - JPG: uproc.php skaliert echt; ein hohes Suffix (picture-3000) liefert das Original.
#   - PDF: direkter Pfad (ohne Suffix), Query-String (?cdp=...&_=...) wird abgeschnitten.
set -u

BASE="http://571125735.swh.strato-hosting.eu"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMG_DIR="$ROOT/src/assets/images"
ICON_DIR="$ROOT/src/assets/icons"
DL_DIR="$ROOT/public/downloads"
mkdir -p "$IMG_DIR" "$ICON_DIR" "$DL_DIR"

UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"

dl_image() {  # $1 = uproc-Basispfad (ohne picture-Suffix), $2 = Zielpfad
  local src="$BASE$1/picture-3000" dest="$2"
  curl -sSL --fail --retry 3 -A "$UA" --max-time 90 "$src" -o "$dest" \
    && printf '  ok  %7sb  %s\n' "$(wc -c < "$dest" | tr -d ' ')" "$(basename "$dest")" \
    || printf '  FEHLER  %s  (%s)\n' "$(basename "$dest")" "$src"
}

dl_pdf() {    # $1 = uproc-Pfad (ohne Query), $2 = Zielname
  local src="$BASE$1" dest="$DL_DIR/$2"
  curl -sSL --fail --retry 3 -A "$UA" --max-time 90 "$src" -o "$dest" \
    && printf '  ok  %7sb  %s\n' "$(wc -c < "$dest" | tr -d ' ')" "$2" \
    || printf '  FEHLER  %s\n' "$2"
}

echo "== Icons =="
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_Erbe_03.png"               "$ICON_DIR/icon-erbe.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_Immobilien_03.png"         "$ICON_DIR/icon-immobilien.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_Unternhemensgruendung_03.png" "$ICON_DIR/icon-unternehmen.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_ehe_03.png"                "$ICON_DIR/icon-ehe.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_kosten.png"                "$ICON_DIR/icon-kosten.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_notfall.png"               "$ICON_DIR/icon-notfall.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Icon_vereine.png"               "$ICON_DIR/icon-vereine.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.icon_info.png"                  "$ICON_DIR/icon-info.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Oeffnungszeite_icon_02.png"     "$ICON_DIR/icon-oeffnungszeiten.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Standort_icon_02.png"           "$ICON_DIR/icon-standort.png"
dl_image "/.cm4all/uproc.php/0/Design/Buttons%20und%20Icons/.Telefon_icon_02.png"            "$ICON_DIR/icon-telefon.png"

echo "== Logo / Fotos / Karte =="
dl_image "/.cm4all/uproc.php/0/Design/Logo/2022/.logo-Kasper.png"                            "$IMG_DIR/logo-kasper.png"
dl_image "/.cm4all/uproc.php/0/.Haus%20Schmitz%20Bild%204a%20korrigiert_DxO.jpg"             "$IMG_DIR/haus-schmitz.jpg"
dl_image "/.cm4all/uproc.php/0/.Hauptstr.%2041%20Kartenausschnitt1.JPG.png"                  "$IMG_DIR/kartenausschnitt.png"
dl_image "/.cm4all/uproc.php/0/Design/Contentbilder/.Titelbild.jpg"                          "$IMG_DIR/titelbild.jpg"
dl_image "/.cm4all/uproc.php/0/Design/Contentbilder/team/.Portrait_dr_Kasper_02.png"         "$IMG_DIR/portrait-kasper.png"
dl_image "/.cm4all/uproc.php/0/Design/Contentbilder/team/.Portrait_philip_schulz.png"        "$IMG_DIR/portrait-scholz.png"

echo "== Content-Illustrationen =="
for n in allgemein_abwicklung allgemein_aufgaben-notar allgemein_beurkundung \
         bautraegervertrag ehe_und_partnerschaft ehe_vertrag erbvertrag gueterstand \
         immobilie_kauf-und-verkauf immobilien kontakt_01 links richtige_rechtsform \
         scheidung_folgevereinbarung schenkung testament-02 testament \
         uebertragungsvertrag unternehmenseinkaeufe unternehmensgruendung unternehmensnachfolge; do
  dl_image "/.cm4all/uproc.php/0/Design/Contentbilder/.$n.png" "$IMG_DIR/$n.png"
done

echo "== PDF-Formulare =="
dl_pdf "/.cm4all/uproc.php/0/Auftragserteilung.pdf"                                             "auftragserteilung.pdf"
dl_pdf "/.cm4all/uproc.php/0/Fragebogen%20wirtschaftlich%20Berechtigter.pdf"                    "fragebogen-wirtschaftlich-berechtigter.pdf"
dl_pdf "/.cm4all/uproc.php/0/WEG-Verwaltergenehmigung%20Kosten.pdf"                             "weg-verwaltergenehmigung-kosten.pdf"
dl_pdf "/.cm4all/uproc.php/0/Wertermittlungsbogen%20Nachlass.pdf"                               "wertermittlungsbogen-nachlass.pdf"
dl_pdf "/.cm4all/uproc.php/0/Formulare/Wertermittlung%20Ehevertrag.pdf"                         "wertermittlung-ehevertrag.pdf"
dl_pdf "/.cm4all/uproc.php/0/Formulare/Wertermittlung%20Erbvertrag.pdf"                         "wertermittlung-erbvertrag.pdf"
dl_pdf "/.cm4all/uproc.php/0/Formulare/Wertermittlung%20Testament.pdf"                          "wertermittlung-testament.pdf"
dl_pdf "/.cm4all/uproc.php/0/Formulare/Wertermittlung%20Generalvollmacht%20(auch%20Vorsorgevollmacht).pdf"      "wertermittlung-generalvollmacht.pdf"
dl_pdf "/.cm4all/uproc.php/0/Formulare/Wertermittlung%20Grundbesitz%20(f%C3%BCr%20%C3%9Cbertragungsvertrag).pdf" "wertermittlung-grundbesitz.pdf"

echo ""
echo "== Pixelmaße (sips) =="
for f in "$IMG_DIR"/*.{jpg,png} "$ICON_DIR"/*.png; do
  [ -f "$f" ] || continue
  dims=$(sips -g pixelWidth -g pixelHeight "$f" 2>/dev/null | awk '/pixel/{printf "%s ", $2}')
  printf '  %-28s %s\n' "$(basename "$f")" "$dims"
done
echo "Fertig."
