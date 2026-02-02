import psycopg2
import logging
import sys
import argparse
from pathlib import Path
from datetime import datetime

# --- Main Logger Setup ---
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
main_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

# Handler for main log file
file_handler = logging.FileHandler('cleanup_movies.log', encoding='utf-8')
file_handler.setFormatter(main_formatter)
logger.addHandler(file_handler)

# Handler for console output
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(main_formatter)
logger.addHandler(stream_handler)

# Set console encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Get script directory and project paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
INFRASTRUCTURE_DIR = PROJECT_ROOT / "infrastructure"
ENV_FILE = INFRASTRUCTURE_DIR / ".env"


def load_env_file(env_path: Path):
    """Load environment variables from .env file"""
    env_vars = {}
    if not env_path.exists():
        logger.error(f"[ENV] .env file not found at: {env_path}")
        raise FileNotFoundError(f".env file not found at: {env_path}")

    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                value = value.strip().strip('"').strip("'")
                env_vars[key.strip()] = value

    logger.info(f"[ENV] Loaded {len(env_vars)} environment variables")
    return env_vars


# Load environment variables
ENV_VARS = load_env_file(ENV_FILE)


def parse_database_url(url: str) -> dict:
    """Parse PostgreSQL URL to connection config"""
    from urllib.parse import urlparse, parse_qs

    parsed = urlparse(url)
    config = {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path.lstrip('/'),
        'user': parsed.username,
        'password': parsed.password,
    }

    if parsed.query:
        params = parse_qs(parsed.query)
        if 'sslmode' in params:
            config['sslmode'] = params['sslmode'][0]
        else:
            config['sslmode'] = 'require'
    else:
        config['sslmode'] = 'require'

    return config


def get_db_config(db_type: str = 'local') -> dict:
    """Get database configuration based on type (local or neon)"""
    if db_type == 'neon':
        database_url = ENV_VARS.get('DATABASE_URL')
        if not database_url:
            logger.error("DATABASE_URL not found in .env file for Neon database")
            raise ValueError("DATABASE_URL not found in .env file")
        logger.info("[DB] Using Neon PostgreSQL database")
        return parse_database_url(database_url)
    else:
        logger.info("[DB] Using local PostgreSQL database")
        return {
            'host': ENV_VARS.get('DATABASE_HOST', 'localhost'),
            'port': int(ENV_VARS.get('DATABASE_PORT', 5432)),
            'database': ENV_VARS.get('DATABASE_NAME', 'CINE'),
            'user': ENV_VARS.get('DATABASE_USER', 'cinesocial'),
            'password': ENV_VARS.get('DATABASE_PASSWORD', 'cinesocial123'),
            'sslmode': ENV_VARS.get('DATABASE_SSL_MODE', 'disable').lower()
        }


# Global DB_CONFIG will be set in main
DB_CONFIG = None


def get_db_connection():
    """PostgreSQL connection"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise


def cleanup_low_quality_movies(min_vote_count: int = 20, min_vote_average: float = 3.0, dry_run: bool = False):
    """
    Delete movies that have:
    - VoteCount < min_vote_count OR
    - VoteAverage < min_vote_average
    
    Logs the count for each deletion reason.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        logger.info("=" * 60)
        logger.info("MOVIE CLEANUP SCRIPT")
        logger.info("=" * 60)
        logger.info(f"Criteria:")
        logger.info(f"  - Minimum Vote Count: {min_vote_count}")
        logger.info(f"  - Minimum Vote Average (IMDB Score): {min_vote_average}")
        logger.info(f"  - Dry Run: {dry_run}")
        logger.info("-" * 60)

        # Count movies with low vote count
        cursor.execute('''
            SELECT COUNT(*) FROM "Movies" 
            WHERE "VoteCount" < %s AND "IsDeleted" = false
        ''', (min_vote_count,))
        low_vote_count = cursor.fetchone()[0]

        # Count movies with low vote average
        cursor.execute('''
            SELECT COUNT(*) FROM "Movies" 
            WHERE "VoteAverage" < %s AND "IsDeleted" = false
        ''', (min_vote_average,))
        low_rating_count = cursor.fetchone()[0]

        # Count movies that match BOTH criteria
        cursor.execute('''
            SELECT COUNT(*) FROM "Movies" 
            WHERE "VoteCount" < %s AND "VoteAverage" < %s AND "IsDeleted" = false
        ''', (min_vote_count, min_vote_average))
        both_criteria_count = cursor.fetchone()[0]

        # Count movies that match EITHER criteria (union)
        cursor.execute('''
            SELECT COUNT(*) FROM "Movies" 
            WHERE ("VoteCount" < %s OR "VoteAverage" < %s) AND "IsDeleted" = false
        ''', (min_vote_count, min_vote_average))
        total_to_delete = cursor.fetchone()[0]

        # Only low vote count (not low rating)
        only_low_vote_count = low_vote_count - both_criteria_count
        
        # Only low rating (not low vote count)
        only_low_rating = low_rating_count - both_criteria_count

        logger.info("ANALYSIS RESULTS:")
        logger.info("-" * 60)
        logger.info(f"  📊 Movies with VoteCount < {min_vote_count}: {low_vote_count}")
        logger.info(f"  ⭐ Movies with VoteAverage < {min_vote_average}: {low_rating_count}")
        logger.info(f"  🔄 Movies matching BOTH criteria: {both_criteria_count}")
        logger.info("-" * 60)
        logger.info(f"  ❌ Only low vote count (VoteCount < {min_vote_count}): {only_low_vote_count}")
        logger.info(f"  ❌ Only low rating (VoteAverage < {min_vote_average}): {only_low_rating}")
        logger.info(f"  ❌ Both low vote count AND low rating: {both_criteria_count}")
        logger.info("-" * 60)
        logger.info(f"  🗑️  TOTAL MOVIES TO DELETE: {total_to_delete}")
        logger.info("-" * 60)

        if total_to_delete == 0:
            logger.info("No movies match the deletion criteria. Nothing to do.")
            return

        if dry_run:
            logger.info("[DRY RUN] No movies were actually deleted.")
            logger.info("Run without --dry-run to perform actual deletion.")
            
            # Sample some movies that would be deleted
            cursor.execute('''
                SELECT "Id", "TmdbId", "Title", "VoteCount", "VoteAverage" 
                FROM "Movies" 
                WHERE ("VoteCount" < %s OR "VoteAverage" < %s) AND "IsDeleted" = false
                LIMIT 10
            ''', (min_vote_count, min_vote_average))
            sample_movies = cursor.fetchall()
            
            if sample_movies:
                logger.info("\nSample movies that would be deleted:")
                for movie in sample_movies:
                    logger.info(f"  - {movie[2]} (TMDB: {movie[1]}) | Votes: {movie[3]} | Rating: {movie[4]}")
        else:
            # Actually delete the movies (hard delete)
            logger.info("Performing deletion...")
            
            # Option 1: Hard delete
            cursor.execute('''
                DELETE FROM "Movies" 
                WHERE ("VoteCount" < %s OR "VoteAverage" < %s) AND "IsDeleted" = false
            ''', (min_vote_count, min_vote_average))
            
            # Option 2: Soft delete (uncomment if preferred)
            # cursor.execute('''
            #     UPDATE "Movies" 
            #     SET "IsDeleted" = true, "DeletedAt" = %s
            #     WHERE ("VoteCount" < %s OR "VoteAverage" < %s) AND "IsDeleted" = false
            # ''', (datetime.utcnow(), min_vote_count, min_vote_average))
            
            deleted_count = cursor.rowcount
            conn.commit()
            
            logger.info("=" * 60)
            logger.info(f"✅ DELETION COMPLETE!")
            logger.info(f"   Total movies deleted: {deleted_count}")
            logger.info("=" * 60)

        # Log final movie count
        cursor.execute('SELECT COUNT(*) FROM "Movies" WHERE "IsDeleted" = false')
        remaining_count = cursor.fetchone()[0]
        logger.info(f"\n📊 Remaining movies in database: {remaining_count}")

    except Exception as e:
        conn.rollback()
        logger.error(f"A critical error occurred: {e}")
        raise
    finally:
        cursor.close()
        conn.close()
        logger.info("Database connection closed.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Cleanup low-quality movies from the database based on vote count and rating."
    )
    parser.add_argument(
        '--min-votes',
        type=int,
        default=20,
        help='Minimum vote count threshold. Movies with fewer votes will be deleted. Default: 20'
    )
    parser.add_argument(
        '--min-rating',
        type=float,
        default=3.0,
        help='Minimum vote average (IMDB score) threshold. Movies with lower ratings will be deleted. Default: 3.0'
    )
    parser.add_argument(
        '--db',
        type=str,
        choices=['local', 'neon'],
        default='neon',
        help='Database to use: "local" for local PostgreSQL or "neon" for Neon cloud database. Default: neon'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Perform a dry run without actually deleting any movies. Shows what would be deleted.'
    )
    args = parser.parse_args()

    # Set global DB_CONFIG based on database type
    DB_CONFIG = get_db_config(args.db)

    cleanup_low_quality_movies(
        min_vote_count=args.min_votes,
        min_vote_average=args.min_rating,
        dry_run=args.dry_run
    )
