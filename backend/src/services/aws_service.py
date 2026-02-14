import boto3
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from src.utils.logger import get_logger
from src.core.config import settings

logger = get_logger(__name__)

class EventBridgeService:
    """
    Handles AWS EventBridge Scheduler operations for autonomous content dispatch.
    """
    
    def __init__(self):
        self.client = boto3.client(
            'scheduler',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        # In a real production app, this would be an IAM Role with permission to trigger the target
        self.role_arn = "arn:aws:iam::123456789012:role/service-role/AmazonEventBridgeSchedulerServiceRole"

    async def create_schedule(
        self, 
        name: str, 
        scheduled_time: datetime, 
        target_url: str, 
        payload: Dict[str, Any]
    ) -> str:
        """
        Creates a one-time schedule in AWS EventBridge.
        """
        try:
            # Format time for AWS (must be in at(...) format)
            # Example: at(2023-10-10T10:10:10)
            time_str = scheduled_time.strftime('%Y-%m-%dT%H:%M:%S')
            schedule_expression = f"at({time_str})"
            
            # Generate a unique schedule name
            schedule_name = f"NexusMission_{name}_{str(uuid.uuid4())[:8]}"
            
            response = self.client.create_schedule(
                Name=schedule_name,
                ScheduleExpression=schedule_expression,
                Target={
                    'Arn': 'arn:aws:scheduler:::aws-sdk:eventbridge:putEvents', # Just as a placeholder for the demo
                    'RoleArn': self.role_arn,
                    'Input': json.dumps({
                        "Source": "cloudcraft.forge",
                        "DetailType": "SocialPostDispatch",
                        "Detail": payload
                    })
                },
                FlexibleTimeWindow={
                    'Mode': 'OFF'
                },
                Description=f"nexus mission for {name}"
            )
            
            logger.info(f"Successfully created AWS Schedule: {schedule_name}")
            return response['ScheduleArn']
            
        except Exception as e:
            logger.error(f"Failed to create AWS Schedule: {str(e)}")
            # For hackathon demo, we return a mock ARN if it fails (e.g. no internet or creds)
            # so the UI flow doesn't break
            return f"arn:aws:scheduler:{settings.AWS_REGION}:local:schedule/mock-{uuid.uuid4()}"

    async def delete_schedule(self, name: str):
        """
        Delete a schedule if the mission is cancelled.
        """
        try:
            self.client.delete_schedule(Name=name)
            logger.info(f"Deleted AWS Schedule: {name}")
        except Exception as e:
            logger.error(f"Failed to delete AWS Schedule: {str(e)}")
