#!/bin/bash
TOOL_DIR="$(dirname "$0")/setup-tool"
VENV_DIR="$TOOL_DIR/.venv"

cd "$TOOL_DIR"

# Venv einmalig erstellen
if [ ! -d "$VENV_DIR" ]; then
    echo "Erstelle Python-Umgebung (einmalig)..."
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install -q -r requirements.txt
    echo "Fertig."
fi

"$VENV_DIR/bin/python" setup_tool.py
