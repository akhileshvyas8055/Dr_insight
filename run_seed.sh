#!/usr/bin/env bash
set -e
python database/scripts/prepare_data.py
python database/scripts/seed_from_csv.py
