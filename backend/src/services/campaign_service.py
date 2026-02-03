import boto3
import os
import json
import uuid
from botocore.exceptions import ClientError
from src.models.schemas import Campaign, CampaignCreate, CampaignStrategy
from src.utils.logger import get_logger
from datetime import datetime

logger = get_logger(__name__)

class CampaignService:
    TABLE_NAME = "CloudCraft-Campaigns"
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
                        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
                        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
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
    def _save_fallback(cls, campaigns_list):
        """Fallback: Save list of campaigns to local JSON file"""
        try:
            os.makedirs("data", exist_ok=True)
            with open("data/campaigns.json", "w") as f:
                # Convert Pydantic models to dicts
                data = [c.dict() for c in campaigns_list]
                json.dump(data, f, default=str)
            logger.info("Saved campaigns to local file fallback")
        except Exception as e:
            logger.error(f"Failed to save to local campaign file: {e}")

    @classmethod
    def _load_fallback(cls):
        """Fallback: Load from local JSON file"""
        try:
            if os.path.exists("data/campaigns.json"):
                with open("data/campaigns.json", "r") as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Failed to load from local campaign file: {e}")
            return []

    @classmethod
    def create_campaign(cls, campaign_in: CampaignCreate) -> Campaign:
        new_campaign = Campaign(
            id=str(uuid.uuid4()),
            name=campaign_in.name,
            goal=campaign_in.goal,
            duration=campaign_in.duration,
            budget=campaign_in.budget,
            status="draft",
            created_at=datetime.utcnow().isoformat(),
            strategy=None
        )

        # Try DynamoDB
        try:
            table = cls._get_table()
            table.put_item(Item=new_campaign.dict())
            return new_campaign
        except Exception as e:
            logger.warning(f"DynamoDB save failed: {e}. Using fallback.")
            
            # Fallback Logic: Read All -> Append -> Write All
            # (Inefficient but robust for fallback)
            current = cls._load_fallback()
            current.append(new_campaign.dict())
            
            # Reconstruct list of objects to save
            current_objs = [Campaign(**c) for c in current]
            cls._save_fallback(current_objs)
            
            return new_campaign

    @classmethod
    def get_all_campaigns(cls):
        try:
            table = cls._get_table()
            response = table.scan()
            items = response.get("Items", [])
            return [Campaign(**item) for item in items]
        except Exception as e:
            logger.warning(f"DynamoDB scan failed: {e}. Using fallback.")
            data = cls._load_fallback()
            return [Campaign(**c) for c in data]

    @classmethod
    def update_campaign_strategy(cls, campaign_id: str, strategy: CampaignStrategy):
        # Update DynamoDB
        try:
            table = cls._get_table()
            table.update_item(
                Key={"id": campaign_id},
                UpdateExpression="set strategy = :s, #st = :active",
                ExpressionAttributeNames={"#st": "status"},
                ExpressionAttributeValues={
                    ":s": strategy.dict(),
                    ":active": "active"
                }
            )
        except Exception as e:
            logger.warning(f"DynamoDB update failed: {e}. Using fallback.")
            
            # Fallback Update
            current_raw = cls._load_fallback()
            updated_list = []
            for c in current_raw:
                if c["id"] == campaign_id:
                    c["strategy"] = strategy.dict()
                    c["status"] = "active"
                updated_list.append(Campaign(**c))
            cls._save_fallback(updated_list)
        
        return True
