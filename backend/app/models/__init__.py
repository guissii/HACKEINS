"""Re-export all models so Base.metadata sees them."""
from app.models.farmer import Farmer
from app.models.parcel import Parcel
from app.models.reading import Reading

__all__ = ["Farmer", "Parcel", "Reading"]
