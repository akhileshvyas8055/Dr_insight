import os
from pathlib import Path
import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+psycopg://postgres:postgres@localhost:5432/dr_insights')
engine = create_engine(DATABASE_URL)
processed = Path(__file__).resolve().parents[1] / 'processed'

load_order = [
    ('cities.csv', 'cities'),
    ('procedures.csv', 'procedures'),
    ('hospitals.csv', 'hospitals'),
    ('hospital_prices.csv', 'hospital_prices'),
    ('survey_billing.csv', 'survey_billing'),
    ('hospital_locations.csv', 'hospital_locations'),
]

for csv_name, table in load_order:
    df = pd.read_csv(processed / csv_name)
    df.to_sql(table, engine, if_exists='append', index=False, method='multi', chunksize=5000)
    print(f'Loaded {csv_name} -> {table}: {len(df)} rows')
