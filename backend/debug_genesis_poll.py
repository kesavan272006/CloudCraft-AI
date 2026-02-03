
import asyncio
import os
import sys
import json

# Add backend to sys path
sys.path.append(os.getcwd())

from src.services.genesis_service import GenesisService

async def main():
    print("Testing GenesisService Full Lifecycle...")
    try:
        # 1. Start
        input_source = "Test Campaign: Launching a new eco-friendly sneaker line."
        start_res = await GenesisService.start_genesis(input_source)
        process_id = start_res["process_id"]
        print(f"Started Process: {process_id}")
        print(f"Initial Graph Nodes: {len(start_res['graph']['nodes'])}")

        # 2. Poll Loop
        for i in range(10):
            await asyncio.sleep(2)
            graph = GenesisService.get_graph(process_id)
            if not graph:
                print("Error: Graph not found during polling!")
                break
            
            node_count = len(graph["nodes"])
            status = graph.get("status")
            print(f"Poll {i+1}: Status={status}, Nodes={node_count}")
            
            if status == "complete":
                print("Genesis Complete!")
                print(json.dumps(graph, indent=2))
                break
        
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
