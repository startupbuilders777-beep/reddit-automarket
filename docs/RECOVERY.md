# System Recovery

## EC2 Full Recovery

### If EC2 Fails

1. **Recreate EC2**
```bash
# Launch new Ubuntu instance
# Install dependencies
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git

# Clone repos
git clone https://github.com/startupbuilders777-beep/reddit-automarket
cd reddit-automarket
npm install -g openclaw

# Start gateway
openclaw gateway start
```

## Cron Jobs (Recreate

```bash
# Sage PM
openclaw cron add --name "Sage" --schedule "30min" --message "Sage PM: Expand SuperClaw. Message Harry. Save learnings."
# ... etc for all crons
```

## Environment

- Node 20+
- Ubuntu 22.04
- OpenClaw CLI

## Backups

- GitHub repos (auto-pushed)
- Asana (tasks)
- Discord (history)
