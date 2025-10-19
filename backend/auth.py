import bcrypt
from datetime import datetime, timedelta
from typing import Optional

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt
    Bcrypt has a maximum password length of 72 bytes
    """
    # Ensure password is a string and encode to bytes
    password_bytes = password.encode('utf-8')
    
    # Truncate to 72 bytes if necessary
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    """
    # Ensure password is a string and encode to bytes
    password_bytes = plain_password.encode('utf-8')
    
    # Truncate to 72 bytes if necessary
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Encode hashed password
    hashed_bytes = hashed_password.encode('utf-8')
    
    # Verify
    return bcrypt.checkpw(password_bytes, hashed_bytes)
