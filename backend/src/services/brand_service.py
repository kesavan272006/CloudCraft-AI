import boto3
import os
from botocore.exceptions import ClientError
from src.models.schemas import BrandProfile
from src.utils.logger import get_logger
from datetime import datetime

logger = get_logger(__name__)

class BrandService:
    TABLE_NAME = "CloudCraft-Brand-Identity"
    _table = None

    @classmethod
    def _get_table(cls):
        """Lazy load DynamoDB table resource, creating it if it doesn't exist."""
        if cls._table:
            return cls._table

        dynamodb = boto3.resource(
            "dynamodb",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        try:
            table = dynamodb.Table(cls.TABLE_NAME)
            table.load()
            logger.info(f"Connected to DynamoDB table: {cls.TABLE_NAME}")
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                logger.info(f"Table {cls.TABLE_NAME} not found. Creating it...")
                try:
                    table = dynamodb.create_table(
                        TableName=cls.TABLE_NAME,
                        KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
                        AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
                        BillingMode="PAY_PER_REQUEST",
                    )
                    logger.info(f"Table {cls.TABLE_NAME} creation initiated.")
                except ClientError as e2:
                    if e2.response["Error"]["Code"] == "ResourceInUseException":
                         logger.info(f"Table {cls.TABLE_NAME} is already being created.")
                    else:
                         raise e2
            else:
                logger.error(f"Failed to connect to DynamoDB: {e}")
                raise e

        cls._table = table
        return cls._table

    @classmethod
    def _save_to_file(cls, data: dict):
        """Fallback: Save to local JSON file"""
        try:
            os.makedirs("data", exist_ok=True)
            with open("data/brand_memory.json", "w") as f:
                json.dump(data, f)
            logger.info("Saved to local file fallback")
        except Exception as e:
            logger.error(f"Failed to save to local file: {e}")

    @classmethod
    def _load_from_file(cls) -> dict:
        """Fallback: Load from local JSON file"""
        try:
            if os.path.exists("data/brand_memory.json"):
                with open("data/brand_memory.json", "r") as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Failed to load from local file: {e}")
            return None

    @classmethod
    def save_brand_profile(cls, profile: BrandProfile):
        """Save brand profile to DynamoDB with File Fallback"""
        item = profile.dict()
        item["pk"] = "BRAND_IDENTITY"  # Singleton pattern for now
        item["lastUpdated"] = datetime.utcnow().isoformat()
        
        try:
            table = cls._get_table()
            table.put_item(Item=item)
            logger.info("Brand profile saved directly to DynamoDB")
            return item
        except Exception as e:
            logger.warning(f"DynamoDB save failed ({str(e)}). Switching to local fallback.")
            cls._save_to_file(item)
            return item

    @classmethod
    def load_brand_profile(cls) -> BrandProfile:
        """Load brand profile from DynamoDB with File Fallback"""
        try:
            table = cls._get_table()
            response = table.get_item(Key={"pk": "BRAND_IDENTITY"})
            if "Item" in response:
                return BrandProfile(**response["Item"])
        except Exception as e:
            logger.warning(f"DynamoDB load failed ({str(e)}). Checking local fallback.")
        
        # Fallback
        local_data = cls._load_from_file()
        if local_data:
            return BrandProfile(**local_data)
        
        return None

    @classmethod
    def get_brand_context(cls) -> str:
        """Format brand profile as context string for AI agents"""
        profile = cls.load_brand_profile()
        if not profile:
            return ""
            
        return f"""
        BRAND IDENTITY & VOICE (For Style/Tone Only):
        - Brand Name: {profile.brandName}
        - Voice/Tone: {profile.brandVoice}
        - Target Audience: {profile.targetAudience}
        - Brand Description: {profile.brandDescription}
        
        CRITICAL INSTRUCTION:
        This Brand Identity provided above is for TONE/STYLE reference only. 
        If the User Request (Task) asks to write about a SPECIFIC PRODUCT or TOPIC (e.g., a coffee machine), you MUST write about that product, NOT about '{profile.brandName}'. 
        Do not force the brand description into the content if it effectively changes the subject.
        """
