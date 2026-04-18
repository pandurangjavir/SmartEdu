import os
import subprocess
import sys
import shutil
from pathlib import Path

def run_command(command, cwd=None, env=None):
    print(f"Running: {' '.join(command)}")
    try:
        subprocess.check_call(command, cwd=cwd, env=env)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        return False

def setup_env_file():
    print("Checking environment variables...")
    
    # Backend ENV
    backend_env = Path("backend/.env")
    backend_example = Path("backend/env.example")
    
    if not backend_env.exists():
        if backend_example.exists():
            print("Creating backend/.env from env.example...")
            shutil.copy(backend_example, backend_env)
            print("Please remember to update your GEMINI_API_KEY in backend/.env")
        else:
            print("Warning: backend/env.example not found.")
    else:
        print("backend/.env already exists.")

    # Frontend ENV
    frontend_env = Path("frontend/.env.local")
    frontend_example = Path("frontend/.env.example")
    
    if not frontend_env.exists():
        if frontend_example.exists():
            print("Creating frontend/.env.local from .env.example...")
            shutil.copy(frontend_example, frontend_env)
        else:
            print("Warning: frontend/.env.example not found.")
    else:
        print("frontend/.env.local already exists.")

def install_dependencies():
    print("Installing dependencies...")
    return run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def setup_database():
    print("Setting up MySQL Database...")
    backend_dir = Path("backend")
    # We will use seed_custom_data.py which already handles table creation and seeding
    # but we need to make sure the database exists first.
    
    # Try to import pymysql to check connection
    try:
        import pymysql
        from dotenv import load_dotenv
        
        load_dotenv(backend_dir / ".env")
        
        host = os.getenv("MYSQL_HOST", "localhost")
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        db_name = os.getenv("MYSQL_DB", "college_system_cse")
        
        conn = pymysql.connect(host=host, user=user, password=password)
        try:
            with conn.cursor() as cursor:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
                print(f"Database '{db_name}' ensured.")
        finally:
            conn.close()
            
        print("Running seeding script...")
        return run_command([sys.executable, "seed_custom_data.py"], cwd=backend_dir)
    except ImportError:
        print("pymysql not found. Dependency installation might have failed.")
        return False
    except Exception as e:
        print(f"Database setup failed: {e}")
        return False

def train_model():
    print("Training Rasa Model...")
    backend_dir = Path("backend")
    return run_command([sys.executable, "rasa_training.py"], cwd=backend_dir)

def main():
    root_dir = Path(__file__).parent.resolve()
    os.chdir(root_dir)
    
    setup_env_file()
    
    if not install_dependencies():
        print("Failed to install dependencies. Aborting.")
        return

    if not setup_database():
        print("Failed to setup database. Continuing anyway...")

    if not train_model():
        print("Failed to train model.")

    print("\nSetup process completed!")

if __name__ == "__main__":
    main()
