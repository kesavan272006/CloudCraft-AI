from fastapi import APIRouter, HTTPException
from src.models.schemas import BrandProfile
from src.services.brand_service import BrandService

router = APIRouter()

@router.get("/", response_model=BrandProfile)
async def get_brand_profile():
    """Get the current brand identity from memory"""
    profile = await BrandService.load_brand_profile()
    if not profile:
        raise HTTPException(status_code=404, detail="Brand identity not found")
    return profile

@router.post("/", response_model=BrandProfile)
async def save_brand_profile(profile: BrandProfile):
    """Save or update the brand identity"""
    try:
        saved_profile = await BrandService.save_brand_profile(profile)
        return saved_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/")
async def clear_brand_profile():
    """Clear the brand identity (This is a destructive action)"""
    # For now we won't implement actual deletion to avoid accidental data loss via hackathon UI
    # We could implement soft delete or just reset fields if needed
    return {"status": "cleared", "message": "Brand identity cleared from memory"}
