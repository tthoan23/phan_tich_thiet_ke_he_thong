import sqlite3
import re
import os

DB_FILE = "homestay.db"
SCHEMA_FILE = "script_tao.sql"
DATA_FILE   = "tao_data.sql"

# ─── Đọc file (hỗ trợ cả UTF-16 và UTF-8) ───────────────────────────────────
def read_sql(path):
    for enc in ("utf-16", "utf-16-le", "utf-8-sig", "utf-8"):
        try:
            with open(path, encoding=enc) as f:
                return f.read()
        except (UnicodeDecodeError, UnicodeError):
            continue
    raise RuntimeError(f"Không đọc được file: {path}")

# ─── Convert SQL Server → SQLite ─────────────────────────────────────────────
def convert(sql: str) -> str:
    # Xoá các lệnh SQL Server không dùng trong SQLite
    sql = re.sub(r'^\s*USE\s+\w+\s*;?\s*$', '', sql, flags=re.MULTILINE | re.IGNORECASE)
    sql = re.sub(r'^\s*GO\s*$', '', sql, flags=re.MULTILINE | re.IGNORECASE)
    sql = re.sub(r'^\s*ALTER\s+DATABASE.*?$', '', sql, flags=re.MULTILINE | re.IGNORECASE)
    sql = re.sub(r'^\s*DROP\s+DATABASE.*?$', '', sql, flags=re.MULTILINE | re.IGNORECASE)
    sql = re.sub(r'^\s*CREATE\s+DATABASE.*?$', '', sql, flags=re.MULTILINE | re.IGNORECASE)
    sql = re.sub(r'^\s*IF\s+EXISTS.*?END', '', sql, flags=re.MULTILINE | re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'^\s*BEGIN\s*$', '', sql, flags=re.MULTILINE | re.IGNORECASE)

    # Kiểu dữ liệu SQL Server → SQLite
    sql = re.sub(r'\bNVARCHAR\s*\(\s*\d+\s*\)', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bNVARCHAR\b', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bVARCHAR\s*\(\s*\d+\s*\)', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bVARCHAR\b', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bNVARCHAR\b', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bDECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\)', 'REAL', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bBIT\b', 'INTEGER', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bDATETIME\b', 'TEXT', sql, flags=re.IGNORECASE)
    sql = re.sub(r'\bDATE\b', 'TEXT', sql, flags=re.IGNORECASE)

    # N'string' → 'string'  (SQLite không dùng prefix N)
    sql = re.sub(r"\bN'", "'", sql)

    # CURRENT_TIMESTAMP OK trong SQLite, giữ nguyên

    return sql

# ─── Tách thành từng câu lệnh ────────────────────────────────────────────────
def split_statements(sql: str):
    # Normalize double-CR từ file UTF-16 Windows (\\r\\r\\n → \\n)
    sql = sql.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

    # Tách theo dấu ; nhưng bỏ qua dòng trống và comment
    stmts = []
    buf = []
    in_block = 0  # theo dõi ngoặc mở chưa đóng
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith('--') or stripped == '':
            continue
        in_block += stripped.count('(') - stripped.count(')')
        buf.append(line)
        if stripped.endswith(';') and in_block <= 0:
            stmt = '\n'.join(buf).strip().rstrip(';') + ';'
            if len(stmt) > 2:
                stmts.append(stmt)
            buf = []
            in_block = 0
    if buf:
        stmt = '\n'.join(buf).strip()
        if stmt:
            stmts.append(stmt)
    return stmts

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    # Xóa DB cũ nếu có để tạo lại sạch
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"[i] Đã xóa DB cũ: {DB_FILE}")

    con = sqlite3.connect(DB_FILE)
    con.execute("PRAGMA foreign_keys = ON;")
    cur = con.cursor()

    errors = []

    for label, path in [("SCHEMA", SCHEMA_FILE), ("DATA", DATA_FILE)]:
        print(f"\n[>] Xử lý {label}: {path}")
        raw = read_sql(path)
        converted = convert(raw)
        stmts = split_statements(converted)
        ok = 0
        for stmt in stmts:
            try:
                cur.execute(stmt)
                ok += 1
            except sqlite3.Error as e:
                errors.append((stmt[:80], str(e)))
                # Uncomment để xem chi tiết lỗi:
                # print(f"  [!] {e}\n      SQL: {stmt[:80]}")
        con.commit()
        print(f"    ✅ {ok}/{len(stmts)} câu lệnh thành công")

    # Tóm tắt
    print("\n" + "="*60)
    print(f"✅ DB đã tạo: {DB_FILE}  ({os.path.getsize(DB_FILE)//1024} KB)")
    tables = cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
    print(f"📋 Bảng ({len(tables)}): {', '.join(t[0] for t in tables)}")

    if errors:
        print(f"\n⚠️  {len(errors)} câu lệnh lỗi (thường là lệnh SQL Server không tương thích):")
        for s, e in errors[:5]:
            print(f"   • {e} → {s}...")

    con.close()

if __name__ == "__main__":
    main()
