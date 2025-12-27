
import csv
import json
import random

first_names = ["דוד", "משה", "יוסי", "אברהם", "יצחק", "יעקב", "שרה", "רבקה", "רחל", "לאה", "חיים", "שלמה", "עוז", "נועה", "תמר", "מיכל", "דניאל", "אריאל", "רוני", "טל"]
last_names = ["כהן", "לוי", "מזרחי", "פרץ", "ביטון", "דהן", "אברהם", "פרידמן", "מלכה", "אזולאי", "חדד", "גבאי", "יוסף", "שפירא", "ברק", "לב", "שמש", "סולומון", "רוזן", "גולן"]
companies = ["טכנולוגיות בע״מ", "עורכי דין שותפים", "סטודיו לעיצוב", "המרכז לריהוט", "שירותי ענן", "פתרונות פיננסיים", "נדל״ן ישראל", "ייבוא ושיווק", "משרד רואי חשבון", "סטארטאפ ניישן", "קייטרינג משובח", "מוסך הצפון", "דפוס דיגיטלי", "חנות פרחים", "ספא בוטיק"]
statuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]
sources = ["WEBSITE", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "REFERRAL", "COLD_CALL"]

leads = []
for i in range(50):
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    company = random.choice(companies)
    email = f"lead{i+1}@{random.randint(1000,9999)}.com"
    phone = f"05{random.randint(0,9)}-{random.randint(1000000, 9999999)}"
    lead = {
        "name": name,
        "email": email,
        "phone": phone,
        "company": company,
        "stage": random.choice(statuses),
        "source": random.choice(sources),
        "estimatedValue": random.randint(1000, 50000)
    }
    leads.append(lead)

# Write CSV
with open('public/samples/leads_sample.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.DictWriter(f, fieldnames=leads[0].keys())
    writer.writeheader()
    writer.writerows(leads)

# Write JSON
with open('public/samples/leads_sample.json', 'w', encoding='utf-8') as f:
    json.dump(leads, f, ensure_ascii=False, indent=2)

print("Files created successfully.")
