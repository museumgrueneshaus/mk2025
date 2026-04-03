#!/usr/bin/env python3
"""
Museum Grünes Haus — Pi Setup Tool
Richtet Raspberry Pi Kiosk-Geräte ein.

Starten:  python3 setup_tool.py
Requires: pip install textual paramiko
"""

from __future__ import annotations

import shlex
import socket
import threading
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import paramiko
from textual import on, work
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, ScrollableContainer, Vertical
from textual.screen import ModalScreen, Screen
from textual.widgets import Button, Checkbox, Footer, Header, Input, Label, Log, Static

# ── Paths ──────────────────────────────────────────────────────────────────────
TOOL_DIR    = Path(__file__).parent
PROJECT_DIR = TOOL_DIR.parent.parent
SCRIPTS_SRC = PROJECT_DIR / "frontend" / "pi-setup"

# ── Secrets (loaded from local secrets.py, never committed) ────────────────────
try:
    import secrets as _s
    PI_USER      = _s.PI_USER
    PI_PASSWORD  = _s.PI_PASSWORD
    SANITY_TOKEN = _s.SANITY_TOKEN
    _DEFAULT_WIFI_RAW = _s.DEFAULT_WIFI
except ImportError:
    PI_USER      = "museumgh"
    PI_PASSWORD  = ""
    SANITY_TOKEN = ""
    _DEFAULT_WIFI_RAW = []


# ── Data ───────────────────────────────────────────────────────────────────────

@dataclass
class WiFiNetwork:
    ssid: str
    password: str
    priority: int = 10
    description: str = ""


@dataclass
class PiConfig:
    host:           str  = ""
    hostname:       str  = ""
    kiosk_id:       str  = ""
    sanity_token:   str  = ""
    wifi_networks:  list[WiFiNetwork] = field(default_factory=list)
    overlay_fs:     bool = False


DEFAULT_WIFI = [WiFiNetwork(**w) for w in _DEFAULT_WIFI_RAW]


# ── SSH ────────────────────────────────────────────────────────────────────────

class SSH:
    def __init__(self, host: str, user: str, password: str):
        self.host     = host
        self.user     = user
        self.password = password
        self._client: Optional[paramiko.SSHClient] = None

    def connect(self) -> bool:
        try:
            self._client = paramiko.SSHClient()
            self._client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self._client.connect(
                self.host, username=self.user, password=self.password,
                timeout=10, allow_agent=False, look_for_keys=False
            )
            return True
        except Exception:
            return False

    def run(self, cmd: str, sudo: bool = False, timeout: int = 120) -> tuple[int, str, str]:
        if not self._client:
            return -1, "", "Not connected"
        if sudo:
            stdin, stdout, stderr = self._client.exec_command(
                f"sudo -S bash -c {shlex.quote(cmd)}", timeout=timeout
            )
            stdin.write(self.password + "\n")
            stdin.flush()
            stdin.channel.shutdown_write()
        else:
            _, stdout, stderr = self._client.exec_command(cmd, timeout=timeout)
        try:
            code = stdout.channel.recv_exit_status()
        except Exception:
            code = -1
        return code, stdout.read().decode().strip(), stderr.read().decode().strip()

    def write(self, path: str, content: str, sudo: bool = False, mode: int = 0o644):
        """Write a file on the remote host."""
        sftp = self._client.open_sftp()
        tmp = f"/tmp/_museum_write_{path.replace('/', '_')}"
        with sftp.open(tmp, "w") as f:
            f.write(content)
        sftp.chmod(tmp, mode)
        sftp.close()
        if sudo:
            self.run(f"mv {tmp} {path}", sudo=True)
        else:
            self.run(f"mv {tmp} {path}")

    def upload(self, local: Path, remote: str):
        sftp = self._client.open_sftp()
        sftp.put(str(local), remote)
        sftp.close()

    def close(self):
        if self._client:
            self._client.close()
            self._client = None


# ── Discovery ──────────────────────────────────────────────────────────────────

def discover_pis(count: int = 10) -> list[dict]:
    found = []

    def probe(n: int):
        host = f"rpi{n:02d}.local"
        try:
            socket.setdefaulttimeout(2)
            socket.gethostbyname(host)
            found.append({"host": host, "hostname": f"rpi{n:02d}", "kiosk_id": f"RPI_{n:02d}"})
        except Exception:
            pass

    threads = [threading.Thread(target=probe, args=(i,), daemon=True) for i in range(1, count + 1)]
    for t in threads: t.start()
    for t in threads: t.join(timeout=4)
    return sorted(found, key=lambda x: x["host"])


# ── Screens ────────────────────────────────────────────────────────────────────

LOGO = """\
  ███╗   ███╗██╗   ██╗███████╗███████╗██╗   ██╗███╗   ███╗
  ████╗ ████║██║   ██║██╔════╝██╔════╝██║   ██║████╗ ████║
  ██╔████╔██║██║   ██║███████╗█████╗  ██║   ██║██╔████╔██║
  ██║╚██╔╝██║██║   ██║╚════██║██╔══╝  ██║   ██║██║╚██╔╝██║
  ██║ ╚═╝ ██║╚██████╔╝███████║███████╗╚██████╔╝██║ ╚═╝ ██║
  ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝"""


class WelcomeScreen(Screen):
    def compose(self) -> ComposeResult:
        with Container(id="welcome"):
            yield Static(LOGO, id="logo")
            yield Static("🏛  Grünes Haus — Raspberry Pi Kiosk Setup", id="subtitle")
            yield Static(
                "Verbindet sich per SSH mit einem Pi im Netzwerk\n"
                "und richtet den Kiosk automatisch ein.",
                id="desc"
            )
            yield Button("🔍  Pi suchen & verbinden", id="start", variant="primary")

    @on(Button.Pressed, "#start")
    def go(self):
        self.app.push_screen(DiscoverScreen())


class DiscoverScreen(Screen):
    def compose(self) -> ComposeResult:
        with Container(id="discover"):
            yield Static("🔍  Pi suchen", classes="title")
            yield Static("⏳  Suche im Netzwerk...", id="scan-status")
            yield Container(id="pi-list")
            yield Static("─" * 50, classes="divider")
            yield Static("Oder manuell verbinden:", classes="label")
            yield Input(placeholder="IP oder Hostname, z.B. 192.168.1.100 oder rpi01.local", id="host-input")
            yield Input(placeholder=f"SSH-User  [{PI_USER}]", id="user-input")
            yield Input(placeholder=f"Passwort  [{PI_PASSWORD}]", password=True, id="pass-input")
            with Horizontal():
                yield Button("🔄  Erneut suchen", id="rescan")
                yield Button("➜  Manuell verbinden", id="manual-connect", variant="primary")

    def on_mount(self):
        self.scan()

    @work(thread=True)
    def scan(self):
        pis = discover_pis()
        self.app.call_from_thread(self._show_pis, pis)

    def _show_pis(self, pis: list[dict]):
        self.query_one("#scan-status").update(
            f"✓  {len(pis)} Pi(s) gefunden:" if pis else "Keine Pis gefunden — manuell eingeben:"
        )
        container = self.query_one("#pi-list")
        container.remove_children()
        for pi in pis:
            btn = Button(f"🍓  {pi['host']}   —   {pi['kiosk_id']}", variant="success")
            btn._pi_host     = pi['host']
            btn._pi_kiosk_id = pi['kiosk_id']
            container.mount(btn)

    @on(Button.Pressed, "#rescan")
    def rescan(self):
        self.query_one("#scan-status").update("⏳  Suche im Netzwerk...")
        self.query_one("#pi-list").remove_children()
        self.scan()

    @on(Button.Pressed, "#manual-connect")
    def manual(self):
        host = self.query_one("#host-input", Input).value.strip() or "rpi01.local"
        user = self.query_one("#user-input", Input).value.strip() or PI_USER
        pw   = self.query_one("#pass-input", Input).value or PI_PASSWORD
        self.app.ssh_user     = user
        self.app.ssh_password = pw
        self.app.config.host  = host
        self.app.config.hostname = host.replace(".local", "")
        if not self.app.config.kiosk_id:
            self.app.config.kiosk_id = "RPI_01"
        self.app.push_screen(ConfigScreen())

    def on_button_pressed(self, event: Button.Pressed):
        if hasattr(event.button, "_pi_host"):
            import re
            host  = event.button._pi_host
            parts = host.replace(".local", "")
            m     = re.match(r"rpi(\d+)", parts)
            self.app.ssh_user          = PI_USER
            self.app.ssh_password      = PI_PASSWORD
            self.app.config.host       = host
            self.app.config.hostname   = parts
            self.app.config.kiosk_id   = getattr(event.button, "_pi_kiosk_id",
                                            f"RPI_{int(m.group(1)):02d}" if m else "RPI_01")
            self.app.push_screen(ConfigScreen())


class AddWifiModal(ModalScreen[Optional[WiFiNetwork]]):
    def compose(self) -> ComposeResult:
        with Container(id="modal"):
            yield Static("📶  WLAN hinzufügen", classes="title")
            yield Label("Netzwerkname (SSID)")
            yield Input(placeholder="z.B. Museum-WLAN", id="ssid")
            yield Label("Passwort")
            yield Input(placeholder="Passwort", password=True, id="password")
            yield Label("Beschreibung (optional)")
            yield Input(placeholder="z.B. museum, büro, hotspot", id="desc")
            with Horizontal():
                yield Button("✓  Hinzufügen", id="add", variant="primary")
                yield Button("✗  Abbrechen", id="cancel")

    @on(Button.Pressed, "#add")
    def add(self):
        ssid = self.query_one("#ssid", Input).value.strip()
        if ssid:
            self.dismiss(WiFiNetwork(
                ssid=ssid,
                password=self.query_one("#password", Input).value,
                description=self.query_one("#desc", Input).value,
            ))

    @on(Button.Pressed, "#cancel")
    def cancel(self):
        self.dismiss(None)


class ConfigScreen(Screen):
    def compose(self) -> ComposeResult:
        cfg = self.app.config
        with ScrollableContainer(id="config"):
            yield Static("⚙️   Konfiguration", classes="title")

            yield Static("📍  Gerät", classes="section")
            yield Label("Kiosk-ID")
            yield Input(value=cfg.kiosk_id or "RPI_01", id="kiosk-id")
            yield Label("Hostname")
            yield Input(value=cfg.hostname or "rpi01", id="hostname")

            yield Static("🔐  Sanity Token", classes="section")
            yield Label("Write Token  (sanity.io/manage → API → Tokens → Editor)")
            yield Input(value=cfg.sanity_token or SANITY_TOKEN, password=True, id="token")

            yield Static("📶  WLAN-Netzwerke", classes="section")
            yield Container(id="wifi-list")
            yield Button("＋  WLAN hinzufügen", id="add-wifi")

            yield Static("🛡️   SD-Karten-Schutz", classes="section")
            yield Checkbox(
                "Overlay-Filesystem aktivieren  (schützt SD-Karte bei Stromausfall)",
                id="overlay",
                value=False,
            )
            yield Static(
                "⚠  Logs und temporäre Dateien gehen bei Neustart verloren.\n"
                "   Inhalte in /var/www/museum bleiben permanent gespeichert.",
                classes="label",
            )

            yield Static("─" * 50, classes="divider")
            with Horizontal():
                yield Button("←  Zurück", id="back")
                yield Button("🚀  Setup starten", id="run", variant="primary")

    def on_mount(self):
        self._refresh_wifi()

    def _refresh_wifi(self):
        container = self.query_one("#wifi-list")
        container.remove_children()
        for i, net in enumerate(self.app.config.wifi_networks):
            label = f"📶  {net.ssid or '(leer)'}{'  [' + net.description + ']' if net.description else ''}"
            container.mount(Horizontal(
                Static(label, classes="wifi-label"),
                Button("✗", id=f"rm_{i}", classes="rm-btn"),
            ))

    @on(Button.Pressed, "#add-wifi")
    def open_wifi_modal(self):
        def on_result(net: Optional[WiFiNetwork]):
            if net:
                net.priority = max(1, 10 - len(self.app.config.wifi_networks))
                self.app.config.wifi_networks.append(net)
                self._refresh_wifi()
        self.app.push_screen(AddWifiModal(), on_result)

    def on_button_pressed(self, event: Button.Pressed):
        if event.button.id and event.button.id.startswith("rm_"):
            idx = int(event.button.id[3:])
            self.app.config.wifi_networks.pop(idx)
            self._refresh_wifi()

    @on(Button.Pressed, "#back")
    def back(self): self.app.pop_screen()

    @on(Button.Pressed, "#run")
    def run_setup(self):
        cfg = self.app.config
        cfg.kiosk_id     = self.query_one("#kiosk-id", Input).value.strip()
        cfg.hostname     = self.query_one("#hostname", Input).value.strip()
        cfg.sanity_token = self.query_one("#token", Input).value.strip()
        cfg.overlay_fs   = self.query_one("#overlay", Checkbox).value
        self.app.push_screen(ProgressScreen())


class ProgressScreen(Screen):
    def compose(self) -> ComposeResult:
        with Container(id="progress"):
            yield Static("🔧  Setup läuft...", classes="title")
            yield Static("", id="step-label")
            yield Log(id="log", auto_scroll=True)
            yield Button("✓  Fertig — nächste Schritte", id="done", variant="success", disabled=True)

    def on_mount(self):
        self._run()

    def _log(self, msg: str):
        self.app.call_from_thread(self.query_one("#log", Log).write_line, msg)

    def _step(self, name: str):
        self.app.call_from_thread(self.query_one("#step-label", Static).update, f"▶  {name}")
        self._log(f"\n── {name} ──")

    def _cmd(self, ssh: "SSH", cmd: str, sudo: bool = False, timeout: int = 120) -> tuple[int, str, str]:
        """Run command and log any stderr output."""
        code, out, err = ssh.run(cmd, sudo=sudo, timeout=timeout)
        # Strip sudo password prompt from stderr
        err_clean = "\n".join(
            ln for ln in err.splitlines()
            if not ln.strip().startswith("[sudo]") and "password for" not in ln
        )
        if err_clean:
            self._log(f"  › {err_clean[:300]}")
        if code not in (0,):
            self._log(f"  exit {code}")
        return code, out, err

    @work(thread=True)
    def _run(self):
        cfg = self.app.config
        ssh = SSH(cfg.host, self.app.ssh_user, self.app.ssh_password)

        self._step(f"Verbinde mit {cfg.host}…")
        if not ssh.connect():
            self._log(f"✗  Verbindung fehlgeschlagen: {cfg.host}")
            self._log("   → Pi eingeschaltet?  Im gleichen Netzwerk?  Passwort korrekt?")
            self.app.call_from_thread(self._enable_done)
            return

        self._log(f"✓  Verbunden")

        try:
            # ── 1. Packages ────────────────────────────────────────────────
            self._step("📦  Pakete installieren  (kann 3–5 Min dauern)")
            code, _, _ = self._cmd(ssh,
                "apt-get update -qq && apt-get install -y -qq "
                "nginx chromium jq wget rsync unzip curl python3 unclutter labwc",
                sudo=True, timeout=360
            )
            self._log("✓  Pakete installiert" if code == 0 else "⚠  Pakete — siehe Fehler oben")

            # ── 2. Web root ────────────────────────────────────────────────
            self._step("📁  Web-Root erstellen")
            self._cmd(ssh, "mkdir -p /var/www/museum/videos && chown -R www-data:www-data /var/www/museum", sudo=True)
            self._log("✓  /var/www/museum")

            # ── 3. Upload scripts ──────────────────────────────────────────
            self._step("📜  Skripte hochladen")
            self._cmd(ssh, "mkdir -p /tmp/museum-setup")
            scripts = ["sync-build.sh", "sync-videos.sh", "sync-content.sh", "heartbeat.sh",
                       "nginx.conf", "museum-sync.service",
                       "chromium-kiosk.service", "labwc-autostart"]
            for name in scripts:
                src = SCRIPTS_SRC / name
                if src.exists():
                    ssh.upload(src, f"/tmp/museum-setup/{name}")
                    self._log(f"  ↑ {name}")
                else:
                    self._log(f"  ⚠  nicht gefunden: {src}")

            self._cmd(ssh,
                "cp /tmp/museum-setup/sync-*.sh /tmp/museum-setup/heartbeat.sh /usr/local/bin/ && "
                "chmod +x /usr/local/bin/sync-*.sh /usr/local/bin/heartbeat.sh",
                sudo=True
            )
            self._log("✓  Skripte in /usr/local/bin/")

            # ── 4. nginx ───────────────────────────────────────────────────
            self._step("🌐  nginx konfigurieren")
            code, _, _ = self._cmd(ssh,
                "cp /tmp/museum-setup/nginx.conf /etc/nginx/sites-available/museum && "
                "rm -f /etc/nginx/sites-enabled/default && "
                "ln -sf /etc/nginx/sites-available/museum /etc/nginx/sites-enabled/museum && "
                "nginx -t",
                sudo=True
            )
            self._log("✓  nginx konfiguriert" if code == 0 else "⚠  nginx config — siehe Fehler oben")

            # ── 5. Kiosk user ──────────────────────────────────────────────
            self._step("👤  Kiosk-User sicherstellen")
            kiosk_user = self.app.ssh_user
            self._cmd(ssh,
                f"id '{kiosk_user}' &>/dev/null || ("
                f"adduser --disabled-password --gecos 'Museum Kiosk' '{kiosk_user}' && "
                f"usermod -aG video,audio,input,render '{kiosk_user}')",
                sudo=True
            )
            self._log(f"✓  User {kiosk_user}")

            # ── 6. systemd services ────────────────────────────────────────
            self._step("🖥️   Kiosk-Service einrichten")

            # System-level: nginx + museum-sync (sync scripts on boot)
            self._cmd(ssh,
                "cp /tmp/museum-setup/museum-sync.service /etc/systemd/system/ && "
                "systemctl daemon-reload && "
                "systemctl enable nginx museum-sync",
                sudo=True
            )
            self._log("✓  nginx + museum-sync aktiviert")

            # User-level: Chromium kiosk via labwc autostart
            # (runs in the Wayland session — no hardcoded socket paths)
            self._cmd(ssh,
                "mkdir -p ~/.config/systemd/user ~/.config/labwc && "
                "cp /tmp/museum-setup/chromium-kiosk.service ~/.config/systemd/user/ && "
                "cp /tmp/museum-setup/labwc-autostart ~/.config/labwc/autostart && "
                "systemctl --user daemon-reload && "
                "systemctl --user enable chromium-kiosk.service"
            )
            self._log("✓  chromium-kiosk user-service aktiviert")

            # Enable linger so user services start without interactive login
            self._cmd(ssh, f"loginctl enable-linger {self.app.ssh_user}", sudo=True)

            # Remove legacy system kiosk.service if it exists
            self._cmd(ssh,
                "systemctl disable kiosk.service 2>/dev/null || true && "
                "systemctl stop kiosk.service 2>/dev/null || true && "
                "rm -f /etc/systemd/system/kiosk.service && "
                "systemctl daemon-reload",
                sudo=True
            )
            self._log("✓  Legacy kiosk.service entfernt (falls vorhanden)")

            # ── 7. Identity ────────────────────────────────────────────────
            self._step("🔑  Kiosk-ID speichern")
            self._cmd(ssh, "mkdir -p /etc/museum-kiosk", sudo=True)
            ssh.write(
                "/etc/museum-kiosk/kiosk-id.json",
                f'{{"kioskId": "{cfg.kiosk_id}"}}\n',
                sudo=True
            )
            self._log(f"✓  Kiosk-ID: {cfg.kiosk_id}")

            # ── 8. Sanity token ────────────────────────────────────────────
            if cfg.sanity_token:
                self._step("🔐  Sanity Token speichern")
                ssh.write("/etc/museum-kiosk/sanity-token", cfg.sanity_token + "\n", sudo=True, mode=0o600)
                self._log("✓  Token gespeichert")

            # ── 9. WiFi ────────────────────────────────────────────────────
            if cfg.wifi_networks:
                self._step("📶  WLAN konfigurieren")
                code, _, _ = self._cmd(ssh, "which nmcli")
                use_nm = (code == 0)
                self._log(f"  Methode: {'NetworkManager' if use_nm else 'wpa_supplicant'}")

                for net in cfg.wifi_networks:
                    if not net.ssid:
                        continue
                    if use_nm:
                        # Delete existing profile first (ignore errors), then add a
                        # persistent connection profile. Using `connection add` instead
                        # of `device wifi connect` so the network does NOT need to be
                        # in range at setup time — it will connect automatically on boot.
                        # `ifname wlan0` binds the profile to the WiFi interface explicitly.
                        wlan_cmd = (
                            f"nmcli connection delete '{net.ssid}' 2>/dev/null || true && "
                            f"nmcli connection add "
                            f"type wifi "
                            f"ifname wlan0 "
                            f"con-name '{net.ssid}' "
                            f"ssid '{net.ssid}' "
                            f"-- "
                            f"wifi-sec.key-mgmt wpa-psk "
                            f"wifi-sec.psk '{net.password}' "
                            f"connection.autoconnect yes "
                            f"connection.autoconnect-priority {net.priority}"
                        )
                    else:
                        # Fallback: wpa_supplicant (pre-Bookworm systems)
                        wlan_cmd = (
                            f"wpa_passphrase '{net.ssid}' '{net.password}' >> /etc/wpa_supplicant/wpa_supplicant.conf && "
                            f"wpa_cli -i wlan0 reconfigure || true"
                        )
                    c, _, _ = self._cmd(ssh, wlan_cmd, sudo=True, timeout=30)
                    self._log(f"  {'✓' if c == 0 else '⚠'}  {net.ssid} (priority {net.priority})")

            # ── 10. Cron ───────────────────────────────────────────────────
            self._step("⏰  Cron-Jobs einrichten")
            cron = "\n".join([
                "* * * * * /usr/local/bin/heartbeat.sh >> /var/log/heartbeat.log 2>&1",
                "*/5 * * * * /usr/local/bin/sync-content.sh >> /var/log/sync-content.log 2>&1",
                "*/15 * * * * /usr/local/bin/sync-build.sh >> /var/log/sync-build.log 2>&1",
                "0 2 * * * /usr/local/bin/sync-videos.sh >> /var/log/sync-videos.log 2>&1",
            ])
            ssh.write("/tmp/museum-cron", cron + "\n")
            self._cmd(ssh, "crontab /tmp/museum-cron && rm /tmp/museum-cron", sudo=True)
            self._log("✓  Cron-Jobs gesetzt")

            # ── 11. Log rotation ───────────────────────────────────────────
            self._step("📋  Log-Rotation konfigurieren")
            logrotate_conf = (
                "/var/log/heartbeat.log\n"
                "/var/log/sync-content.log\n"
                "/var/log/sync-build.log\n"
                "/var/log/sync-videos.log\n"
                "{\n    daily\n    rotate 7\n    compress\n    missingok\n    notifempty\n}\n"
            )
            ssh.write("/etc/logrotate.d/museum-kiosk", logrotate_conf, sudo=True)
            self._log("✓  Log-Rotation konfiguriert")

            # ── 10. Initial sync ───────────────────────────────────────────
            self._step("🔄  Initialer Content-Sync")
            code, _, _ = self._cmd(ssh, "/usr/local/bin/sync-content.sh", sudo=True, timeout=60)
            self._log("✓  Content gecacht" if code == 0 else "⚠  Sync fehlgeschlagen — wird beim nächsten Cron-Lauf wiederholt")

            # ── 11. Overlay Filesystem (optional) ─────────────────────────
            if cfg.overlay_fs:
                self._step("🛡️   Overlay-Filesystem aktivieren")
                code, _, _ = self._cmd(ssh, "raspi-config nonint do_overlayfs 0", sudo=True, timeout=30)
                self._log("✓  Overlay-FS aktiviert — SD-Karte ist nach Neustart geschützt" if code == 0 else "⚠  Overlay-FS fehlgeschlagen")

            # ── 12. Start ──────────────────────────────────────────────────
            self._step("🚀  Services starten")
            self._cmd(ssh, "systemctl start nginx", sudo=True)
            self._cmd(ssh, "systemctl start museum-sync", sudo=True)
            self._log("✓  nginx gestartet")
            self._log("✓  museum-sync gestartet")
            self._log("   Chromium startet beim nächsten Reboot via labwc autostart")

            # ── Done ───────────────────────────────────────────────────────
            self._log("\n" + "═" * 50)
            self._log("✅  Setup erfolgreich abgeschlossen!")
            self._log(f"   Kiosk-ID : {cfg.kiosk_id}")
            self._log(f"   Host     : {cfg.host}")
            self._log("═" * 50)
            self.app.call_from_thread(
                self.query_one("#step-label", Static).update,
                "✅  Setup abgeschlossen!"
            )

        except Exception as e:
            self._log(f"\n✗  Fehler: {e}")
        finally:
            ssh.close()
            self.app.call_from_thread(self._enable_done)

    def _enable_done(self):
        self.query_one("#done", Button).disabled = False

    @on(Button.Pressed, "#done")
    def go_done(self):
        self.app.push_screen(DoneScreen())


class DoneScreen(Screen):
    def compose(self) -> ComposeResult:
        cfg = self.app.config
        with Container(id="done"):
            yield Static("🎉  Fertig!", classes="title")
            yield Static(
                f"Pi erfolgreich eingerichtet!\n\n"
                f"  Kiosk-ID  :  {cfg.kiosk_id}\n"
                f"  Host      :  {cfg.host}\n\n"
                f"Nächste Schritte:\n\n"
                f"  1.  Pi neustarten:\n"
                f"      ssh {PI_USER}@{cfg.host} 'sudo reboot'\n\n"
                f"  2.  In Sanity Studio:\n"
                f"      → Kiosk-Geräte → Neu erstellen\n"
                f"      → Kiosk-ID: {cfg.kiosk_id}\n"
                f"      → Ausstellung zuweisen\n\n"
                f"  3.  Nach ~2 Minuten prüfen:\n"
                f"      → Sanity → Kiosk-Geräte → {cfg.kiosk_id}\n"
                f"      → System-Tab → 🟢 Online",
                id="done-info"
            )
            with Horizontal():
                yield Button("🔄  Weiteren Pi einrichten", id="another")
                yield Button("↺  Pi neustarten", id="reboot", variant="warning")
                yield Button("✓  Beenden", id="quit", variant="primary")

    @on(Button.Pressed, "#another")
    def another(self):
        self.app.config = PiConfig(wifi_networks=list(DEFAULT_WIFI))
        self.app.push_screen(DiscoverScreen())

    @on(Button.Pressed, "#reboot")
    def reboot(self):
        cfg = self.app.config
        ssh = SSH(cfg.host, self.app.ssh_user, self.app.ssh_password)
        if ssh.connect():
            ssh.run("reboot", sudo=True)
            ssh.close()
        self.query_one("#reboot", Button).label = "↺  Neustart gesendet"
        self.query_one("#reboot", Button).disabled = True

    @on(Button.Pressed, "#quit")
    def quit(self):
        self.app.exit()


# ── App ────────────────────────────────────────────────────────────────────────

CSS = """
Screen        { background: #0f0f1a; color: #e0e0e0; }

/* Welcome */
#welcome      { align: center middle; height: 100%; padding: 2 4; }
#logo         { color: #c8a96e; text-align: center; }
#subtitle     { color: #ffffff; text-style: bold; text-align: center; margin: 1 0; }
#desc         { color: #888888; text-align: center; margin: 0 0 2 0; }

/* Layout */
#discover, #config, #progress, #done {
    padding: 1 4;
    height: 100%;
}

/* Typography */
.title    { color: #c8a96e; text-style: bold; margin: 0 0 1 0; }
.section  { color: #c8a96e; text-style: bold; margin: 1 0 0 0; }
.label    { color: #999999; }
.divider  { color: #2a2a4a; margin: 1 0; }

/* Inputs */
Input     { margin: 0 0 1 0; }
Label     { color: #aaaaaa; margin: 0; }

/* Buttons */
Button    { margin: 0 1 0 0; }

/* WiFi list */
.wifi-label  { width: 1fr; color: #cccccc; margin: 0 1 0 0; }
.rm-btn      { min-width: 3; width: 3; }

/* Log */
Log       { border: solid #2a2a4a; height: 1fr; min-height: 10; margin: 1 0; }

/* Progress screen done button — keep it compact */
#done     { height: 3; min-height: 3; max-height: 3; }

/* Modal */
AddWifiModal > Container {
    width: 60;
    height: auto;
    background: #16213e;
    border: solid #c8a96e;
    padding: 2 3;
    align: center middle;
}
#modal > .title  { color: #c8a96e; }

/* Done */
#done-info {
    background: #16213e;
    border: solid #2a2a4a;
    padding: 1 2;
    margin: 1 0;
    color: #e0e0e0;
}

/* Step label */
#step-label { color: #c8a96e; margin: 0 0 1 0; }
"""


class MuseumSetupApp(App):
    TITLE = "Museum Grünes Haus — Pi Setup"
    CSS   = CSS

    def __init__(self):
        super().__init__()
        self.config       = PiConfig(wifi_networks=list(DEFAULT_WIFI))
        self.ssh_user     = PI_USER
        self.ssh_password = PI_PASSWORD

    def on_mount(self):
        self.push_screen(WelcomeScreen())


if __name__ == "__main__":
    MuseumSetupApp().run()
