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
    # --- Get parameters from the request URL ---
    company_name = request.args.get('company')
    convention_name = request.args.get('convention')
    # Get page and per_page, providing defaults if they are missing
    try:
        page = int(request.args.get('page', 1)) # Default to page 1
        per_page = int(request.args.get('per_page', 24)) # Default to 24 items per page
    except ValueError:
        return jsonify(error="Invalid 'page' or 'per_page' parameter. Must be an integer."), 400

    if not company_name or not convention_name:
        return jsonify(error="Missing 'company' or 'convention' parameter"), 400

    s3_prefix = f"{company_name}/{convention_name}/{VIDEO_FOLDER_NAME}/"
    print(f"Listing S3 with prefix: {s3_prefix} for page {page}")

    
    session = boto3.Session(profile_name='druid', region_name='us-east-2')
    s3_client = session.client('s3')

    all_video_keys = []
    try:
        # We need to fetch all object keys first to paginate them.
        # Boto3 paginators handle fetching all results if they span multiple API calls.
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=S3_BUCKET_NAME, Prefix=s3_prefix)
        
        for page_of_results in pages:
            if 'Contents' in page_of_results:
                for item in page_of_results['Contents']:
                    if not item['Key'].endswith('/'): # Skip folders
                        all_video_keys.append(item['Key'])
    
    except ClientError as e:
        print(f"Error listing objects from S3: {e}")
        return jsonify(error=f"Could not list S3 objects: {str(e)}"), 500

    # --- PAGINATION LOGIC ---
    total_videos = len(all_video_keys)
    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    
    # Get just the keys for the current page
    keys_for_this_page = all_video_keys[start_index:end_index]
    
    processed_videos_for_page = []
    for s3_object_key in keys_for_this_page:
        # This part remains the same: generate metadata and a pre-signed URL for each key
        # ... (code to generate video_metadata and presigned_url) ...
        filename_only = os.path.basename(s3_object_key)
        title = os.path.splitext(filename_only)[0].replace('_', ' ').title()
        
        video_metadata = { "id": s3_object_key, "title": title, "price": 9 } # Your metadata structure

        try:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_object_key},
                ExpiresIn=3600
            )
            video_metadata['video_url'] = presigned_url
        except ClientError as e:
            print(f"Error generating pre-signed URL for {s3_object_key}: {e}")
            video_metadata['video_url'] = None
        
        processed_videos_for_page.append(video_metadata)

    # --- Construct the final JSON response ---
    # It's good practice to include pagination info in the response
    response_data = {
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_items": total_videos,
            "total_pages": -(-total_videos // per_page) # Ceiling division
        },
        "videos": processed_videos_for_page
    }

    return jsonify(response_data)

# You can keep the old routes for now or remove them
# @app.route('/api/message') ...
# @app.route('/api/purchase_video/...') ...

if __name__ == '__main__':
    app.run(debug=True)