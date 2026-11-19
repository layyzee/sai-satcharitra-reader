import http.server
import socketserver
import json
import os
from pathlib import Path

PORT = 8080
DIRECTORY = Path(__file__).parent.resolve()
SYNC_FILE = DIRECTORY / "data" / "sync_store.json"

class DevotionalServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def end_headers(self):
        # Enable CORS for cross-device tablet and phone access
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/sync':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            if SYNC_FILE.exists():
                try:
                    with open(SYNC_FILE, 'r', encoding='utf-8') as f:
                        self.wfile.write(f.read().encode('utf-8'))
                    return
                except Exception as e:
                    pass
            self.wfile.write(json.dumps({"empty": True}).encode('utf-8'))
            return
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/sync':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                
                SYNC_FILE.parent.mkdir(parents=True, exist_ok=True)
                with open(SYNC_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2)

                # Auto-sync to GitHub Gist in background
                try:
                    import subprocess
                    subprocess.Popen(
                        ["gh", "gist", "edit", "96b05796b4e3181da4c7c94023006c41", str(SYNC_FILE)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                except Exception:
                    pass
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "updatedAt": data.get("updatedAt")}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        return super().do_POST()

if __name__ == '__main__':
    # Allow address reuse to prevent address already in use errors
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DevotionalServerHandler) as httpd:
        print(f"Sri Sai Satcharitra Devotional & Sync Server running at http://0.0.0.0:{PORT}")
        httpd.serve_forever()
