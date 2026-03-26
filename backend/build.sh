#!/usr/bin/env bash
# dr-insights/backend/build.sh
set -o errexit

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Depending on your app directory structure, rebuild_db might be in root or backend
echo "Rebuilding Database into Render Disk..."
# To find and run rebuild_db.py correctly from root or backend
if [ -f "../rebuild_db.py" ]; then
    python ../rebuild_db.py
elif [ -f "rebuild_db.py" ]; then
    python rebuild_db.py
else
    echo "rebuild_db.py not found in backend or root, database might not recreate successfully if not pushed."
fi

echo "Build complete."
