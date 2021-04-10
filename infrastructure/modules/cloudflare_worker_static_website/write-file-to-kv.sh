#!/bin/sh

set -e

# setup

print_help() {
  echo "Usage: write-file-to-kv.sh --key <key> --file-path <file-path> --namespace <namespace>" 
  echo "  options:"
  echo "    -h, --help                       display this help message"
  echo "    -f, --file-path <file-path>      path of the file to upload"
  echo "    -k, --key <key>                  key for the KV entry"
  echo "    -n, --namespace <namespace>      KV namespace to store the entry"
}

while true; do
  if [ -z "$1" ]; then
    break
  fi
  case "$1" in
    -h|--help)
      print_help
      exit 0;;
    -f|--file-path)
      file_path="$2"
      shift 2;;
    -k|--key)
      key="$2"
      shift 2;;
    -n|--namespace)
      namespace="$2"
      shift 2;;
    --)
      break;;
     *)
      print_help
      exit 1;;
  esac
done

if [ -z "$key" ]; then
  echo "mandatory --key option not set" >&2
  exit 1
fi

if [ -z "$namespace" ]; then
  echo "mandatory --namespace option not set" >&2
  exit 1
fi

if [ -z "$file_path" ]; then
  echo "mandatory --file-path option not set" >&2
  exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "CLOUDFLARE_API_TOKEN environment variable needs to be set" >&2
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "CLOUDFLARE_ACCOUNT_ID environment variable needs to be set" >&2
  exit 1
fi

# start

upload_status=$(curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces/$namespace/values/$key" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: text/plain" --upload-file "$file_path" -w "%{http_code}" -o /dev/null)

if [ "$upload_status" = "200" ]; then
  echo "Upload successful"
  exit 0
else
  echo "Upload failure $upload_status"
  exit 1
fi
