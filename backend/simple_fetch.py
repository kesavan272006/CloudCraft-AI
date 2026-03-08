import boto3
import sys

def fetch():
    logs = boto3.client('logs', region_name='us-east-1')
    group_name = '/aws/apprunner/CloudCraftBackend/4361d5bb97d345c6a51ed93d6cb9d147/service'
    
    print(f"Fetching from {group_name}...")
    try:
        streams = logs.describe_log_streams(logGroupName=group_name, orderBy='LastEventTime', descending=True, limit=2)
        for s in streams.get('logStreams', []):
            stream_name = s['logStreamName']
            print(f"\n--- STREAM: {stream_name} ---")
            events = logs.get_log_events(logGroupName=group_name, logStreamName=stream_name, limit=1000)
            with open("deployment_errors.txt", "w", encoding="utf-8") as f:
                for e in events.get('events', []):
                    f.write(e['message'].strip() + "\n")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch()
