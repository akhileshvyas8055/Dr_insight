"""
Rebuild the SQLite database from the regenerated CSV files.
"""
import sqlite3
import csv
import os

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, "backend", "dr_insights.db")
PROCESSED = os.path.join(BASE, "database", "processed")

# Remove old DB
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"🗑️  Removed old database: {DB_PATH}")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# ── Create tables ──────────────────────────────────────────────────────────
cur.executescript("""
CREATE TABLE IF NOT EXISTS cities (
    city_id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    coverage_type TEXT,
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE TABLE IF NOT EXISTS procedures (
    procedure_id TEXT PRIMARY KEY,
    procedure_name TEXT NOT NULL,
    benchmark_rate NUMERIC,
    source_count INTEGER,
    category TEXT,
    data_nature TEXT
);

CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id TEXT PRIMARY KEY,
    hospital_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode INTEGER,
    hospital_type TEXT,
    ownership_type TEXT,
    rating NUMERIC,
    beds INTEGER,
    specialities TEXT,
    source_type TEXT,
    record_nature TEXT
);

CREATE TABLE IF NOT EXISTS hospital_prices (
    hospital_id TEXT,
    hospital_name TEXT,
    city TEXT,
    state TEXT,
    procedure_id TEXT,
    procedure_name TEXT,
    category TEXT,
    benchmark_rate_real NUMERIC,
    listed_price_demo NUMERIC,
    package_price_demo NUMERIC,
    price_source_type TEXT,
    data_nature TEXT
);

CREATE TABLE IF NOT EXISTS survey_billing (
    city TEXT,
    hospital_name TEXT,
    hospital_type TEXT,
    procedure_category TEXT,
    procedure_name TEXT,
    amount_paid NUMERIC,
    initial_quote NUMERIC,
    hidden_charges TEXT,
    hidden_charge_amount NUMERIC,
    insurance_type TEXT,
    year INTEGER,
    rating NUMERIC,
    would_return TEXT,
    comments TEXT
);

CREATE TABLE IF NOT EXISTS hospital_locations (
    hospital_name TEXT,
    city TEXT,
    type TEXT,
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_hospital_prices_city_procedure ON hospital_prices(city, procedure_name);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_pincode ON hospitals(pincode);

CREATE TABLE IF NOT EXISTS city_distances (
    from_city TEXT,
    to_city TEXT,
    distance_km NUMERIC,
    travel_time_hours NUMERIC,
    bus_cost NUMERIC,
    train_cost NUMERIC,
    flight_cost NUMERIC,
    avg_hotel_per_night NUMERIC
);
""")
print("✅ Tables created")

# ── Load CSV data ──────────────────────────────────────────────────────────
def load_csv(table_name, filename):
    filepath = os.path.join(PROCESSED, filename)
    with open(filepath, encoding="utf-8") as f:
        reader = csv.reader(f)
        headers = next(reader)
        placeholders = ",".join(["?"] * len(headers))
        sql = f"INSERT INTO {table_name} ({','.join(headers)}) VALUES ({placeholders})"
        count = 0
        batch = []
        for row in reader:
            batch.append(row)
            count += 1
            if len(batch) >= 5000:
                cur.executemany(sql, batch)
                batch = []
        if batch:
            cur.executemany(sql, batch)
        conn.commit()
        print(f"  📥 {table_name}: {count} rows loaded from {filename}")

load_csv("cities", "cities.csv")
load_csv("procedures", "procedures.csv")
load_csv("hospitals", "hospitals.csv")
load_csv("hospital_prices", "hospital_prices.csv")
load_csv("survey_billing", "survey_billing.csv")

# Special loader for hospital_locations (user CSV has different column names)
def load_hospital_locations():
    filepath = os.path.join(PROCESSED, "hospital_locations.csv")
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        sql = "INSERT INTO hospital_locations (hospital_name, city, type, latitude, longitude) VALUES (?, ?, ?, ?, ?)"
        count = 0
        batch = []
        for row in reader:
            batch.append((
                row.get('Hospital Name', row.get('hospital_name', '')),
                row.get('City', row.get('city', '')),
                row.get('Type', row.get('type', '')),
                float(row.get('Latitude', row.get('latitude', 0)) or 0),
                float(row.get('Longitude', row.get('longitude', 0)) or 0),
            ))
            count += 1
            if len(batch) >= 5000:
                cur.executemany(sql, batch)
                batch = []
        if batch:
            cur.executemany(sql, batch)
        conn.commit()
        print(f"  📥 hospital_locations: {count} rows loaded")

load_hospital_locations()

# Propagate latitude/longitude mapped from hospital_locations to cities!
print("🌍 Syncing city coordinates...")
cur.execute('''
    UPDATE cities
    SET latitude = (SELECT latitude FROM hospital_locations WHERE hospital_locations.city = cities.city AND latitude IS NOT NULL LIMIT 1),
        longitude = (SELECT longitude FROM hospital_locations WHERE hospital_locations.city = cities.city AND longitude IS NOT NULL LIMIT 1)
''')
conn.commit()

# Autogenerate city_distances
print("🚗 Generating smart city distances internally...")
cur.execute('SELECT city, latitude, longitude FROM cities WHERE latitude IS NOT NULL')
valid_cities = cur.fetchall()

distance_batch = []
for i, c1 in enumerate(valid_cities):
    for c2 in valid_cities[i+1:]:
        import math
        # Quick Haversine approx
        lat1, lon1 = c1[1], c1[2]
        lat2, lon2 = c2[1], c2[2]
        R = 6371
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        distance = round(R * c)
        
        # Omit cities far away
        if distance > 1000: continue
        
        time_hrs = round(distance / 50.0, 1) # avg 50km/h
        bus = distance * 2 # 2₹/km
        train = distance * 1.5
        flight = distance * 8 if distance > 300 else None
        
        distance_batch.append((c1[0], c2[0], distance, time_hrs, bus, train, flight, 1500))
        distance_batch.append((c2[0], c1[0], distance, time_hrs, bus, train, flight, 1500))

if distance_batch:
    cur.executemany("INSERT INTO city_distances VALUES (?, ?, ?, ?, ?, ?, ?, ?)", distance_batch)
    conn.commit()
    print(f"✅ Generated {len(distance_batch)} cross-city connections!")



# ── Verify ─────────────────────────────────────────────────────────────────
print("\n📊 Verification:")
for table in ["cities", "procedures", "hospitals", "hospital_prices", "survey_billing", "hospital_locations"]:
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    count = cur.fetchone()[0]
    print(f"  {table}: {count} rows")

# Show some sample procedures
print("\n🩺 Sample procedures:")
cur.execute("SELECT procedure_name, benchmark_rate, category FROM procedures LIMIT 10")
for row in cur.fetchall():
    print(f"  {row[0]} — ₹{row[1]} ({row[2]})")

conn.close()
print(f"\n🎉 Database rebuilt: {DB_PATH}")
