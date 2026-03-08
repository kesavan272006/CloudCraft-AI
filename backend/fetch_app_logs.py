import boto3
import sys

def get_app_logs():
    logs = boto3.client('logs', region_name='us-east-1')
    groups = logs.describe_log_groups(logGroupNamePrefix='/aws/apprunner/')
    for g in groups.get('logGroups', []):
        group_name = g['logGroupName']
        if '/application' not in group_name:
            continue
        
        print(f"\n--- LOG GROUP: {group_name} ---")
        streams = logs.describe_log_streams(logGroupName=group_name, orderBy='LastEventTime', descending=True, limit=3)
        for s in streams.get('logStreams', []):
            print(f"\n--- STREAM: {s['logStreamName']} ---")
            try:
                events = logs.get_log_events(logGroupName=group_name, logStreamName=s['logStreamName'], limit=100)
                for e in events.get('events', []):
                    print(e['message'].strip())
            except Exception as ex:
                print(f"Error fetching logs: {ex}")

if __name__ == "__main__":
    get_app_logs()
