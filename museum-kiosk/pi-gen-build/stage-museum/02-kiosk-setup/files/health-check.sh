#!/bin/bash

# Museum Kiosk Health Check Script
# Monitors the kiosk and restarts if necessary

LOG_FILE="/var/log/museum-kiosk-health.log"
SERVER_CONFIG="/boot/museum-config/server.txt"
MAX_RETRIES=3
RETRY_COUNT=0

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    echo "$1"
}

check_chromium() {
    if pgrep -f "chromium-browser.*kiosk" > /dev/null; then
        return 0
    else
        return 1
    fi
}

check_network() {
    # Check if we can reach the server
    if [ -f "$SERVER_CONFIG" ]; then
        SERVER=$(grep -v '^#' "$SERVER_CONFIG" | grep -v '^$' | head -n1 | cut -d: -f1)
        if ping -c 1 -W 2 "$SERVER" > /dev/null 2>&1; then
            return 0
        fi
    fi
    
    # Check general internet connectivity
    if ping -c 1 -W 2 8.8.8.8 > /dev/null 2>&1; then
        return 0
    fi
    
    return 1
}

restart_kiosk() {
    log_message "Restarting kiosk service..."
    systemctl restart museum-kiosk.service
    sleep 10
}

# Main health check loop
log_message "Health check started"

while true; do
    # Check if Chromium is running
    if ! check_chromium; then
        log_message "WARNING: Chromium not running!"
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -le $MAX_RETRIES ]; then
            restart_kiosk
        else
            log_message "ERROR: Max retries reached. Manual intervention required."
            # Send alert (could be email, webhook, etc.)
            # For now, just log
        fi
    else
        # Reset retry counter if Chromium is running
        if [ $RETRY_COUNT -gt 0 ]; then
            log_message "Chromium recovered successfully"
            RETRY_COUNT=0
        fi
    fi
    
    # Check network connectivity
    if ! check_network; then
        log_message "WARNING: Network connectivity issue detected"
        # Could trigger network restart here if needed
    fi
    
    # Check disk space
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        log_message "WARNING: Disk usage is at ${DISK_USAGE}%"
        # Clean up logs older than 7 days
        find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null
    fi
    
    # Check memory usage
    MEM_AVAILABLE=$(free -m | awk 'NR==2 {print $7}')
    if [ "$MEM_AVAILABLE" -lt 100 ]; then
        log_message "WARNING: Low memory available: ${MEM_AVAILABLE}MB"
        # Could restart Chromium to free memory
        if [ "$MEM_AVAILABLE" -lt 50 ]; then
            log_message "CRITICAL: Very low memory. Restarting kiosk..."
            restart_kiosk
        fi
    fi
    
    # Sleep for 60 seconds before next check
    sleep 60
done