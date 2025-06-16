# backend/app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
import os # For getting filename from S3 key

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
# Replace with your actual bucket name.
# You could also get this from an environment variable.
S3_BUCKET_NAME = "druid-app-dev-videos-ben-test-1" # <<< REPLACE THIS!

# --- Flask Routes (API Endpoints) ---

@app.route('/api/message')
def get_message():
    return jsonify(message="Hello from Flask S3 Dynamic Backend!")

@app.route('/api/videos_for_booth')
def get_booth_videos():
    booth_id_from_request = request.args.get('booth_id')

    if not booth_id_from_request:
        return jsonify(error="Missing booth_id parameter in request"), 400

    s3_client = boto3.client('s3')
    listed_videos_for_booth = []

    try:
        # For S3, a common way to organize client files is by prefix.
        # So, if booth_id is "booth_A", files might be under "booth_A/" prefix.
        # If your files are NOT in subfolders per booth_id at the root of the bucket,
        # you'll need a different strategy to associate S3 objects with booth_ids
        # (e.g., S3 object tags, or a separate database that maps them).
        #
        # FOR NOW, let's assume files for a booth_id are directly at the root,
        # and we'll have to iterate through ALL files and then *conceptually* filter.
        # A better S3 structure would be: s3://YOUR_BUCKET_NAME/booth_A/video1.mp4
        #
        # To list objects with a specific prefix (simulating a folder per booth):
        # s3_prefix_for_booth = f"{booth_id_from_request}/"
        # response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=s3_prefix_for_booth)

        # For SIMPLICITY right now, if all videos are at the root and you want to list ALL videos
        # in the bucket and *then* your frontend decides what to show (or if there's only one "client"
        # for the whole bucket for this MVP):
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME) # Lists all objects

        if 'Contents' in response:
            for item in response['Contents']:
                s3_object_key = item['Key']

                # --- IMPORTANT DECISION POINT ---
                # How do we know if this s3_object_key belongs to the booth_id_from_request?
                # Option 1: Naming convention. e.g., object key starts with the booth_id
                #           if s3_object_key.startswith(f"{booth_id_from_request}/"):
                #               # This object belongs to the booth
                #           else:
                #             continue # Skip this object

                # Option 2 (Simpler for now if all videos in bucket are for one "client" or for testing):
                # Assume all listed videos are relevant for now, or that filtering happens later.
                # For a real multi-client app, Option 1 or a database mapping is needed.
                # Let's proceed assuming all videos are for the `booth_id_from_request` for this simplified step.
                # If you have files like "booth_A_video1.mp4", "booth_B_video1.mp4" at the root,
                # you could check if s3_object_key contains the booth_id_from_request string.
                # Example:
                # if booth_id_from_request not in s3_object_key: # Very basic filter
                #    continue

                # For this example, let's make a simple "title" from the filename
                # and use the full s3_object_key as an "id" for now (though you might want more robust IDs)
                filename_only = os.path.basename(s3_object_key)
                title = os.path.splitext(filename_only)[0].replace('_', ' ').title() # Basic title generation

                video_metadata = {
                    "id": s3_object_key, # Using S3 key as a temporary ID
                    "booth_id": booth_id_from_request, # Assigning current booth_id
                    "title": title,
                    "description": f"Video file: {filename_only}",
                    "price": 9.99, # Placeholder price
                    "s3_bucket_name": S3_BUCKET_NAME,
                    "s3_object_key": s3_object_key,
                    "purchased": False, # Default purchase status
                    "video_url": None # Will be filled next
                }

                try:
                    presigned_url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_object_key},
                        ExpiresIn=3600
                    )
                    video_metadata['video_url'] = presigned_url
                except ClientError as e:
                    print(f"Error generating pre-signed URL for {s3_object_key}: {e}")
                
                listed_videos_for_booth.append(video_metadata)
        
    except ClientError as e:
        print(f"Error listing objects from S3 bucket {S3_BUCKET_NAME}: {e}")
        return jsonify(error=f"Could not list S3 objects: {str(e)}"), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify(error=f"An unexpected server error occurred: {str(e)}"), 500

    return jsonify(listed_videos_for_booth)


# --- Purchase route (can remain similar, but 'ALL_VIDEOS_METADATA' is gone) ---
# For now, this purchase route won't work correctly because we don't have a persistent
# way to store the "purchased" status. We'll address this later with a database.
# Let's comment it out or simplify it to avoid confusion for this step.
"""
@app.route('/api/purchase_video/<path:video_s3_key>', methods=['POST']) # Use s3_key as ID
def purchase_video(video_s3_key):
    # This is a placeholder. In a real app, you'd update a database.
    # For now, we can't really "mark as purchased" in a way that persists or
    # is easily retrievable without a database and the ALL_VIDEOS_METADATA list.
    print(f"Attempt to purchase video with S3 key: {video_s3_key}")
    # Simulate finding it and marking it (won't actually change anything meaningfully without DB)
    return jsonify(success=True, message=f"Purchase simulated for {video_s3_key}. Status not persisted.", 
                   video_data={"id": video_s3_key, "s3_key": video_s3_key, "purchased": True}) # Fake data
"""

if __name__ == '__main__':
    app.run(debug=True)