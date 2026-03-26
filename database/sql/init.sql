CREATE TABLE IF NOT EXISTS cities (
    city_id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    coverage_type TEXT
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
    area TEXT,
    type TEXT,
    google_rating NUMERIC,
    total_reviews INTEGER,
    beds INTEGER,
    nabh TEXT,
    specialities TEXT,
    latitude NUMERIC,
    longitude NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_hospital_prices_city_procedure ON hospital_prices(city, procedure_name);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_pincode ON hospitals(pincode);

CREATE OR REPLACE VIEW city_price_stats AS
SELECT city, state,
       COUNT(*) AS price_records,
       ROUND(AVG(package_price_demo)::numeric,2) AS avg_price,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package_price_demo)::numeric,2) AS median_price,
       MIN(package_price_demo) AS min_price,
       MAX(package_price_demo) AS max_price,
       ROUND((MAX(package_price_demo) - MIN(package_price_demo))::numeric,2) AS price_spread
FROM hospital_prices
GROUP BY city, state;

CREATE OR REPLACE VIEW procedure_variation_stats AS
SELECT procedure_name, category,
       COUNT(*) AS price_records,
       ROUND(AVG(package_price_demo)::numeric,2) AS avg_price,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package_price_demo)::numeric,2) AS median_price,
       MIN(package_price_demo) AS min_price,
       MAX(package_price_demo) AS max_price,
       ROUND((MAX(package_price_demo) - MIN(package_price_demo))::numeric,2) AS price_spread,
       ROUND((STDDEV_POP(package_price_demo) / NULLIF(AVG(package_price_demo),0))::numeric,4) AS cv_ratio
FROM hospital_prices
GROUP BY procedure_name, category;

CREATE OR REPLACE VIEW fair_price_reference AS
SELECT city, procedure_name,
       ROUND(AVG(package_price_demo)::numeric,2) AS avg_price,
       ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY package_price_demo)::numeric,2) AS median_price,
       MIN(package_price_demo) AS min_price,
       MAX(package_price_demo) AS max_price,
       ROUND(AVG(benchmark_rate_real)::numeric,2) AS benchmark_rate_real
FROM hospital_prices
GROUP BY city, procedure_name;

CREATE OR REPLACE VIEW healthcare_desert_view AS
SELECT c.city, c.state, c.coverage_type,
       COUNT(h.hospital_id) AS hospital_count,
       ROUND(AVG(h.beds)::numeric,2) AS avg_beds
FROM cities c
LEFT JOIN hospitals h ON h.city = c.city AND h.state = c.state
GROUP BY c.city, c.state, c.coverage_type;


COPY cities FROM '/seed/cities.csv' DELIMITER ',' CSV HEADER;
COPY procedures FROM '/seed/procedures.csv' DELIMITER ',' CSV HEADER;
COPY hospitals FROM '/seed/hospitals.csv' DELIMITER ',' CSV HEADER;
COPY hospital_prices FROM '/seed/hospital_prices.csv' DELIMITER ',' CSV HEADER;
COPY survey_billing FROM '/seed/survey_billing.csv' DELIMITER ',' CSV HEADER;
COPY hospital_locations FROM '/seed/hospital_locations.csv' DELIMITER ',' CSV HEADER;
