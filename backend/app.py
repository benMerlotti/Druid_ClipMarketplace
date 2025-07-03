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
S3_BUCKET_NAME = "druidproductions-archive" # <<< REPLACE THIS!

VIDEO_FOLDER_NAME = "03_Video"

# --- Flask Routes (API Endpoints) ---

@app.route('/api/message')
def get_message():
    return jsonify(message="Hello from Flask S3 Dynamic Backend!")

@app.route('/api/clients')
def list_clients():

    # Use the named profile if you configured one
    session = boto3.Session(profile_name='druid')
    s3_client = session.client('s3')
    
    clients = []
    try:
        # To list top-level "folders", we list objects with a delimiter of '/'
        # and don't specify a prefix. The result will be in 'CommonPrefixes'.
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Delimiter='/')

        if 'CommonPrefixes' in response:
            for prefix_data in response['CommonPrefixes']:
                # The 'Prefix' value will be the folder name, e.g., "MesseFrankfurt/"
                # We strip the trailing '/' to get just the name.
                client_name = prefix_data.get('Prefix').strip('/')
                clients.append({"name": client_name})

    except ClientError as e:
        print(f"Error listing clients (folders) from S3: {e}")
        return jsonify(error=f"Could not list S3 clients: {str(e)}"), 500

    return jsonify(clients) # Returns a list like: [{"name": "MesseFrankfurt"}, {"name": "AnotherClient"}]

@app.route('/api/conventions')
def list_conventions():
    
    company_name = request.args.get('company')
    if not company_name:
        return jsonify(error="A 'company' parameter is required."), 400
    

    # Use the named profile if you configured one
    session = boto3.Session(profile_name='druid')
    s3_client = session.client('s3')
    
    conventions = []
    try:
        s3_prefix_to_search = f"{company_name}/"

        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=s3_prefix_to_search, Delimiter='/')

        if 'CommonPrefixes' in response:
            for prefix_data in response['CommonPrefixes']:
                # The 'Prefix' value will be something like "Messe-Frankfurt/ProlightAndSound2024/"
                full_prefix = prefix_data.get('Prefix')
                
                # We need to remove the company part and the slashes to get just the convention name
                convention_name = full_prefix.replace(s3_prefix_to_search, '', 1).strip('/')
                
                if convention_name: # Make sure it's not an empty string
                    conventions.append({"name": convention_name})

    except ClientError as e:
        # Update the error message to be more specific
        print(f"Error listing conventions for '{company_name}': {e}")
        return jsonify(error=f"Could not list S3 conventions for {company_name}: {str(e)}"), 500

    return jsonify(conventions) # <-- FIX 4: Return the correct 'conventions' list

@app.route('/api/videos')
def get_videos_for_convention():
    company_name = request.args.get('company')
    convention_name = request.args.get('convention')

     # --- ADD THESE DEBUGGING LINES ---
    print("--- DEBUGGING PARAMETERS ---")
    print(f"Received company_name: '{company_name}' (Type: {type(company_name)})")
    print(f"Received convention_name: '{convention_name}' (Type: {type(convention_name)})")
    print("--- END DEBUGGING ---")

    if company_name is None or convention_name is None or company_name.strip() == "" or convention_name.strip() == "":
        return jsonify(error="Missing or empty 'company' or 'convention' parameter"), 400
    
    s3_prefix = f"{company_name}/{convention_name}/{VIDEO_FOLDER_NAME}/"
    print(f"Listing objects from S3 with prefix: {s3_prefix}") # For debugging

    session = boto3.Session(profile_name='druid')
    s3_client = session.client('s3')

    listed_videos = []

    try:
        # List objects using the constructed prefix
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=s3_prefix)

        if 'Contents' in response:
            for item in response['Contents']:
                s3_object_key = item['Key']

                # Skip the folder placeholder itself if S3 returns it (sometimes happens)
                if s3_object_key.endswith('/'):
                    continue

                # Generate metadata on the fly
                filename_only = os.path.basename(s3_object_key)
                title = os.path.splitext(filename_only)[0].replace('_', ' ').title()

                video_metadata = {
                    "id": s3_object_key,
                    "title": title,
                    "company": company_name,
                    "convention": convention_name,
                    "s3_object_key": s3_object_key,
                    "purchased": False, # Placeholder
                    "price": 9.99, # Placeholder
                    "video_url": None
                }

                try:
                    # Generate the pre-signed URL for this specific object
                    presigned_url = s3_client.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_object_key},
                        ExpiresIn=3600
                    )
                    video_metadata['video_url'] = presigned_url
                except ClientError as e:
                    print(f"Error generating pre-signed URL for {s3_object_key}: {e}")
                
                listed_videos.append(video_metadata)
        
    except ClientError as e:
        print(f"Error listing objects from S3: {e}")
        return jsonify(error=f"Could not list S3 objects: {str(e)}"), 500

    return jsonify(listed_videos)

# You can keep the old routes for now or remove them
# @app.route('/api/message') ...
# @app.route('/api/purchase_video/...') ...

if __name__ == '__main__':
    app.run(debug=True)