from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "ContextBase API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DATABASE: str = "contextbase"
    
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    RESET_TOKEN_EXPIRE_MINUTES: int = 15
    
    QDRANT_URL: str = "http://localhost:6333"
    
    OPENAI_API_KEY: str = ""
    
    AWS_ACCESS_KEY: str = ""
    AWS_SECRET_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET: str = "contextbase"
    
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024
    
    @property
    def database_url(self):
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
