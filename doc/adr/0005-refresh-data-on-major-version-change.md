# 5. refresh data on major version change

Date: 2018-02-14

## Status

Accepted

## Context

Data structure may change between releases of the ETL.
The ETL uses a scrape of previous data to reduce unnecessary work.

## Decision

The major version will be included in the seed data file to identify a change of data structure.

## Consequences

If the major version changes a scrape of all the pharmacies will occur.
If is assumed that any data structure change will be identified as a major version change.
Any major version changes that does not alter the data structure will also force a scrape.
