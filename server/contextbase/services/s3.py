import boto3
from contextbase.core.config import settings
import uuid
import requests
import tempfile
import os
from urllib.parse import urlparse

s3 = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY,
    aws_secret_access_key=settings.AWS_SECRET_KEY,
    region_name=settings.AWS_REGION
)


def upload_to_s3(file_obj, filename: str):
    ext = os.path.splitext(filename)[1] or ""
    unique_name = f"{uuid.uuid4()}{ext}"
    bucket = settings.S3_BUCKET

    s3.upload_fileobj(
        Fileobj=file_obj,
        Bucket=bucket,
        Key=unique_name,
        ExtraArgs={"ACL": "public-read"}
    )

    file_url = f"https://{bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_name}"
    return file_url


def download_temp_s3_file(file_url: str) -> str:
    ext = os.path.splitext(file_url)[1] or ""
    filename = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(tempfile.gettempdir(), filename)

    parsed = urlparse(file_url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL format: {file_url}")

    response = requests.get(file_url)
    response.raise_for_status()

    with open(temp_path, "wb") as f:
        f.write(response.content)

    return temp_path


def delete_from_s3(file_url: str):
    parsed = urlparse(file_url)
    key = parsed.path.lstrip("/")
    s3.delete_object(Bucket=settings.S3_BUCKET, Key=key)
