from fastapi import UploadFile
import os

from contextbase.services.s3 import upload_to_s3, delete_from_s3


def save_upload(file: UploadFile):
    """upload file to s3, returns (s3_url, original_name, size)"""
    original = file.filename or "unknown"
    content = file.file.read()
    size = len(content)

    file.file.seek(0)
    file_url = upload_to_s3(file.file, original)

    return file_url, original, size


def delete_upload(file_url):
    try:
        delete_from_s3(file_url)
        return True
    except:
        pass
    return False


def format_size(bytes):
    if bytes < 1024:
        return f"{bytes} B"
    elif bytes < 1024 * 1024:
        return f"{bytes/1024:.1f} KB"
    return f"{bytes/(1024*1024):.1f} MB"
