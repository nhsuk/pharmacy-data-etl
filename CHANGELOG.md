0.8.1 / 2018-05-04
==================
- Add require enviroment var check for OUTPUT_FILE, update rancher config

0.8.0 / 2018-05-01
==================
- Refresh all records nightly to ensure removed/added records are picked up
- Use azure-data-service and etl-toolkit packages

0.7.0 / 2018-04-13
==================
- Upgrade to `eslint-config-nhsuk@0.14.0` and apply fixes
- Fix change record count tracking
- Downgrade Docker container to `node:8.9.4-alpine`
- Update npm dependencies

0.6.0 / 2018-03-14
==================
- Use scheduler in `production` mode only
- Use date embedded within file name rather than blob modified date for determining latest file
- Update npm dependencies
- Upgrade Docker container to `node:8.10.0-alpine`
- Store files with the date the run was started as opposed to when the run completed
- Include list of modifiedIds in summary
- Format `README`
- Refactor to common date regex and shared download function
- Move filenames into config
- Removed `seed-pharmacies.json` file as no longer required

0.5.1 / 2018-02-15
==================
- Use Syndications 'modified since' endpoint to perform incremental updates
- Use seed ODS code list and the data from last successful run as basis for next scrape
- Remove docker volume as no longer required

0.4.0 / 2018-01-09
==================
- Join Contiguous opening times
- Update npm dependencies

0.3.0 / 2017-11-16
==================
- Upgrade Docker container to `node:8.9.1-alpine`
- Remove redundant `--` for forwarding script options

0.2.0 / 2017-10-31
==================
- Call drain for an empty queue
- Use NHSUK bunyan logger
- Upgrade Docker container to `node:8.8.1-alpine`
- Update npm dependencies
- Correct schedule override env var in `README`

0.1.1 / 2017-10-24
==================
- Add CHANGELOG
- Change syndication URL from HTTP to HTTPS

0.1.0 / 2017-09-11
==================
- Initial release
