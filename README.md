# Pharmacy Data ETL

[![GitHub Release](https://img.shields.io/github/release/nhsuk/pharmacy-data-etl.svg)](https://github.com/nhsuk/pharmacy-data-etl/releases/latest/)
[![Greenkeeper badge](https://badges.greenkeeper.io/nhsuk/pharmacy-data-etl.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nhsuk/pharmacy-data-etl.svg?branch=master)](https://travis-ci.org/nhsuk/pharmacy-data-etl)
[![Coverage Status](https://coveralls.io/repos/github/nhsuk/pharmacy-data-etl/badge.svg)](https://coveralls.io/github/nhsuk/pharmacy-data-etl)
[![Known Vulnerabilities](https://snyk.io/test/github/nhsuk/pharmacy-data-etl/badge.svg)](https://snyk.io/test/github/nhsuk/pharmacy-data-etl)

> ETL to retrieve Pharmacy information from
> [NHS Organisation > API](http://api.nhs.uk/organisations) based on listings
> in [NHS Choices > Syndication](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx)
> and store as JSON.

## Run process

In order for the process to access the syndication feed an API key is required.
Details of registration are available on
[NHS Choices](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx).
The application needs the API key available within the environment as the
variable `SYNDICATION_API_KEY`.

The output is uploaded to Azure Blob Storage, a suitable connection string
should be set in the `AZURE_STORAGE_CONNECTION_STRING` variable. For further
details see
[Azure Blob Storage](https://azure.microsoft.com/en-gb/services/storage/blobs/).

The ETL retrieves the ODS codes for all Pharmacies from the Syndication API,
then visits the organisation API to obtain full pharmacy information. An
initial list of ODS codes is retrieved from Azure storage. The most recently
created file beginning `pharmacy-seed-ids` is used as the source of the data.
If no file is found the ETL will not run. Once the IDs are loaded, the most
recent pharmacy data is retrieved from Azure Blob Storage for the particular
version of the ETL.

The ETL version is included along with a datestamp to enable a full rescan if
the data structure changes. If no file is found, the entire dataset will be
rebuilt.
The `modifiedsince` end point of Syndication is used to determine any changed
or new pharmacies. The oldest date from the ID or the data filenames will be
used as the `modifiedsince` date. Any pharmacies that have been modified since
the ETL previously ran, or are not present in the previous data will be
reloaded from Syndication.

Once the initial scan is complete, failed pharmacies will be revisited. ODS
codes for records still failing after the second attempt are listed in a
`summary.json` file.

If `NODE_ENV=production` running `scripts/start` will bring up a docker
container and initiate the scrape at a scheduled time, GMT. The default is
11pm. The time of the scrape can be overridden by setting the environment
variable `ETL_SCHEDULE`. e.g. `export ETL_SCHEDULE='25 15 * * *'` will start
the processing at 3:25pm. Note: the container time is GMT and does not take
account of daylight saving, you may need to subtract an hour from the time if
it is currently BST.

During local development it is useful to run the scrape at any time. This is
possible by running `node app.js` (with the appropriate env vars set).

Further details on node-schedule available
[here](https://www.npmjs.com/package/node-schedule)

The scheduler can be completely disabled by setting the `DISABLE_SCHEDULER`
variable to `true`. This sets the run date to run once in the future on Jan
1st, 2100.

A successful scrape will result in the file `pharmacy-data.json` being written
to the `output` folder and to the Azure storage location specified in the
environmental variables.

The files uploaded to Azure Blob Storage are:

- `summary-YYYYMMDD-VERSION.json`
- `pharmacy-seed-ids-YYYYMMDD.json`
- `pharmacy-data-YYYYMMDD-VERSION.json`
- `pharmacy-data.json`

 `YYYYMMDD` is the current year, month and date. `VERSION` is the current
 major & minor version of the ETL as defined in the `package.json`.

The ETL may also be run locally with `yarn start`.

The output JSON will be an array of objects in the format shown in the
[Sample Pharmacy Data](sample-pharmacy-data.json)

## Environment variables

Environment variables are expected to be managed by the environment in which
the application is being run. This is best practice as described by
[twelve-factor](https://12factor.net/config).

| Variable                          | Description                                                                                                 | Default                | Required |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------- | :-------------------- | :------- |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure storage connection string                                                                             |                       | yes      |
| `CONTAINER_NAME`                  | Azure storage container name                                                                                | etl-output            |          |
| `DISABLE_SCHEDULER`               | set to 'true' to disable the scheduler                                                                      | false                 |          |
| `ETL_SCHEDULE`                    | Time of day to run the upgrade. [Syntax](https://www.npmjs.com/package/node-schedule#cron-style-scheduling) | 0 23 * * * (11:00 pm) |          |
| `LOG_LEVEL`                       | [log level](https://github.com/trentm/node-bunyan#levels)                                                   | Depends on `NODE_ENV` |          |
| `NODE_ENV`                        | node environment                                                                                            | development           |          |
| `SYNDICATION_API_KEY`             | API key to access syndication                                                                               |                       | yes      |

## Architecture Decision Records

This repo uses
[Architecture Decision Records](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
to record architectural decisions for this project.
They are stored in [doc/adr](doc/adr).
