import boto3

def get_service_logs():
    logs = boto3.client('logs', region_name='us-east-1')
    groups = logs.describe_log_groups(logGroupNamePrefix='/aws/apprunner/')
    for g in groups.get('logGroups', []):
        group_name = g['logGroupName']
        print(f"DEBUG: Found group {group_name}")
        
        print(f"\n--- LOG GROUP: {group_name} ---")
        streams = logs.describe_log_streams(logGroupName=group_name, orderBy='LastEventTime', descending=True, limit=2)
        for s in streams.get('logStreams', []):
            print(f"STREAM: {s['logStreamName']}")
            events = logs.get_log_events(logGroupName=group_name, logStreamName=s['logStreamName'], limit=20)
            for e in events.get('events', []):
                print(e['message'].strip())

if __name__ == "__main__":
    import sys
    with open('service_logs_utf16.txt', 'w', encoding='utf-16le') as f:
        sys.stdout = f
        get_service_logs()
