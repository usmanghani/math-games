#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION="${VERCEL_NODE_VERSION:-22.10.0}"
NODE_ARCHIVE="node-v${NODE_VERSION}-linux-x64.tar.xz"
CACHE_DIR=".vercel-node-${NODE_VERSION}"

if [[ ! -x "${CACHE_DIR}/bin/node" ]]; then
  rm -rf "${CACHE_DIR}"
  mkdir -p "${CACHE_DIR}"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_ARCHIVE}" \
    | tar -xJf - --strip-components=1 -C "${CACHE_DIR}"
fi

export PATH="${PWD}/${CACHE_DIR}/bin:$PATH"
export NODE_VERSION="${NODE_VERSION}"
corepack enable pnpm >/dev/null 2>&1
exec "$@"
