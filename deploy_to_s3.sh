#!/bin/sh

grunt build

# copy over "under maintenance" html page
aws s3 cp prod/apps/under_maintenance/index.html s3://kidsvideos.io --acl "public-read"

# remove old ones
aws s3 rm s3://kidsvideos.io --recursive --exclude "index.html"

# copy over new stuff except index
aws s3 cp prod/apps/ s3://kidsvideos.io --recursive --exclude "index.html" --acl "public-read" --cache-control "max-age=1296000"

# copy over new index file when everything is ready
aws s3 cp prod/apps/index.html s3://kidsvideos.io --acl "public-read" --cache-control "max-age=1296000"