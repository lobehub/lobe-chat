#!/bin/bash
SOURCE_URL="https://raw.githubusercontent.com/cy948/lobe-chat/run/casdoor"
SUB_DIR=docker-compose/local
FILES=(
  "$SUB_DIR/docker-compose.yml"
  "$SUB_DIR/.env.example"
  "$SUB_DIR/init_data.json.tar.gz"
  "$SUB_DIR/s3_data.tar.gz"
)

# Default value for force download
FORCE_DOWNLOAD=false

# Parse script arguments
while getopts "f" opt; do
  case $opt in
    f)
      FORCE_DOWNLOAD=true
      ;;
    *)
      echo "Usage: $0 [-f]"
      exit 1
      ;;
  esac
done

# Function to download files
download_file() {
  local file_url="$1"
  local local_file="$2"

  if [ "$FORCE_DOWNLOAD" = false ] && [ -e "$local_file" ]; then
    echo "$local_file already exists, skipping download."
    return 0
  fi

  wget -q --show-progress "$file_url" -O "$local_file" &
}

extract_file() {
  local file_name=$1
  local target_dir=$2

  if [ -e "$file_name" ]; then
    tar -zxvf "$file_name" -C "$target_dir" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "$file_name extracted successfully to $target_dir."
    else
      echo "$file_name extraction failed."
      exit 1
    fi
  else
    echo "$file_name does not exist."
    exit 1
  fi
}

# Define colors
declare -A colors
colors=(
    [black]="\e[30m"
    [red]="\e[31m"
    [green]="\e[32m"
    [yellow]="\e[33m"
    [blue]="\e[34m"
    [magenta]="\e[35m"
    [cyan]="\e[36m"
    [white]="\e[37m"
    [reset]="\e[0m"
)

print_centered() {
    local text="$1"  # Get input texts
    local color="${2:-reset}"  # Get color, default to reset
    local term_width=$(tput cols)  # Get terminal width
    local text_length=${#text}  # Get text length
    local padding=$(( (term_width - text_length) / 2 ))  # Get padding
    # Check if the color is valid
    if [[ -z "${colors[$color]}" ]]; then
        echo "Invalid color specified. Available colors: ${!colors[@]}"
        return 1
    fi
    # Print the text with padding
    printf "%*s${colors[$color]}%s${colors[reset]}\n" $padding "" "$text"
}

# Download files
download_file "$SOURCE_URL/${FILES[2]}" "init_data.json.tar.gz"
download_file "$SOURCE_URL/${FILES[3]}" "s3_data.tar.gz"
download_file "$SOURCE_URL/${FILES[0]}" "docker-compose.yml"
download_file "$SOURCE_URL/${FILES[1]}" ".env"

# Wait for download job finishes
wait

# Extract .tar.gz file without output
extract_file "s3_data.tar.gz" "."
extract_file "init_data.json.tar.gz" "."

# Display final message
echo -e "\nYou have completed downloading all configuration files. Next steps:"
echo -e "1. Edit the environment variables in the '.env' file if needed. You can find the documentation on: "
print_centered "https://lobehub.com/docs/self-hosting/environment-variables" "blue"
echo -e "2. Run:"
print_centered "docker compose up" "green"
