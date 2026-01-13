from flask import Blueprint, render_template, jsonify, abort, send_from_directory, make_response
import os
import duckdb
import json

# Define Blueprint
main_bp = Blueprint('main', __name__)

# GLOBAL CACHE VERSION
CACHE_VERSION = '1.0' 
DIST_DB_PATH = 'app/static/system_dist.duckdb'

def ensure_dist_db_exists():
    """
    Generates the clean 'Server Template' DB if it doesn't exist.
    This replaces the need for DataManager and DBInterface.
    """
    os.makedirs(os.path.dirname(DIST_DB_PATH), exist_ok=True)
    
    # Only regenerate if missing or force update needed
    # (For simplicity in this stateless architecture, we just check existence)
    if not os.path.exists(DIST_DB_PATH):
        print(f"[Server] Generating DB Template (v{CACHE_VERSION})...")
        conn = duckdb.connect(DIST_DB_PATH)
        try:
            # 1. System Config Table
            conn.execute("CREATE TABLE IF NOT EXISTS system_config (key VARCHAR PRIMARY KEY, value VARCHAR)")
            conn.execute(f"COMMENT ON TABLE system_config IS 'INTERNAL'")
            
            # 2. Insert Version
            conn.execute(f"INSERT OR REPLACE INTO system_config VALUES ('app_version', '{CACHE_VERSION}')")
            
            # 3. Insert Cacheable Resources
            resources = json.dumps(['/app.duckdb'])
            conn.execute(f"INSERT OR REPLACE INTO system_config VALUES ('cacheable_resources', '{resources}')")
        finally:
            conn.close()
    return True

# ------------------------------------------------------------------------------
# SYSTEM ROUTES
# ------------------------------------------------------------------------------
@main_bp.route('/sw.js')
def service_worker():
    response = make_response(render_template('sw.js', cache_version=CACHE_VERSION))
    response.headers['Content-Type'] = 'application/javascript'
    return response

@main_bp.route('/app.duckdb')
def download_db():
    """Serves the CLEAN Server DB Template."""
    ensure_dist_db_exists()
    try:
        return send_from_directory(os.getcwd(), DIST_DB_PATH, as_attachment=True, download_name='app.duckdb')
    except FileNotFoundError:
        return abort(404)

@main_bp.route('/api/system/version', methods=['GET'])
def get_system_version():
    return jsonify({"version": CACHE_VERSION})

@main_bp.route('/api/system/init-db', methods=['POST'])
def init_db():
    ensure_dist_db_exists()
    return jsonify({"status": "success", "version": CACHE_VERSION})

# ------------------------------------------------------------------------------
# VIEW ROUTES
# ------------------------------------------------------------------------------
@main_bp.route('/')
def index():
    return render_template('index.html', cache_version=CACHE_VERSION)

@main_bp.route('/views/<view_name>')
def get_view(view_name):
    # Security: Ensure view_name doesn't contain path traversal
    valid_views = ['home', 'database', 'tables', 'settings']
    if view_name not in valid_views: return abort(404)
    return render_template(f'views/{view_name}.html')