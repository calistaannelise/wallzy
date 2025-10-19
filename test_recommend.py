#!/usr/bin/env python3
"""
Test script for /recommend endpoint
Tests the endpoint that json_watcher.py calls
"""

import requests
import json
from pathlib import Path

API_BASE = "http://localhost:8000"
HELLO_JSON_PATH = Path("../firmware/hello.json").resolve()

def test_recommend_endpoint():
    """Test the /recommend endpoint with empty POST"""
    print("="*70)
    print("Testing /recommend endpoint (simulating json_watcher.py)")
    print("="*70)
    
    # Read current hello.json
    try:
        with open(HELLO_JSON_PATH, 'r') as f:
            json_data = json.load(f)
        print(f"\n📄 Current hello.json data:")
        print(f"   UID: {json_data.get('uid')}")
        print(f"   MCC: {json_data.get('mcc')}")
        print(f"   Timestamp: {json_data.get('ts')}")
    except Exception as e:
        print(f"❌ Error reading hello.json: {e}")
        return False
    
    # Test 1: Empty POST (what json_watcher does)
    print(f"\n🧪 Test 1: POST with no body")
    try:
        response = requests.post(f"{API_BASE}/recommend")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ SUCCESS")
            print(f"\n   📊 Recommendation Result:")
            print(f"   ├─ Card: {result['card_name']}")
            print(f"   ├─ Issuer: {result['issuer']}")
            print(f"   ├─ Category: {result['category']}")
            print(f"   ├─ Multiplier: {result['multiplier']}%")
            print(f"   ├─ Cashback: ${result['cashback_cents']/100:.2f}")
            print(f"   └─ Reason: {result['reason']}")
            return True
        else:
            print(f"   ❌ FAILED")
            print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Cannot connect to API at {API_BASE}")
        print(f"   Make sure backend is running: python3 main.py")
        return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_with_empty_json_body():
    """Test with empty JSON body"""
    print(f"\n🧪 Test 2: POST with empty JSON body")
    try:
        response = requests.post(f"{API_BASE}/recommend", json={})
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS")
            return True
        else:
            print(f"   ❌ FAILED: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_with_null_body():
    """Test with null body"""
    print(f"\n🧪 Test 3: POST with null body")
    try:
        response = requests.post(f"{API_BASE}/recommend", json=None)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ SUCCESS")
            return True
        else:
            print(f"   ❌ FAILED: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting /recommend endpoint tests\n")
    
    results = []
    results.append(("Empty POST", test_recommend_endpoint()))
    results.append(("Empty JSON body", test_with_empty_json_body()))
    results.append(("Null body", test_with_null_body()))
    
    print("\n" + "="*70)
    print("📋 Test Summary")
    print("="*70)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        print("\n🎉 All tests passed! The endpoint is working correctly.")
        print("   json_watcher.py should now work without 422 errors.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
    
    print("="*70 + "\n")
