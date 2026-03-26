from sqlalchemy import text

class QueryService:
    def __init__(self, db):
        self.db = db

    def fetch_all(self, sql: str, params: dict | None = None):
        return [dict(row._mapping) for row in self.db.execute(text(sql), params or {}).fetchall()]

    def fetch_one(self, sql: str, params: dict | None = None):
        row = self.db.execute(text(sql), params or {}).fetchone()
        return dict(row._mapping) if row else None
