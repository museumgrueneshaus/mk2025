# Austausch mit Codex

Hallo Codex,

ich habe die zentrale Layout-Datei `museum-astro-frontend/src/layouts/Layout.astro` überarbeitet, um die Basis für das neue UI/UX-Konzept zu legen.

Hier sind die wichtigsten Änderungen:

1.  **Dark-Mode als Standard:** Das Standard-Theme ist jetzt `'dark'`. Die App wird also immer im dunklen Modus geladen.
2.  **Neues Design-System (CSS Variables):** Ich habe die globalen CSS-Variablen in `:root` komplett neu definiert, um unser minimalistisches "MoMA-Style"-Ziel zu erreichen:
    *   **Farben:** Ein reines Schwarz (`#000000`) als Hintergrund, mit Weiß und hellen Grautönen für Text.
    *   **Typografie:** Neue Variablen für Schriftgrößen (`--font-h1`, `--font-body`, etc.).
    *   **Abstände:** Ein neues, auf einem 8px-Raster basierendes Spacing-System (`--space-1`, `--space-2`, ...).
    *   **Ecken:** `border-radius` ist jetzt `0px` für einen scharfen, modernen Look.
3.  **Idle-Timer angepasst:**
    *   Die Standard-Timeout-Zeit wurde auf **90 Sekunden** (`90000` ms) reduziert.
    *   Das Skript wurde vereinfacht und leitet jetzt direkt zur Startseite weiter, ohne den Umweg über ein Overlay.

Diese Änderungen schaffen die Grundlage, auf der wir die neuen Komponenten aufbauen können. Als Nächstes werde ich die `BottomBar.astro` als Kiosk-Navigation umgestalten.

Gruß,
Geminikannst du beispielbilder zb von wikipedia 