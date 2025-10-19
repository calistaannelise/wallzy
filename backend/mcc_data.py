# MCC (Merchant Category Code) mappings
# Simplified version for MVP

MCC_CATEGORIES = {
    # Dining
    "dining": ["5811", "5812", "5813", "5814"],
    
    # Groceries
    "groceries": ["5411", "5422", "5441", "5451", "5462"],
    
    # Gas
    "gas": ["5541", "5542", "5983"],
    
    # Travel
    "travel": ["3000", "3001", "3002", "3003", "3004", "3005", "3006", "3007", "3008", 
               "3009", "3010", "3011", "4511", "4722", "7011", "7512"],
    
    # Entertainment
    "entertainment": ["7832", "7841", "7922", "7929", "7991", "7996", "7997", "7998", "7999"],
    
    # Online Shopping
    "online_shopping": ["5309", "5310", "5311", "5331", "5399", "5732", "5733", "5734", "5735"],
    
    # Drugstores
    "drugstores": ["5912", "5122"],
    
    # Transit
    "transit": ["4111", "4112", "4131", "4784"],
    
    # Streaming Services
    "streaming": ["4899", "5815", "5816", "5817", "5818"],
    
    # Everything else
    "other": []
}

def get_category_from_mcc(mcc_code: str) -> str:
    """Get category name from MCC code"""
    for category, codes in MCC_CATEGORIES.items():
        if mcc_code in codes:
            return category
    return "other"

def get_mcc_codes_for_category(category: str) -> list:
    """Get MCC codes for a category"""
    return MCC_CATEGORIES.get(category.lower(), [])
