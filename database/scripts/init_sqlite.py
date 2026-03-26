import sqlite3
import csv
import os

# Create SQLite database
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, '../../backend/dr_insights.db')
db_path = os.path.normpath(db_path)

# Ensure backend directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create tables
cursor.execute("""
CREATE TABLE IF NOT EXISTS cities (
    city_id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    coverage_type TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS procedures (
    procedure_id TEXT PRIMARY KEY,
    procedure_name TEXT NOT NULL,
    benchmark_rate REAL,
    source_count INTEGER,
    category TEXT,
    data_nature TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id TEXT PRIMARY KEY,
    hospital_name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode INTEGER,
    hospital_type TEXT,
    ownership_type TEXT,
    rating REAL,
    beds INTEGER,
    specialities TEXT,
    source_type TEXT,
    record_nature TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS hospital_prices (
    hospital_id TEXT,
    hospital_name TEXT,
    city TEXT,
    state TEXT,
    procedure_id TEXT,
    procedure_name TEXT,
    category TEXT,
    benchmark_rate_real REAL,
    listed_price_demo REAL,
    package_price_demo REAL,
    price_source_type TEXT,
    data_nature TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS survey_billing (
    city TEXT,
    hospital_name TEXT,
    hospital_type TEXT,
    procedure_category TEXT,
    procedure_name TEXT,
    amount_paid REAL,
    initial_quote REAL,
    hidden_charges TEXT,
    hidden_charge_amount REAL,
    insurance_type TEXT,
    year INTEGER,
    rating REAL,
    would_return TEXT,
    comments TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS hospital_locations (
    hospital_name TEXT,
    city TEXT,
    area TEXT,
    type TEXT,
    google_rating REAL,
    total_reviews INTEGER,
    beds INTEGER,
    nabh TEXT,
    specialities TEXT,
    latitude REAL,
    longitude REAL
)
""")

# Create indexes
cursor.execute("CREATE INDEX IF NOT EXISTS idx_hospital_prices_city_procedure ON hospital_prices(city, procedure_name)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_hospitals_pincode ON hospitals(pincode)")

# Create views
cursor.execute("""
CREATE VIEW IF NOT EXISTS city_price_stats AS
SELECT city, state,
       COUNT(*) AS price_records,
       ROUND(AVG(package_price_demo),2) AS avg_price,
       ROUND(AVG(package_price_demo),2) AS median_price,
       MIN(package_price_demo) AS min_price,
       MAX(package_price_demo) AS max_price,
       ROUND((MAX(package_price_demo) - MIN(package_price_demo)),2) AS price_spread
FROM hospital_prices
GROUP BY city, state
""")

cursor.execute("""
CREATE VIEW IF NOT EXISTS procedure_variation_stats AS
SELECT procedure_name, category,
       COUNT(*) AS price_records,
       ROUND(AVG(package_price_demo),2) AS avg_price,
       ROUND(AVG(package_price_demo),2) AS median_price,
       MIN(package_price_demo) AS min_price,
       MAX(package_price_demo) AS max_price,
       ROUND((MAX(package_price_demo) - MIN(package_price_demo)),2) AS price_spread,
       ROUND((CASE WHEN AVG(package_price_demo) > 0 
              THEN (SELECT AVG((package_price_demo - avg_val) * (package_price_demo - avg_val)) 
                    FROM (SELECT AVG(package_price_demo) as avg_val FROM hospital_prices)) / AVG(package_price_demo)
              ELSE 0 END),4) AS cv_ratio
FROM hospital_prices
GROUP BY procedure_name, category
""")

cursor.execute("""
CREATE VIEW IF NOT EXISTS fair_price_reference AS
SELECT city, procedure_name,
       ROUND(AVG(package_price_demo),2) AS avg_price,
       ROUND(AVG(package_price_demo),2) AS median_price,
       MIN(package_price_demo) AS min_price,
       MAX(package_price_demo) AS max_price,
       ROUND(AVG(benchmark_rate_real),2) AS benchmark_rate_real
FROM hospital_prices
GROUP BY city, procedure_name
""")

cursor.execute("""
CREATE VIEW IF NOT EXISTS healthcare_desert_view AS
SELECT c.city, c.state, c.coverage_type,
       COUNT(h.hospital_id) AS hospital_count,
       ROUND(AVG(h.beds),2) AS avg_beds
FROM cities c
LEFT JOIN hospitals h ON h.city = c.city AND h.state = c.state
GROUP BY c.city, c.state, c.coverage_type
""")

conn.commit()

# Load CSV data
processed_dir = os.path.join(script_dir, '../processed')
processed_dir = os.path.normpath(processed_dir)

def load_csv(table_name, csv_file):
    csv_path = os.path.join(processed_dir, csv_file)
    if not os.path.exists(csv_path):
        print(f"Warning: {csv_path} not found, skipping...")
        return
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        if not rows:
            print(f"Warning: {csv_file} is empty")
            return
        
        columns = list(rows[0].keys())
        placeholders = ','.join(['?' for _ in columns])
        
        for row in rows:
            values = [row[col] if row[col] != '' else None for col in columns]
            cursor.execute(f"INSERT INTO {table_name} ({','.join(columns)}) VALUES ({placeholders})", values)
    
    print(f"Loaded {len(rows)} rows into {table_name}")

print("Loading data from CSV files...")
load_csv('cities', 'cities.csv')
load_csv('procedures', 'procedures.csv')
load_csv('hospitals', 'hospitals.csv')
load_csv('hospital_prices', 'hospital_prices.csv')
load_csv('survey_billing', 'survey_billing.csv')
load_csv('hospital_locations', 'hospital_locations.csv')

conn.commit()
conn.close()

print(f"\nSQLite database created successfully at {db_path}")
