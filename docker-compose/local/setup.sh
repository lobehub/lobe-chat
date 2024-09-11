#!/bin/bash

# ==================
# == Env settings ==
# ==================
# Set locale to UTF-8 to support Chinese characters
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# ===============
# == Variables ==
# ===============
SOURCE_URL="https://raw.githubusercontent.com/cy948/lobe-chat/run/casdoor"
SUB_DIR=docker-compose/local
FILES=(
  "$SUB_DIR/docker-compose.yml"
  "$SUB_DIR/.env.example"
  "$SUB_DIR/init_data.json.tar.gz"
  "$SUB_DIR/s3_data.tar.gz"
)

# ======================
# == Process the args ==
# ======================

# Arg: -f 
# Determine force download asserts, default is not
FORCE_DOWNLOAD=false

# Arg: -l or --lang
# Determine the language to show, default is en
LANGUAGE="en_US"

# Parse script arguments
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
          LANGUAGE="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
          ;;
        *)
          echo "Usage: $0 [-f] [-l language|--lang language]" >&2
          exit 1
          ;;
      esac
      ;;
    *)
      echo "Usage: $0 [-f] [-l language|--lang language]" >&2
      exit 1
      ;;
  esac
done

# Supported languages and messages
declare -A MESSAGES
# en_US, zh_CN are Supported
MESSAGES["en_US"]="en_US"
MESSAGES["zh_CN"]="中文"
# Declare messages
MESSAGES["downloading_en_US"]="Downloading files..."
MESSAGES["downloading_zh_CN"]="正在下载文件..."

MESSAGES["downloaded_en_US"]=" already exists, skipping download."
MESSAGES["downloaded_zh_CN"]=" 已经存在，跳过下载。"

MESSAGES["extracted_success_en_US"]=" extracted successfully to directory: "
MESSAGES["extracted_success_zh_CN"]=" 解压成功到目录："

MESSAGES["extracted_failed_en_US"]=" extraction failed."
MESSAGES["extracted_failed_zh_CN"]=" 解压失败。"

MESSAGES["file_not_exists_en_US"]=" does not exist."
MESSAGES["file_not_exists_zh_CN"]=" 不存在。"

MESSAGES["tips_run_command_en_US"]="You have completed downloading all configuration files. Please run this command to start LobeChat:"
MESSAGES["tips_run_command_zh_CN"]="您已经完成了所有配置文件的下载。请运行以下命令启动LobeChat："

MESSAGES["tips_show_documentation_en_US"]="Full environment variables in the '.env' can be found at the documentation on "
MESSAGES["tips_show_documentation_zh_CN"]="完整的环境变量在'.env'中可以在文档中找到："

MESSAGES["tips_show_documentation_url_en_US"]="https://lobehub.com/docs/self-hosting/environment-variables"
MESSAGES["tips_show_documentation_url_zh_CN"]="https://lobehub.com/zh/docs/self-hosting/environment-variables"

MESSAGES["tips_warning_en_US"]="Warning: do not use this demo application in production!!!"
MESSAGES["tips_warning_zh_CN"]="警告：不要在生产环境中使用此演示应用程序！！！"

# Arg: -l --lang
# If the language is not supported, default to English
if [[ -z "${MESSAGES[$LANGUAGE]}" ]]; then
  LANGUAGE="en_US"
fi

# Function to show messages
show_message() {
  local message_key="$1"
  echo "${MESSAGES["$message_key"_"$LANGUAGE"]}"
}

# Function to download files
download_file() {
  local file_url="$1"
  local local_file="$2"

  if [ "$FORCE_DOWNLOAD" = false ] && [ -e "$local_file" ]; then
    echo "$local_file" $(show_message "downloaded")
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

# Download files asynchronously
download_file "$SOURCE_URL/${FILES[0]}" "docker-compose.yml"
download_file "$SOURCE_URL/${FILES[1]}" ".env"
download_file "$SOURCE_URL/${FILES[2]}" "init_data.json.tar.gz"
download_file "$SOURCE_URL/${FILES[3]}" "s3_data.tar.gz"

# Wait for download job finishes
wait

# Extract .tar.gz file without output
extract_file "s3_data.tar.gz" "."
extract_file "init_data.json.tar.gz" "."

# Display final message
echo -e "\n" $(show_message "tips_run_command") "\n"
print_centered "docker compose up" "green"
printf $(show_message "tips_show_documentation")
printf "\e[34m%s\e[0m\n" $(show_message "tips_show_documentation_url")
printf "\n\e[33m%s\e[0m\n" $(show_message "tips_warning")