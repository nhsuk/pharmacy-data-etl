# Pharmacy Data ETL

[![GitHub Release](https://img.shields.io/github/release/nhsuk/pharmacy-data-etl.svg)](https://github.com/nhsuk/pharmacy-data-etl/releases/latest/)
[![Greenkeeper badge](https://badges.greenkeeper.io/nhsuk/pharmacy-data-etl.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/nhsuk/pharmacy-data-etl.svg?branch=master)](https://travis-ci.org/nhsuk/pharmacy-data-etl)
[![Coverage Status](https://coveralls.io/repos/github/nhsuk/pharmacy-data-etl/badge.svg)](https://coveralls.io/github/nhsuk/pharmacy-data-etl)
[![Known Vulnerabilities](https://snyk.io/test/github/nhsuk/pharmacy-data-etl/badge.svg)](https://snyk.io/test/github/nhsuk/pharmacy-data-etl)

> ETL to retrieve Pharmacy information from [NHS Organisation API](http://api.nhs.uk/organisations) based on listings in [NHS Choices Syndication](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx)
and store as JSON.

## Run process

In order for the process to access the syndication feed an API key is required.
Details of registration are available on
[NHS Choices](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx).
The application needs the API key available within the environment as the variable `SYNDICATION_API_KEY`.

The output is uploaded to an Azure storage blob, a suitable connection string should be set in the `AZURE_STORAGE_CONNECTION_STRING` variable.
For further details see [Azure Blob Storage](https://azure.microsoft.com/en-gb/services/storage/blobs/).

The ETL retrieves the ODS codes for all Pharmacies from the Syndication API, then visits the organisation API to obtain full pharmacy information.

Once the initial scan is complete, failed pharmacies will be revisited. ODS codes for records still failing after the second attempt are listed in a `summary.json` file.

Running `scripts/start` will bring up a docker container hosting a web server and initiate the scrape at a scheduled time, GMT.
The default is 11pm. To test locally set an environment variable `ETL_SCHEDULE` to a new time,
i.e. `export ETL_SCHEDULE='25 15 * * *'` to start the processing a 3:25pm. Note: the container time is GMT and does not take account of daylight saving, you may need to subtract an hour from the time if it is currently BST.

Further details on node-schedule available [here](https://www.npmjs.com/package/node-schedule)

+The scheduler can be completely disabled by setting the `DISABLE_SCHEDULER` variable to `true`. This sets the run date to run once in the future on Jan 1st, 2100.

A successful scrape will result in the file `pharmacy-data.json` being written to the `output` folder. This file will also be uploaded to the Azure storage location specified in the environmental variables. The file will be uploaded twice, once to overwrite the current file at `pharmacy-data.json` and another date-stamped file at `YYYY-MM-DD-pharmacy-data.json`.

The ETL may also be run locally with `yarn start`

The ETL is re-entrant - if the process is interrupted via `ctrl + c` while the ODS code list is being built, it will skip the pages or records it has already scanned. State is also persisted every 100 records in case of system failure.

To clear the state before starting when running locally run `yarn run start-clear`.
When running in a container The `start` command will always clear the volumes and start again.

To run the ETL end to end, but with only 3 pages of 90 pharmacies, rather than the full 385+ pages run `scripts/start-small`.
The small ETL can be run locally with the command `yarn run start-small` or `yarn run start-small-clear` to remove any in progress files.

The output JSON will be an array of objects in the format shown in the [Sample Pharmacy Data](sample-pharmacy-data.json)

## Environment variables

Environment variables are expected to be managed by the environment in which
the application is being run. This is best practice as described by
[twelve-factor](https://12factor.net/config).

| Variable                           | Description                                                                                                 | Default                | Required |
| :--------------------------------- | :---------------------------------------------------------------------------------------------------------- | ---------------------- | :------- |
| `AZURE_STORAGE_CONNECTION_STRING`  | Azure storage connection string                                                                             |                        | yes      |
| `CONTAINER_NAME`                   | Azure storage container name                                                                                | etl-output             |          |
| `DISABLE_SCHEDULER`                | set to 'true' to disable the scheduler                                                                      | false                  |          |
| `ETL_SCHEDULE`                     | Time of day to run the upgrade. [Syntax](https://www.npmjs.com/package/node-schedule#cron-style-scheduling) | 0 23 * * * (11:00 pm)  |          |
| `LOG_LEVEL`                        | [log level](https://github.com/trentm/node-bunyan#levels)                                                   | Depends on `NODE_ENV`  |          |
| `NODE_ENV`                         | node environment                                                                                            | development            |          |
| `SYNDICATION_API_KEY`              | API key to access syndication                                                                               |                        | yes      |

## Architecture Decision Records

This repo uses
[Architecture Decision Records](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
to record architectural decisions for this project.
They are stored in [doc/adr](doc/adr).
