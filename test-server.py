#!/usr/bin/env python3
"""
Simple HTTP server for testing the Rivals Tournament application
Run with: python test-server.py
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime

PORT = 3000
brackets_file = './data/brackets.json'

# Load brackets data
def load_brackets():
    try:
        with open(brackets_file, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_brackets(data):
    try:
        os.makedirs('./data', exist_ok=True)
        with open(brackets_file, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error saving brackets: {e}")

def generate_bracket_id():
    import random
    import string
    return 'BKT-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class TournamentHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path in ['/api/bracket', '/api/brackets']:
            brackets = load_brackets()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(brackets).encode())
            return
        
        if self.path.startswith('/api/admin'):
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            admin_key = params.get('key', [None])[0] or self.headers.get('X-Admin-Key')
            
            if admin_key != 'admin123':
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
                return
            
            brackets = load_brackets()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': brackets,
                'count': len(brackets),
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
            return

        # Handle route rewrites
        if self.path in ['/brackets', '/brackets/']:
            self.path = '/brackets.html'
        elif self.path == '/':
            self.path = '/index.html'
        
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode())
            return

        if self.path == '/api/signup':
            # Validation
            required_fields = ['discord', 'roblox', 'rank', 'duo_discord', 'duo_roblox', 'duo_rank']
            if not all(field in data for field in required_fields):
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing required fields'}).encode())
                return

            if data['rank'] != data['duo_rank']:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Both players must have the same rank'}).encode())
                return

            brackets = load_brackets()
            bracket_id = generate_bracket_id()
            
            brackets[bracket_id] = {
                'bracketId': bracket_id,
                'rank': data['rank'],
                'player1': {'discord': data['discord'], 'roblox': data['roblox']},
                'player2': {'discord': data['duo_discord'], 'roblox': data['duo_roblox']},
                'timestamp': datetime.now().isoformat()
            }
            
            save_brackets(brackets)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'bracketId': bracket_id}).encode())
            return

        if self.path == '/api/remove-team':
            bracket_id = data.get('bracketId')
            if not bracket_id:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'bracketId required'}).encode())
                return

            brackets = load_brackets()
            if bracket_id not in brackets:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'Team not found'}).encode())
                return

            del brackets[bracket_id]
            save_brackets(brackets)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
            return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        if self.path.startswith('/api/admin'):
            admin_key = self.headers.get('X-Admin-Key')
            if admin_key != 'admin123':
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unauthorized'}).encode())
                return
            
            save_brackets({})
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'message': 'All data cleared'}).encode())
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    print(f"🎮 Tournament server starting on http://localhost:{PORT}")
    print(f"📊 Admin panel: http://localhost:{PORT}/admin.html")
    print(f"🏆 Brackets: http://localhost:{PORT}/brackets")
    print(f"👥 Dashboard: http://localhost:{PORT}/dashboard.html")
    print(f"\n🔑 Admin key: admin123")
    print(f"\nPress Ctrl+C to stop the server")
    
    with socketserver.TCPServer(("", PORT), TournamentHandler) as httpd:
        httpd.serve_forever()
