"""
Regenerate all seed data with simpler, everyday medical procedures.
Replaces complex cardiac procedures with common ones like CT Scan, Blood Test, etc.
"""
import csv
import random
import os

random.seed(42)

BASE = os.path.dirname(os.path.abspath(__file__))
PROCESSED = os.path.join(BASE, "database", "processed")

# ── New simple procedures with realistic Indian benchmark rates ─────────────
PROCEDURES = [
    ("PROC001", "CT Scan - Brain", 3500, "Imaging"),
    ("PROC002", "CT Scan - Chest", 4000, "Imaging"),
    ("PROC003", "CT Scan - Abdomen", 4500, "Imaging"),
    ("PROC004", "MRI - Brain", 7000, "Imaging"),
    ("PROC005", "MRI - Spine", 8000, "Imaging"),
    ("PROC006", "MRI - Knee", 6500, "Imaging"),
    ("PROC007", "X-Ray - Chest", 500, "Imaging"),
    ("PROC008", "X-Ray - Limb", 400, "Imaging"),
    ("PROC009", "Ultrasound - Abdomen", 1200, "Imaging"),
    ("PROC010", "Ultrasound - Pelvis", 1500, "Imaging"),
    ("PROC011", "Complete Blood Count (CBC)", 350, "Blood Test"),
    ("PROC012", "Lipid Profile", 600, "Blood Test"),
    ("PROC013", "Thyroid Function Test (TFT)", 700, "Blood Test"),
    ("PROC014", "Liver Function Test (LFT)", 800, "Blood Test"),
    ("PROC015", "Kidney Function Test (KFT)", 750, "Blood Test"),
    ("PROC016", "Blood Sugar Fasting", 100, "Blood Test"),
    ("PROC017", "HbA1c", 500, "Blood Test"),
    ("PROC018", "Vitamin D Test", 1200, "Blood Test"),
    ("PROC019", "Vitamin B12 Test", 900, "Blood Test"),
    ("PROC020", "Full Body Checkup - Basic", 2500, "Health Checkup"),
    ("PROC021", "Full Body Checkup - Advanced", 5000, "Health Checkup"),
    ("PROC022", "Full Body Checkup - Premium", 8000, "Health Checkup"),
    ("PROC023", "ECG (Electrocardiogram)", 300, "Cardiology"),
    ("PROC024", "2D Echocardiography", 2000, "Cardiology"),
    ("PROC025", "TMT (Treadmill Test)", 1500, "Cardiology"),
    ("PROC026", "Colonoscopy", 5000, "Procedure"),
    ("PROC027", "Endoscopy (Upper GI)", 3500, "Procedure"),
    ("PROC028", "Dental Cleaning", 1000, "Dental"),
    ("PROC029", "Dental Root Canal", 5000, "Dental"),
    ("PROC030", "Eye Checkup - Comprehensive", 800, "Ophthalmology"),
    ("PROC031", "Cataract Surgery", 25000, "Ophthalmology"),
    ("PROC032", "Normal Delivery", 20000, "Maternity"),
    ("PROC033", "C-Section Delivery", 45000, "Maternity"),
    ("PROC034", "Knee Replacement", 200000, "Orthopaedics"),
    ("PROC035", "Hip Replacement", 250000, "Orthopaedics"),
    ("PROC036", "Appendectomy", 35000, "General Surgery"),
    ("PROC037", "Hernia Repair", 40000, "General Surgery"),
    ("PROC038", "Gallbladder Removal (Cholecystectomy)", 50000, "General Surgery"),
    ("PROC039", "Tonsillectomy", 20000, "ENT"),
    ("PROC040", "Hearing Test (Audiometry)", 500, "ENT"),
    ("PROC041", "PET Scan", 15000, "Imaging"),
    ("PROC042", "Mammography", 2000, "Imaging"),
    ("PROC043", "Bone Density Test (DEXA Scan)", 2500, "Imaging"),
    ("PROC044", "Allergy Panel Test", 3000, "Blood Test"),
    ("PROC045", "COVID-19 RT-PCR Test", 500, "Blood Test"),
    ("PROC046", "Urine Routine Test", 200, "Blood Test"),
    ("PROC047", "Stool Test", 250, "Blood Test"),
    ("PROC048", "PSA Test (Prostate)", 800, "Blood Test"),
    ("PROC049", "Pap Smear Test", 600, "Procedure"),
    ("PROC050", "Physiotherapy Session", 800, "Rehabilitation"),
]

# ── Write procedures CSV ───────────────────────────────────────────────────
proc_path = os.path.join(PROCESSED, "procedures.csv")
with open(proc_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["procedure_id", "procedure_name", "benchmark_rate", "source_count", "category", "data_nature"])
    for pid, name, rate, cat in PROCEDURES:
        w.writerow([pid, name, float(rate), 1, cat, "realistic_benchmark_rates"])
print(f"✅ Wrote {len(PROCEDURES)} procedures → {proc_path}")

# ── Read existing hospitals ────────────────────────────────────────────────
hospitals_path = os.path.join(PROCESSED, "hospitals.csv")
hospitals = []
with open(hospitals_path, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        hospitals.append(row)
print(f"📂 Read {len(hospitals)} hospitals")

# ── Read existing cities ───────────────────────────────────────────────────
cities_path = os.path.join(PROCESSED, "cities.csv")
cities = []
with open(cities_path, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        cities.append(row)
print(f"📂 Read {len(cities)} cities")

# ── Generate hospital_prices with new procedures ───────────────────────────
prices_path = os.path.join(PROCESSED, "hospital_prices.csv")
price_count = 0

with open(prices_path, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow([
        "hospital_id", "hospital_name", "city", "state",
        "procedure_id", "procedure_name", "category",
        "benchmark_rate_real", "listed_price_demo", "package_price_demo",
        "price_source_type", "data_nature"
    ])
    
    for hosp in hospitals:
        hid = hosp["hospital_id"]
        hname = hosp["hospital_name"]
        hcity = hosp["city"]
        hstate = hosp["state"]
        
        # Each hospital offers a random subset of procedures (15-35 out of 50)
        num_procs = random.randint(15, 35)
        selected = random.sample(PROCEDURES, min(num_procs, len(PROCEDURES)))
        
        for pid, pname, benchmark, cat in selected:
            # Generate realistic price variation
            # City multiplier (metro cities are more expensive)
            metro_cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune"]
            tier2_cities = ["Jaipur", "Lucknow", "Chandigarh", "Kochi", "Ahmedabad", "Surat", "Vadodara", "Coimbatore", "Indore", "Bhopal", "Nagpur", "Visakhapatnam"]
            
            if hcity in metro_cities:
                city_mult = random.uniform(1.15, 1.60)
            elif hcity in tier2_cities:
                city_mult = random.uniform(0.90, 1.25)
            else:
                city_mult = random.uniform(0.70, 1.10)
            
            # Hospital type multiplier
            htype = hosp.get("hospital_type", "")
            if "Super" in htype or "Multi" in htype:
                hosp_mult = random.uniform(1.05, 1.30)
            else:
                hosp_mult = random.uniform(0.85, 1.10)
            
            package_price = round(benchmark * city_mult * hosp_mult)
            listed_price = round(package_price * random.uniform(1.05, 1.25))
            
            w.writerow([
                hid, hname, hcity, hstate,
                pid, pname, cat,
                float(benchmark), float(listed_price), float(package_price),
                "realistic_city_hospital_variation", "demo_price"
            ])
            price_count += 1

print(f"✅ Wrote {price_count} price rows → {prices_path}")

# ── Update survey_billing with new procedure names ─────────────────────────
survey_path = os.path.join(PROCESSED, "survey_billing.csv")
survey_rows = []
# Read existing survey data for structure reference
with open(survey_path, encoding="utf-8") as f:
    reader = csv.DictReader(f)
    existing_fields = reader.fieldnames
    for row in reader:
        survey_rows.append(row)

# Regenerate survey with new procedure names
new_survey = []
categories_for_survey = ["Imaging", "Blood Test", "Health Checkup", "Procedure", "Cardiology", "General Surgery"]
survey_procedures = [(p[1], p[2], p[3]) for p in PROCEDURES]

for i, row in enumerate(survey_rows):
    proc = random.choice(survey_procedures)
    row["procedure_name"] = proc[0]
    row["procedure_category"] = proc[2]
    # Adjust amounts to be realistic for these procedures
    benchmark = proc[1]
    row["amount_paid"] = str(round(benchmark * random.uniform(0.8, 1.8)))
    row["initial_quote"] = str(round(benchmark * random.uniform(1.0, 2.0)))
    if row.get("hidden_charges") == "Yes":
        row["hidden_charge_amount"] = str(round(benchmark * random.uniform(0.05, 0.3)))
    new_survey.append(row)

with open(survey_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=existing_fields)
    w.writeheader()
    w.writerows(new_survey)
print(f"✅ Updated {len(new_survey)} survey rows → {survey_path}")

print("\n🎉 Data regeneration complete! Now run the database rebuild script.")
