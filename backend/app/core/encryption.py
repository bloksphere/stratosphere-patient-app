"""Field-level encryption for sensitive data (GDPR compliance)."""
import base64
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken

from app.config import settings


class FieldEncryption:
    """Handles encryption/decryption of sensitive fields."""

    def __init__(self):
        """Initialize with encryption key from settings."""
        self._fernet: Optional[Fernet] = None
        self._init_fernet()

    def _init_fernet(self):
        """Initialize Fernet cipher with the encryption key."""
        key = settings.encryption_key
        if key and key != "change-this-in-production":
            try:
                # Try to use key directly if it's already a valid Fernet key
                self._fernet = Fernet(key.encode())
            except Exception:
                # Generate a key from the provided string
                # This is for development - in production, use a proper Fernet key
                import hashlib
                key_bytes = hashlib.sha256(key.encode()).digest()
                fernet_key = base64.urlsafe_b64encode(key_bytes)
                self._fernet = Fernet(fernet_key)

    def encrypt(self, data: str) -> bytes:
        """Encrypt a string and return bytes."""
        if not self._fernet:
            # In development without proper key, return base64 encoded (not secure!)
            return base64.b64encode(data.encode())
        return self._fernet.encrypt(data.encode())

    def decrypt(self, encrypted_data: bytes) -> str:
        """Decrypt bytes and return string."""
        if not self._fernet:
            # In development without proper key
            return base64.b64decode(encrypted_data).decode()
        try:
            return self._fernet.decrypt(encrypted_data).decode()
        except InvalidToken:
            raise ValueError("Invalid encrypted data or wrong key")

    def encrypt_if_present(self, data: Optional[str]) -> Optional[bytes]:
        """Encrypt data if it's not None."""
        if data is None:
            return None
        return self.encrypt(data)

    def decrypt_if_present(self, encrypted_data: Optional[bytes]) -> Optional[str]:
        """Decrypt data if it's not None."""
        if encrypted_data is None:
            return None
        return self.decrypt(encrypted_data)


# Singleton instance
field_encryption = FieldEncryption()
