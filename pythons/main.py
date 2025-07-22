import sys
import keyboard
import asyncio
import winrt.windows.media.control as media_control
import io
import time
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def play_pause():
    keyboard.send("play/pause media")

def next_track():
    keyboard.send("next track")

def prev_track():
    keyboard.send("previous track")

def volume_up():
    keyboard.send("volume up")

def volume_down():
    keyboard.send("volume down")

async def get_track():
    sessions = await media_control.GlobalSystemMediaTransportControlsSessionManager.request_async()
    all_sessions = sessions.get_sessions()

    for session in all_sessions:
        try:
            app_id = session.source_app_user_model_id
            if "spotify" in app_id.lower():
                info = await session.try_get_media_properties_async()
                status_enum = session.get_playback_info().playback_status
                timeline = session.get_timeline_properties()

                status_map = {
                    4: "Playing",
                    5: "Paused"
                }
                status = status_map.get(status_enum, "Unknown")

                # Extracting timeline data safely
                position = timeline.position.total_seconds() if timeline.position else 0
                duration = timeline.end_time.total_seconds() if timeline.end_time else 0

                return {
                    "title": info.title,
                    "artist": info.artist,
                    "status": status,
                    "position": position,
                    "duration": duration
                }
        except Exception:
            continue

    return {
        "title": None,
        "artist": None,
        "status": "Spotify not detected",
        "position": 0,
        "duration": "bro"
    }


if __name__ == "__main__":
    if len(sys.argv) <= 1:
        track = asyncio.run(get_track())
        print(json.dumps(track))
        sys.exit(0)

    command = sys.argv[1].lower()

    if command == "play":
        play_pause()
        time.sleep(0.5)
        track = asyncio.run(get_track())
        print(json.dumps(track))

    elif command == "next":
        next_track()
        time.sleep(0.5)
        track = asyncio.run(get_track())
        print(json.dumps(track))

    elif command == "prev":
        prev_track()
        time.sleep(0.5)
        track = asyncio.run(get_track())
        print(json.dumps(track))

    elif command == "vol_up":
        volume_up()

    elif command == "vol_down":
        volume_down()

    elif command == "status":
        track = asyncio.run(get_track())
        print(json.dumps(track))

    else:
        print(json.dumps({
            "error": f"Unknown command: {command}"
        }))