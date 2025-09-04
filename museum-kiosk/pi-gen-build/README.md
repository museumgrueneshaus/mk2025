# Museum Kiosk - Raspberry Pi Image Builder

Custom Raspberry Pi image for Museum Kiosk displays using Pi-Gen.

## Features

- ✅ **Auto-start Kiosk Mode**: Boots directly into full-screen browser
- ✅ **Zero Configuration**: Works out of the box with MAC address detection
- ✅ **Remote Management**: SSH enabled for maintenance
- ✅ **Health Monitoring**: Auto-restart on crash, memory management
- ✅ **Minimal OS**: Only essential packages, fast boot
- ✅ **Offline Capable**: Works without internet after initial setup

## Quick Start

### 1. Build the Image (Linux/Debian/Ubuntu)

```bash
# Install on a Debian/Ubuntu system (or use Docker)
cd museum-kiosk/pi-gen-build

# Run build script (as root)
sudo ./build.sh

# Image will be created as: museum-kiosk-YYYYMMDD.img.xz
```

### 2. Write to SD Card

```bash
# Find your SD card device (be careful!)
lsblk

# Write image (replace sdX with your SD card)
xzcat museum-kiosk-*.img.xz | sudo dd of=/dev/sdX bs=4M status=progress conv=fsync
```

### 3. Configure Kiosk

Mount the SD card and edit two files:

**`/boot/museum-config/kiosk-id.txt`:**
```
pi_01
```
Change to `pi_02`, `pi_03`, etc. for each Raspberry Pi

**`/boot/museum-config/server.txt`:**
```
your-museum.netlify.app
```
Replace with your Netlify URL or local server address

### 4. Deploy

1. Insert SD card into Raspberry Pi
2. Connect Ethernet cable (or configure WiFi)
3. Power on
4. Kiosk starts automatically!

## Configuration

### Kiosk ID

Each Raspberry Pi needs a unique ID. Edit `/boot/museum-config/kiosk-id.txt`:
```
pi_01
```

Use sequential numbering: `pi_01`, `pi_02`, `pi_03`, etc.

### Server Address

Edit `/boot/museum-config/server.txt` on the boot partition:
```
your-museum.netlify.app
```

### WiFi Setup (Optional)

Create `/boot/wpa_supplicant.conf`:
```
country=DE
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="Museum-WiFi"
    psk="your-password"
}
```

### SSH Access

- User: `museum`
- Password: `museum2024`
- Connect: `ssh museum@<pi-ip-address>`

### Kiosk URLs

Each Pi will open:
- `https://your-museum.netlify.app/viewer/pi_01`
- `https://your-museum.netlify.app/viewer/pi_02`
- etc.

## Management Commands

Once logged in via SSH:

- `museum-status` - Show kiosk status
- `museum-restart` - Restart kiosk browser
- `museum-logs` - View recent logs
- `museum-config` - Edit server configuration

## Building with Docker (Alternative)

If you're not on a Debian-based system:

```bash
# Build Docker image
docker build -t pigen-builder .

# Run build in container
docker run --rm --privileged \
  -v $(pwd):/workspace \
  pigen-builder

# Image will be in current directory
```

## Project Structure

```
pi-gen-build/
├── config                    # Pi-Gen configuration
├── stage-museum/            # Custom stage
│   ├── 00-configure-apt/   # APT configuration
│   ├── 01-kiosk-packages/  # Package installation
│   ├── 02-kiosk-setup/     # Kiosk configuration
│   │   └── files/
│   │       ├── start-kiosk.sh        # Main startup script
│   │       ├── health-check.sh       # Health monitoring
│   │       ├── museum-kiosk.service  # Systemd service
│   │       └── kiosk-openbox-config  # Window manager config
│   └── 03-museum-branding/  # Branding & customization
├── build.sh                 # Build script
├── Dockerfile              # Docker build environment
└── README.md              # This file
```

## Customization

### Change Display Resolution

Edit `start-kiosk.sh`:
```bash
--window-size=1920,1080  # Change to your display resolution
```

### Rotate Display

Add to `/boot/config.txt`:
```
display_rotate=1  # 90 degrees
display_rotate=2  # 180 degrees
display_rotate=3  # 270 degrees
```

### Custom Splash Screen

Replace `/usr/share/plymouth/themes/pix/splash.png`

### Network Settings

For static IP, edit `/etc/dhcpcd.conf`:
```
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8
```

## Troubleshooting

### Black Screen

1. Check server is accessible: `ping <server-ip>`
2. Check logs: `museum-logs`
3. Restart kiosk: `museum-restart`

### No Network

1. Check cable connection
2. For WiFi, verify `/boot/wpa_supplicant.conf`
3. Check network status: `ip addr`

### Browser Crashes

- Auto-restart is enabled (10 second delay)
- Check logs: `journalctl -u museum-kiosk -n 50`
- Manual restart: `sudo systemctl restart museum-kiosk`

### Access Terminal

- Press `Ctrl+Alt+F2` for terminal
- Login with museum/museum2024
- Return to kiosk: `Ctrl+Alt+F1`

## Performance Tuning

### For Raspberry Pi 4

Add to `/boot/config.txt`:
```
gpu_mem=128
hdmi_enable_4kp60=1
```

### For Older Models

Add to `/boot/config.txt`:
```
gpu_mem=64
disable_overscan=1
```

## Security

For production deployment:

1. **Change default password**:
   ```bash
   passwd museum
   ```

2. **Disable SSH** (if not needed):
   ```bash
   sudo systemctl disable ssh
   ```

3. **Firewall rules**:
   ```bash
   sudo apt install ufw
   sudo ufw allow from 192.168.1.0/24 to any port 22
   sudo ufw enable
   ```

## Updates

To update the kiosk software without rebuilding:

```bash
# SSH into the Pi
ssh museum@<pi-ip>

# Update start script
sudo nano /home/museum/start-kiosk.sh

# Restart
museum-restart
```

## Multi-Display Setup

For multiple displays with different content:

1. Each Pi has a unique ID (`pi_01`, `pi_02`, etc.)
2. Configure content for each ID in your deployment
3. One image works for all - just change the ID file

### Example Deployment:

```
Museum Floor 1:
- pi_01 → Entrance display
- pi_02 → Exhibition Room A
- pi_03 → Exhibition Room B

Museum Floor 2:
- pi_04 → Modern Art Section
- pi_05 → Interactive Display
```

## Support

- Issues: Create issue in GitHub repository
- Logs location: `/var/log/museum-kiosk-health.log`
- System logs: `journalctl -u museum-kiosk`

## License

MIT License - Free for commercial and non-commercial use.

## Version History

- **1.0.0** - Initial release
  - Auto-start kiosk mode
  - Health monitoring
  - Network configuration
  - Custom branding

---

Built with ❤️ for Museums