#!/bin/bash

# ==================
# == Env settings ==
# ==================

# ======================
# == Process the args ==
# ======================

# 1. Default values of arguments
# Arg: -f
# Determine force download asserts, default is not
FORCE_DOWNLOAD=false

# Arg: -l or --lang
# Determine the language to show, default is en
LANGUAGE="en_US"

# Arg: --url
# Determine the source URL to download files
SOURCE_URL="https://raw.githubusercontent.com/lobehub/lobe-chat/main"

# Arg: --host
# Determine the server host
HOST=""

# 2. Parse script arguments
while getopts "fl:-:" opt; do
  case $opt in
    f)
      FORCE_DOWNLOAD=true
      ;;
    l)
      LANGUAGE=$OPTARG
      ;;
    -)
      case "${OPTARG}" in
        lang)
          LANGUAGE="${!OPTIND}"
          OPTIND=$(($OPTIND + 1))
          ;;
        url)
          SOURCE_URL="${!OPTIND}"
          OPTIND=$(($OPTIND + 1))
          ;;
        host)
          HOST="${!OPTIND}"
          OPTIND=$(($OPTIND + 1))
          ;;
        *)
          echo "Usage: $0 [-f] [-l language|--lang language] [--url source] [--host serverhost]" >&2
          exit 1
          ;;
      esac
      ;;
    *)
      echo "Usage: $0 [-f] [-l language|--lang language] [--url source]" >&2
      exit 1
      ;;
  esac
done

# ===============
# == Variables ==
# ===============
# File list
SUB_DIR="docker-compose/local"
FILES=(
  "$SUB_DIR/docker-compose.yml"
  "$SUB_DIR/.env.example"
  "$SUB_DIR/init_data.json"
  "$SUB_DIR/s3_data.tar.gz"
)

# Supported languages and messages
# Arg: -l --lang
# If the language is not supported, default to English
# Function to show messages
show_message() {
  local key="$1"
  case $key in
    downloading)
      case $LANGUAGE in
        zh_CN)
          echo "正在下载文件..."
          ;;
        *)
          echo "Downloading files..."
          ;;
      esac
      ;;
    downloaded)
      case $LANGUAGE in
        zh_CN)
          echo " 已经存在，跳过下载。"
          ;;
        *)
          echo " already exists, skipping download."
          ;;
      esac
      ;;
    extracted_success)
      case $LANGUAGE in
        zh_CN)
          echo " 解压成功到目录："
          ;;
        *)
          echo " extracted successfully to directory: "
          ;;
      esac
      ;;
    extracted_failed)
      case $LANGUAGE in
        zh_CN)
          echo " 解压失败。"
          ;;
        *)
          echo " extraction failed."
          ;;
      esac
      ;;
    file_not_exists)
      case $LANGUAGE in
        zh_CN)
          echo " 不存在。"
          ;;
        *)
          echo " does not exist."
          ;;
      esac
      ;;
    tips_run_command)
      case $LANGUAGE in
        zh_CN)
          echo "您已经完成了所有配置文件的下载。请运行以下命令启动LobeChat："
          ;;
        *)
          echo "You have completed downloading all configuration files. Please run this command to start LobeChat:"
          ;;
      esac
      ;;
    tips_show_documentation)
      case $LANGUAGE in
        zh_CN)
          echo "完整的环境变量在'.env'中可以在文档中找到："
          ;;
        *)
          echo "Full environment variables in the '.env' can be found at the documentation on "
          ;;
      esac
      ;;
    tips_show_documentation_url)
      case $LANGUAGE in
        zh_CN)
          echo "https://lobehub.com/zh/docs/self-hosting/environment-variables"
          ;;
        *)
          echo "https://lobehub.com/docs/self-hosting/environment-variables"
          ;;
      esac
      ;;
    tips_warning)
      case $LANGUAGE in
        zh_CN)
          echo "警告：不要在生产环境中使用此演示应用程序！！！"
          ;;
        *)
          echo "Warning: do not use this demo application in production!!!"
          ;;
      esac
      ;;
  esac
}

# Function to download files
download_file() {
  local file_url="$1"
  local local_file="$2"

  if [ "$FORCE_DOWNLOAD" = false ] && [ -e "$local_file" ]; then
    echo "$local_file" $(show_message "downloaded")
    return 0
  fi

  wget -q --show-progress "$file_url" -O "$local_file"
}

extract_file() {
  local file_name=$1
  local target_dir=$2

  if [ -e "$file_name" ]; then
    tar -zxvf "$file_name" -C "$target_dir" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "$file_name" $(show_message "extracted_success") "$target_dir"
    else
      echo "$file_name" $(show_message "extracted_failed")
      exit 1
    fi
  else
    echo "$file_name" $(show_message "file_not_exists")
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
  local text="$1"                                   # Get input texts
  local color="${2:-reset}"                         # Get color, default to reset
  local term_width=$(tput cols)                     # Get terminal width
  local text_length=${#text}                        # Get text length
  local padding=$(((term_width - text_length) / 2)) # Get padding
  # Check if the color is valid
  if [[ -z "${colors[$color]}" ]]; then
    echo "Invalid color specified. Available colors: ${!colors[@]}"
    return 1
  fi
  # Print the text with padding
  printf "%*s${colors[$color]}%s${colors[reset]}\n" $padding "" "$text"
}

# Download files asynchronously
download_file "$SOURCE_URL/${FILES[0]}" "docker-compose.yml"
download_file "$SOURCE_URL/${FILES[1]}" ".env"
download_file "$SOURCE_URL/${FILES[2]}" "init_data.json"
download_file "$SOURCE_URL/${FILES[3]}" "s3_data.tar.gz"

# Extract .tar.gz file without output
extract_file "s3_data.tar.gz" "."
rm s3_data.tar.gz

# ==========================
# === Regenerate Secrets ===
# ==========================

# Generate CASDOOR_SECRET
CASDOOR_SECRET=$(openssl rand -base64 32)
if [ $? -ne 0 ]; then
  echo "[Warning] Failed to generate CASDOOR_SECRET with openssl, keep default"
  exit 1
else
  # Search and replace the value of CASDOOR_SECRET in .env
  sed -i "s|^AUTH_CASDOOR_SECRET=.*|AUTH_CASDOOR_SECRET=${CASDOOR_SECRET}|" .env
  # replace `clientSecrect` in init_data.json
  sed -i "s/"dbf205949d704de81b0b5b3603174e23fbecc354"/${CASDOOR_SECRET}/" init_data.json
fi

# Generate Minio S3 access key
S3_SECRET_ACCESS_KEY=$(openssl rand -base64 32)
if [ $? -ne 0 ]; then
  echo "[Warning] Failed to generate S3_SECRET_ACCESS_KEY with openssl, keep default"
  exit 1
else
  # Search and replace the value of S3_SECRET_ACCESS_KEY in .env
  sed -i "s|^S3_SECRET_ACCESS_KEY=.*|S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}|" .env
fi

# Generate Minio S3 user
MINIO_ROOT_USER="admin"
MINIO_ROOT_PASSWORD=$(openssl rand -base64 16)
if [ $? -ne 0 ]; then
  echo "[Warning] Failed to generate MINIO_ROOT_PASSWORD with openssl, keep default"
  exit 1
else
  # Search and replace the value of MINIO_ROOT_PASSWORD in .env
  sed -i "s|^MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}|" .env
  # Modify user
  sed -i "s/^MINIO_ROOT_USER=.*/MINIO_ROOT_USER=${MINIO_ROOT_USER}/" .env
fi

# Modify the .env file if the host is specified
if [ -n "$HOST" ]; then
  # Modify env
  sed -i "s/localhost/$HOST/g" .env
  # Modify casdoor init data
  sed -i "s/localhost/$HOST/g" init_data.json
fi

# Display configuration reports
echo -e "\nConfiguration details:\n"
if [ -n "$HOST" ]; then
  echo -e "Server Host: $HOST"
fi
echo -e "Casdoor: \n - Username: admin\n  - Password: 123\n  - Client Secret: ${CASDOOR_SECRET}"
echo -e "Minio S3: \n - MinIO User: ${MINIO_ROOT_USER}\n  - MinIO PassWord: ${MINIO_ROOT_PASSWORD}\n  - MinIO Access Key: ${S3_SECRET_ACCESS_KEY}\n"

# Display final message
printf "\n%s\n\n" "$(show_message "tips_run_command")"
print_centered "docker compose up -d" "green"
printf "\n%s" "$(show_message "tips_show_documentation")"
printf "%s\n" $(show_message "tips_show_documentation_url")
printf "\n\e[33m%s\e[0m\n" "$(show_message "tips_warning")"