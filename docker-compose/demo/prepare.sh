#!/bin/bash
SOURCE_URL="https://raw.githubusercontent.com/cy948/lobe-chat/run/casdoor"
FILES=(
  "docker-compose/demo/docker-compose.yml"
  "docker-compose/demo/.env.example"
  "docker-compose/demo/init_data.json"
  "docker-compose/demo/s3_data.tar.gz"
)

# Function to download files
download_file() {
  local file_url="$1"
  local local_file="$2"

  if [ -e "$local_file" ]; then
    echo "$local_file already exists, skipping download."
    return 0
  fi

  wget "$file_url" -O "$local_file"
  if [ $? -eq 0 ]; then
    echo "$local_file downloaded successfully."
    return 0
  else
    echo "$local_file download failed."
    exit 1
  fi
}

# Download files
download_file "$SOURCE_URL/${FILES[0]}" "docker-compose.yml"
download_file "$SOURCE_URL/${FILES[1]}" ".env"
download_file "$SOURCE_URL/${FILES[2]}" "init_data.json"
download_file "$SOURCE_URL/${FILES[3]}" "s3_data.tar.gz"

# Extract s3_data.tar.gz file without output
if [ -e "s3_data.tar.gz" ]; then
  tar -zxvf s3_data.tar.gz > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "s3_data.tar.gz extracted successfully."
  else
    echo "s3_data.tar.gz extraction failed."
    exit 1
  fi
fi

# Display final message
echo -e "\nYou have completed downloading all configuration files. Next steps:"
echo -e "1. Edit the environment variables in the '.env' file if needed. You can find the documentation on: "
echo -e "https://lobehub.com/docs/self-hosting/environment-variables"
echo -e "2. Run:"
echo -e "\e[32mdocker compose up\e[0m"
