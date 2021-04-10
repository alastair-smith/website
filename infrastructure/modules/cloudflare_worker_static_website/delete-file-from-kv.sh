#!/bin/sh

set -e

# setup

print_help() {
  echo "Usage: write-file-to-kv.sh --key <key> --namespace <namespace>" 
  echo "  options:"
  echo "    -h, --help                       display this help message"
  echo "    -k, --key <key>                  key for the KV entry"
  echo "    -n, --namespace <namespace>      KV namespace to containing the entry"
}

while true; do
  if [ -z "$1" ]; then
    break
  fi
  case "$1" in
    -h|--help)
      print_help
      exit 0;;
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

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "CLOUDFLARE_API_TOKEN environment variable needs to be set" >&2
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "CLOUDFLARE_ACCOUNT_ID environment variable needs to be set" >&2
  exit 1
fi

# start

delete_status=$(curl -X DELETE -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/storage/kv/namespaces/$namespace/values/$key" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: text/plain" -w "%{http_code}" -o /dev/null)

if [ "$delete_status" = "200" ]; then
  echo "Delete successful"
  exit 0
else
  echo "Delete failure $delete_status"
  exit 1
fi
