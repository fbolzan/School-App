import sqlite3
import argparse

def create_database(db_name="nba_players.db"):
    """Creates an SQLite database and populates it with sample NBA player data."""
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            height_inches INTEGER NOT NULL,
            college TEXT,
            conference TEXT
        )
    ''')
    
    # Clear existing data for demo purposes
    cursor.execute('DELETE FROM players')
    
    # Sample Data: (Name, Height in inches, College, Conference)
    # Note: 72 inches = 6'0", 69 inches = 5'9", 84 inches = 7'0"
    sample_players = [
        ("Allen Iverson", 72, "Georgetown", "Big East"),
        ("Chris Paul", 72, "Wake Forest", "ACC"),
        ("Muggsy Bogues", 63, "Wake Forest", "ACC"),
        ("Shaquille O'Neal", 85, "LSU", "SEC"),
        ("Charles Barkley", 78, "Auburn", "SEC"),
        ("Patrick Ewing", 84, "Georgetown", "Big East"),
        ("Tim Duncan", 83, "Wake Forest", "ACC"),
        ("Kevin Durant", 82, "Texas", "Big 12"),
        ("Blake Griffin", 82, "Oklahoma", "Big 12"),
        ("Trae Young", 73, "Oklahoma", "Big 12"),
        ("Isaiah Thomas", 69, "Washington", "Pac-12"),
        ("Nate Robinson", 69, "Washington", "Pac-12"),
        ("Spud Webb", 66, "NC State", "ACC"),
        ("Zion Williamson", 78, "Duke", "ACC"),
        ("Anthony Davis", 82, "Kentucky", "SEC"),
        ("John Wall", 75, "Kentucky", "SEC"),
        ("Carmelo Anthony", 79, "Syracuse", "Big East"),
        ("Dwyane Wade", 76, "Marquette", "Big East"),
        ("Kemba Walker", 72, "UConn", "Big East"),
        ("JJ Redick", 76, "Duke", "ACC")
    ]
    
    cursor.executemany('''
        INSERT INTO players (name, height_inches, college, conference)
        VALUES (?, ?, ?, ?)
    ''', sample_players)
    
    conn.commit()
    return conn

def format_height(inches):
    """Converts inches to standard feet'inches" format."""
    feet = inches // 12
    remaining_inches = inches % 12
    return f"{feet}'{remaining_inches}\""

def filter_players(conn, max_height_inches=None, conference=None):
    """Queries the database based on optional height and conference filters."""
    cursor = conn.cursor()
    
    query = "SELECT name, height_inches, college, conference FROM players WHERE 1=1"
    params = []
    
    if max_height_inches is not None:
        query += " AND height_inches < ?"
        params.append(max_height_inches)
        
    if conference is not None:
        # Using COLLATE NOCASE for case-insensitive matching
        query += " AND conference COLLATE NOCASE = ?"
        params.append(conference)
        
    cursor.execute(query, params)
    results = cursor.fetchall()
    
    print(f"\n--- Filter Results ---")
    if max_height_inches:
        print(f"Max Height: Under {format_height(max_height_inches)}")
    if conference:
        print(f"Conference: {conference}")
        
    print(f"Found {len(results)} players:")
    print("-" * 65)
    print(f"{'Name':<20} | {'Height':<8} | {'College':<15} | {'Conference':<10}")
    print("-" * 65)
    
    for row in results:
        name, height_inches, college, conf = row
        print(f"{name:<20} | {format_height(height_inches):<8} | {college:<15} | {conf:<10}")
    print("-" * 65)

def main():
    parser = argparse.ArgumentParser(description="NBA Player Database Filter")
    parser.add_argument("--max-height", type=int, help="Maximum height in inches (e.g., 72 for under 6'0\")")
    parser.add_argument("--conference", type=str, help="College conference (e.g., 'SEC', 'ACC', 'Big East')")
    
    args = parser.parse_args()
    
    # Create and populate the database
    conn = create_database()
    
    # If no arguments provided, show a default example
    if not args.max_height and not args.conference:
        print("No filters provided. Showing examples:")
        filter_players(conn, max_height_inches=72) # Under 6'0"
        filter_players(conn, conference="Big East")
        filter_players(conn, max_height_inches=75, conference="SEC") # Under 6'3" in SEC
    else:
        filter_players(conn, max_height_inches=args.max_height, conference=args.conference)
        
    conn.close()

if __name__ == "__main__":
    main()
