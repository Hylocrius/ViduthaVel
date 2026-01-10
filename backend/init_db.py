"""
Initialize the database
Run this script to create the database tables
"""
from models.database import init_db

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")

