import json
import requests
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuration
HELLO_JSON_PATH = Path("../firmware/hello.json").resolve()
API_BASE = "http://localhost:8000"

# Track last processed timestamp
last_processed_timestamp = None

def read_hello_json():
    """Read hello.json file"""
    with open(HELLO_JSON_PATH, 'r') as f:
        return json.load(f)

def trigger_recommendation(data):
    """Trigger the recommendation endpoint"""
    try:
        response = requests.post(f"{API_BASE}/recommend")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n{'='*60}")
            print(f"✅ NEW TRANSACTION PROCESSED")
            print(f"{'='*60}")
            print(f"UID: {data.get('uid')}")
            print(f"Timestamp: {data.get('ts')} ({datetime.fromtimestamp(data.get('ts'))})")
            print(f"Category: {result.get('category')}")
            print(f"Card Selected: {result.get('card_name')}")
            print(f"Amount: ${result.get('amount_dollars', 0):.2f}")
            print(f"Multiplier: {result.get('multiplier')}%")
            print(f"Cashback: ${result.get('cashback_dollars', 0):.2f}")
            print(f"Reason: {result.get('reason')}")
            print(f"{'='*60}\n")
            return True
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure backend is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error triggering recommendation: {e}")
        return False

class HelloJsonHandler(FileSystemEventHandler):
    """Event handler for hello.json file changes"""
    
    def on_modified(self, event):
        """Called when hello.json is modified"""
        global last_processed_timestamp
        
        # Only process if it's the hello.json file
        if event.src_path == str(HELLO_JSON_PATH):
            print(f"🔔 File change detected: {event.src_path}")
            
            # Small delay to ensure file write is complete
            import time
            time.sleep(0.1)
            
            data = read_hello_json()
            
            if data:
                current_timestamp = data.get("ts")
                
                # Check if timestamp has changed (new transaction)
                if current_timestamp != last_processed_timestamp:
                    print(f"📝 New timestamp: {current_timestamp}")
                    
                    # Trigger recommendation
                    if trigger_recommendation(data):
                        last_processed_timestamp = current_timestamp
                    # else:
                    #     # print("⚠️  Failed to process, will retry on next change")
                # else:
                #     print("⏭️  Same timestamp, skipping...")

def watch_file():
    """Watch hello.json for changes using file system events"""
    # print("🔍 Event-Driven File Watcher Started")
    # print(f"📁 Watching: {HELLO_JSON_PATH}")
    # print(f"🎯 API endpoint: {API_BASE}/recommend/process")
    # print(f"⚡ Using file system events (no polling!)")
    # print("\nWaiting for RFID card taps...\n")
    
    # Create event handler and observer
    event_handler = HelloJsonHandler()
    observer = Observer()
    
    # Watch the directory containing hello.json
    watch_directory = HELLO_JSON_PATH.parent
    observer.schedule(event_handler, str(watch_directory), recursive=False)
    
    # Start watching
    observer.start()
    
    try:
        # Keep the script running
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n👋 File watcher stopped")
        observer.stop()
    
    observer.join()

if __name__ == "__main__":
    watch_file()