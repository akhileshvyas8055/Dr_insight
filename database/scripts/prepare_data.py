from pathlib import Path
import pandas as pd

root = Path(__file__).resolve().parents[2]
raw = root / 'data' / 'raw'
processed = root / 'database' / 'processed'
processed.mkdir(parents=True, exist_ok=True)

file_map = {
    'cities.csv': '02_cities_master_120.csv',
    'procedures.csv': '03_procedures_master_60_real.csv',
    'hospitals.csv': '04_hospitals_hackathon_hybrid_5200.csv',
    'hospital_prices.csv': '05_hospital_procedure_prices_hybrid.csv',
    'survey_billing.csv': 'survey_responses.csv',
    'hospital_locations.csv': 'hospitals_info.csv',
}

for out_name, src_name in file_map.items():
    df = pd.read_csv(raw / src_name)
    if out_name == 'survey_billing.csv':
        df['hidden_charge_amount'] = pd.to_numeric(df['hidden_charge_amount'], errors='coerce').fillna(0)
        df['amount_paid'] = pd.to_numeric(df['amount_paid'], errors='coerce')
        df['initial_quote'] = pd.to_numeric(df['initial_quote'], errors='coerce')
    df.to_csv(processed / out_name, index=False)

print('Prepared files in', processed)
