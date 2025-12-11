#!/bin/bash
# Doppelklickbares Setup-Skript für Raspberry Pi

# Wechsel ins richtige Verzeichnis
cd "$(dirname "$0")"

# Führe Setup aus
./one-click-setup.sh

# Halte Terminal offen
read -p "Drücke Enter zum Schließen..."
