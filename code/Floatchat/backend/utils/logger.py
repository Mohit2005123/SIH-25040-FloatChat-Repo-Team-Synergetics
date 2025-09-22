import logging
import sys
from datetime import datetime
import os

def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    """Setup logger with consistent formatting"""
    
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    file_handler = logging.FileHandler(
        os.path.join(log_dir, f"floatchat_{datetime.now().strftime('%Y%m%d')}.log")
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger
