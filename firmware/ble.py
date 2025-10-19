# ble_rfid_to_json_persistent.py
# pip install bleak
import asyncio, json, time, os, signal
from pathlib import Path
from bleak import BleakScanner, BleakClient

DEVICE_NAME  = "ESP32 Server"
SERVICE_UUID = "275dc6e0-dff5-4b56-9af0-584a5768a02a"
CHAR_UUID    = "9b2a6a1f-4f8a-4c67-9d2a-62b3c1a8e0ff"

JSON_PATH = Path(os.getenv("HELLO_JSON", "~/Desktop/hello.json")).expanduser().resolve()

MCC_BY_CATEGORY = {
    "grocery": "5411",   # Grocery
    "dining":  "5811",   # Dining
    "online":  "5311",   #online_shopping
}

def write_json(uid: str, category: str):
    record = {
        "uid": uid,
        "mcc": MCC_BY_CATEGORY.get(category, 5999),
        "ts": int(time.time()),
    }
    JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    JSON_PATH.write_text(json.dumps(record, indent=2))
    print("Wrote:", JSON_PATH, "->", record)

async def main():
    print("Output file:", JSON_PATH)
    print("Scanning for ESP32… (close LightBlue so it doesn't hold the connection)")

    def adv_filter(d, ad):
        by_name = (d.name or "") == DEVICE_NAME
        by_uuid = SERVICE_UUID.lower() in [u.lower() for u in (ad.service_uuids or [])]
        return by_name or by_uuid

    device = await BleakScanner.find_device_by_filter(adv_filter, timeout=10.0)
    if not device:
        raise RuntimeError("ESP32 not found. Is it advertising?")

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[bytes] = asyncio.Queue()  # unbounded; each notify will be queued

    # notify callback (may be called from another thread)
    def on_notify(_, data: bytearray):
        # schedule putting bytes into the asyncio queue on the correct loop
        loop.call_soon_threadsafe(queue.put_nowait, bytes(data))

    print("Connecting to:", device)
    async with BleakClient(device) as client:
        print("Connected. Subscribing…")
        await client.start_notify(CHAR_UUID, on_notify)
        print("Subscribed. Listening for RFID taps (Ctrl+C to quit)...")

        try:
            while True:
                raw = await queue.get()             # wait for the next notification
                try:
                    payload = json.loads(raw.decode("utf-8"))
                    uid = payload.get("uid", "")
                    category = payload.get("category", "online")
                    write_json(uid, category)      # overwrite JSON with latest tap
                except Exception as e:
                    print("Failed to parse payload:", raw, "error:", e)
        except asyncio.CancelledError:
            # graceful shutdown if externally cancelled
            pass
        except KeyboardInterrupt:
            # caught when running synchronously, allow graceful disconnect below
            print("\nKeyboard interrupt received — disconnecting...")
        finally:
            # stop notify and disconnect
            try:
                await client.stop_notify(CHAR_UUID)
            except Exception:
                pass
            # async with will disconnect automatically
            print("Disconnected cleanly.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # extra safety if Ctrl+C happens before asyncio.run finishes
        print("Exited.")
