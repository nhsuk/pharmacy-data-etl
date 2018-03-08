0.6.0 / 2018-03-TBC
==================
- Use scheduler in `production` mode only
- Use date embedded within the file name rather than modified date

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
