# Pharmacy Data ETL
ETL to retrieve pharmacy data from NHS Organisations API

ETL to retrieve GP surgery information from [NHS Organisation API](http://api.nhs.uk/organisations) based on listings in [NHS Choices Syndication](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx)
and store as JSON.

## Run process

In order for the process to access the syndication feed an API key is required.
Details of registration are available on
[NHS Choices](http://www.nhs.uk/aboutNHSChoices/professionals/syndication/Pages/Webservices.aspx).
The application needs the api key available within the environment as the variable `SYNDICATION_API_KEY`.

The ETL retrieves the ODS codes for all Pharmacies from the Syndication API, then visits the organisation API obtain full pharmacy information.

Once the initial scan is complete, failed pharmacies will be revisited. ODS codes for records still failing after the second attempt are listed in a `summary.json` file.

Running `scripts/start` will bring up a docker container hosting a web server and initiate the scrape at a scheduled time.
The default is 11pm. To test locally set an environment variable `ETL_SCHEDULE` to a new time,
i.e. `export ETL_SCHEDULE='25 15 * * *'` to start the processing a 3:25pm. Note: the container time is GMT and does not take account of daylight saving, you may need to subtract an hour from the time if it is currently BST.

Further details available [here](https://www.npmjs.com/package/node-schedule)

A successful scrape will result in the file `pharmacy-data.json` being written to the `output` folder. This file will also be uploaded to the Azure storage location specified in the environmental variables. The file will be uploaded twice, once to overwrite the current file at `pharmacy-data.json` and another date-stamped file at `YYYY-MM-DD-pharmacy-data.json`.

The ETL may also be run locally with `yarn start`

The ETL is re-entrant - if the process is interrupted via `ctrl + c` while the ODS code list is being built, it will skip the pages or records it has already scanned. State is also persisted every 100 records in case of system failure.

To clear the state before starting when running locally run `yarn run start-clear`.
When running in a container The `start` command will always clear the volumes and start again.

To run the ETL end to end, but with only 3 pages of 90 pharmacies, rather than the full 385+ pages run `scripts/start-small`. 
The small ETL can be run locally with the command `yarn run start-small` or `yarn run start-small-clear` to remove any in progress files.

The output JSON will be an array of objects in the format shown in the [Sample Pharmacy Data](sample-pharmacy-data.json)

## Architecture Decision Records

This repo uses
[Architecture Decision Records](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
to record architectural decisions for this project.
They are stored in [doc/architecture/decisions](doc/architecture/decisions).
